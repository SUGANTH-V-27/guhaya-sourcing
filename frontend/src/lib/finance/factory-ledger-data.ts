import { loadInvoices } from "./invoice-storage";
import { calcInvoiceNetAmount } from "./invoice-calculations";

export type LedgerVoucherType = "Sales Invoice" | "Receipt" | "Credit Note" | "Journal Entry" | "Opening Balance";

export type LedgerTransaction = {
  id: string;
  date: string;
  particulars: string;
  vchType: LedgerVoucherType;
  vchNo: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  remarks?: string;
  invoiceId?: string;
};

export type FactoryLedgerSummary = {
  openingBalance: number;
  totalInvoiced: number;
  totalReceived: number;
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  transactions: LedgerTransaction[];
};

export function getFiscalYearFromDate(dateStr: string): string {
  if (!dateStr) return "2026-27";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "2026-27";
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed: 0=Jan, 3=Apr
  if (month >= 3) {
    return `${year}-${String(year + 1).slice(2)}`;
  } else {
    return `${year - 1}-${String(year).slice(2)}`;
  }
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(2)}`;
  } catch {
    return dateStr;
  }
}

export function formatInrCurrency(amount: number): string {
  return amount.toLocaleString("en-IN");
}

export const DEFAULT_FACTORIES: string[] = [];

const INITIAL_MOCK_TRANSACTIONS: Record<string, { openingBalance: number; entries: Omit<LedgerTransaction, "balance">[] }> = {};

export function getFactoryList(): string[] {
  const invoices = loadInvoices();
  const invoiceFactories = invoices
    .map((inv) => inv.invoiceTo?.company || inv.brandName)
    .filter(Boolean);

  const merged = Array.from(new Set([...DEFAULT_FACTORIES, ...invoiceFactories]));
  return merged.sort((a, b) => a.localeCompare(b));
}

export function getAvailableFiscalYears(): string[] {
  const currentFy = getFiscalYearFromDate(new Date().toISOString());
  const years = ["2026-27", "2025-26", "2024-25", "2023-24"];
  if (!years.includes(currentFy)) {
    years.unshift(currentFy);
  }
  return years;
}

export function computeFactoryLedger(
  factoryName: string,
  fiscalYear: string,
  openingBalance: number = 0
): FactoryLedgerSummary {
  if (!factoryName) {
    return {
      openingBalance: 0,
      totalInvoiced: 0,
      totalReceived: 0,
      totalDebit: 0,
      totalCredit: 0,
      closingBalance: 0,
      transactions: [],
    };
  }

  const rawEntries: Omit<LedgerTransaction, "balance">[] = [];

  // 1. Get from stored mock entries if matched
  const mock = INITIAL_MOCK_TRANSACTIONS[factoryName];
  if (mock) {
    for (const item of mock.entries) {
      if (getFiscalYearFromDate(item.date) === fiscalYear) {
        rawEntries.push(item);
      }
    }
  }

  // 2. Get from actual invoices matching factory
  const invoices = loadInvoices();
  const matchingInvoices = invoices.filter((inv) => {
    const target = (inv.invoiceTo?.company || inv.brandName || "").trim().toLowerCase();
    const isFy = getFiscalYearFromDate(inv.date) === fiscalYear;
    return target === factoryName.trim().toLowerCase() && isFy;
  });

  for (const inv of matchingInvoices) {
    const netAmount = calcInvoiceNetAmount(inv);
    // Add invoice debit
    rawEntries.push({
      id: `inv-${inv.id}`,
      date: inv.date,
      particulars: `Sales Invoice - ${inv.invoiceNumber} (${inv.brandName || "Garment PO"})`,
      vchType: "Sales Invoice",
      vchNo: inv.invoiceNumber,
      debit: netAmount,
      credit: null,
      invoiceId: inv.id,
    });

    // If invoice has payment registered
    if (inv.paidAmount && inv.paidAmount > 0 && inv.paymentDate) {
      rawEntries.push({
        id: `rec-${inv.id}`,
        date: inv.paymentDate,
        particulars: inv.remarks ? `Payment Received - ${inv.remarks}` : "Payment Received",
        vchType: "Receipt",
        vchNo: `REC-${inv.invoiceNumber}`,
        debit: null,
        credit: inv.paidAmount,
        remarks: inv.remarks,
        invoiceId: inv.id,
      });
    }
  }

  // Sort rawEntries chronologically
  rawEntries.sort((a, b) => a.date.localeCompare(b.date));

  // Compute running balance
  let currentBalance = openingBalance;
  const transactions: LedgerTransaction[] = [];
  let totalDebit = openingBalance;
  let totalCredit = 0;
  let totalInvoiced = 0;
  let totalReceived = 0;

  for (const entry of rawEntries) {
    if (entry.debit !== null) {
      currentBalance += entry.debit;
      totalDebit += entry.debit;
      totalInvoiced += entry.debit;
    }
    if (entry.credit !== null) {
      currentBalance -= entry.credit;
      totalCredit += entry.credit;
      totalReceived += entry.credit;
    }

    transactions.push({
      ...entry,
      balance: currentBalance,
    });
  }

  const closingBalance = currentBalance;

  return {
    openingBalance,
    totalInvoiced,
    totalReceived,
    totalDebit,
    totalCredit,
    closingBalance,
    transactions,
  };
}


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

export async function getFactoryList(): Promise<string[]> {
  return [...DEFAULT_FACTORIES].sort((a, b) => a.localeCompare(b));
}

export function getAvailableFiscalYears(): string[] {
  const currentFy = getFiscalYearFromDate(new Date().toISOString());
  const years = ["2026-27", "2025-26", "2024-25", "2023-24"];
  if (!years.includes(currentFy)) {
    years.unshift(currentFy);
  }
  return years;
}

export async function computeFactoryLedger(
  factoryName: string,
  fiscalYear: string,
  openingBalance: number = 0,
  backendEntries: LedgerTransaction[] = [],
): Promise<FactoryLedgerSummary> {
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

  for (const entry of backendEntries) {
    if (getFiscalYearFromDate(entry.date) === fiscalYear) {
      rawEntries.push({ ...entry });
    }
  }

  // 1. Get from stored mock entries if matched
  const mock = INITIAL_MOCK_TRANSACTIONS[factoryName];
  if (mock) {
    for (const item of mock.entries) {
      if (getFiscalYearFromDate(item.date) === fiscalYear) {
        rawEntries.push(item);
      }
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

import type { InvoiceRecord } from "./invoice-storage";
import {
  amountInWordsINR,
  calcCommissionRowAmountUsd,
  calcCommissionValue,
} from "./invoice-utils";

export function calcInvoiceLineTotal(inv: InvoiceRecord): number {
  return inv.lineItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0,
  );
}

export function calcInvoiceNetAmount(inv: InvoiceRecord): number {
  const lineTotal = calcInvoiceLineTotal(inv);
  const cgst = (lineTotal * inv.cgstPct) / 100;
  const sgst = (lineTotal * inv.sgstPct) / 100;
  return Math.round(lineTotal + cgst + sgst);
}

export function calcInvoiceNetCommission(inv: InvoiceRecord): number {
  const totalCommission = inv.commissionRows.reduce((s, row) => {
    const amountUsd = calcCommissionRowAmountUsd(
      row.quantity,
      row.originalQuantity,
      row.originalAmountUsd,
    );
    return s + calcCommissionValue(amountUsd, row.commissionPct, row.conversion);
  }, 0);
  const bankDiscount = (totalCommission * inv.bankDiscountPct) / 100;
  return Math.round(totalCommission - bankDiscount);
}

export type InvoicePaymentStatus = "pending" | "paid" | "partial";

export function getInvoicePaymentStatus(inv: InvoiceRecord): InvoicePaymentStatus {
  const net = calcInvoiceNetAmount(inv);
  const paid = inv.paidAmount ?? 0;
  if (paid <= 0) return "pending";
  if (paid >= net) return "paid";
  return "partial";
}

export const FY_OPTIONS = [
  { label: "FY 2025–26", suffix: "25-26", startYear: 2025 },
  { label: "FY 2026–27", suffix: "26-27", startYear: 2026 },
] as const;

export function getDefaultFySuffix(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const y1 = startYear % 100;
  const y2 = (startYear + 1) % 100;
  return `${String(y1).padStart(2, "0")}-${String(y2).padStart(2, "0")}`;
}

export function invoiceMatchesFy(inv: InvoiceRecord, fySuffix: string): boolean {
  const match = inv.invoiceNumber.match(/\/(\d{2}-\d{2})$/);
  if (match) return match[1] === fySuffix;
  const d = new Date(inv.date);
  const month = d.getMonth();
  const year = d.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  const y1 = startYear % 100;
  const y2 = (startYear + 1) % 100;
  return `${String(y1).padStart(2, "0")}-${String(y2).padStart(2, "0")}` === fySuffix;
}

export function formatInrShort(value: number) {
  return `₹ ${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatInrFull(value: number) {
  return `₹ ${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export { amountInWordsINR };

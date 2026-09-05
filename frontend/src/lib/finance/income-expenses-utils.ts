import { calcInvoiceNetAmount } from "./invoice-calculations";
import type { InvoiceRecord } from "./invoice-storage";
import { loadInvoices } from "./invoice-storage";

export function invoiceCreatedInMonth(inv: InvoiceRecord, year: number, month: number): boolean {
  const dateStr = inv.date;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;

  return d.getFullYear() === year && d.getMonth() + 1 === month;
}

export async function getInvoicesForMonth(year: number, month: number): Promise<InvoiceRecord[]> {
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  return await loadInvoices(monthKey);
}

export function getInvoiceIncomeAmount(inv: InvoiceRecord): number {
  const paid = inv.paidAmount ?? 0;
  if (paid > 0) return paid;
  return calcInvoiceNetAmount(inv);
}

export function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
}

export function monthName(month: number) {
  return new Date(2026, month - 1, 1).toLocaleString("default", { month: "long" });
}

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: monthName(i + 1),
}));

export function formatInr(value: number) {
  return `₹ ${Math.round(value).toLocaleString("en-IN")}`;
}

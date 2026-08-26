import { db } from "../db/db-client";

export type InvoiceCommissionRow = {
  id: string;
  poId: string | null;
  styleNo: string;
  poNo: string;
  factory: string;
  quantity: number;
  originalQuantity: number;
  originalAmountUsd: number;
  conversion: number;
  commissionPct: number;
  isManual: boolean;
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

export type InvoiceTo = {
  company: string;
  address: string;
  gstin: string;
  state: string;
  code: string;
};

export type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  date: string;
  brandName: string;
  hsnCode: string;
  invoiceTo: InvoiceTo;
  commissionRows: InvoiceCommissionRow[];
  lineItems: InvoiceLineItem[];
  bankDiscountPct: number;
  cgstPct: number;
  sgstPct: number;
  paymentDate: string;
  paidAmount: number;
  remarks: string;
  createdAt: string;
};

function normalizeInvoice(raw: InvoiceRecord): InvoiceRecord {
  return {
    ...raw,
    paymentDate: raw.paymentDate ?? "",
    paidAmount: raw.paidAmount ?? 0,
    remarks: raw.remarks ?? "",
  };
}

const STORAGE_KEY = "guhaya-invoices";

export function loadInvoices(): InvoiceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as InvoiceRecord[]) : [];
    return list.map(normalizeInvoice);
  } catch {
    return [];
  }
}

export function saveInvoices(invoices: InvoiceRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function addInvoice(invoice: InvoiceRecord) {
  const invoices = loadInvoices();
  invoices.unshift(invoice);
  saveInvoices(invoices);
  db.invoices.insert({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    partyName: invoice.invoiceTo?.company || invoice.brandName || "Buyer",
    partyGstin: invoice.invoiceTo?.gstin || null,
    partyAddress: invoice.invoiceTo?.address || null,
    invoiceDate: invoice.date ? new Date(invoice.date) : new Date(),
    currency: "INR",
    notes: invoice.remarks || null,
  }).catch(() => {});
}

export function getInvoiceNumbers(): string[] {
  return loadInvoices().map((inv) => inv.invoiceNumber);
}

export function getInvoiceById(id: string): InvoiceRecord | undefined {
  return loadInvoices().find((inv) => inv.id === id);
}

export function updateInvoice(id: string, patch: Partial<InvoiceRecord>) {
  const invoices = loadInvoices();
  const next = invoices.map((inv) => (inv.id === id ? normalizeInvoice({ ...inv, ...patch }) : inv));
  saveInvoices(next);
  db.invoices.update(id, patch).catch(() => {});
}

export function deleteInvoice(id: string) {
  saveInvoices(loadInvoices().filter((inv) => inv.id !== id));
  db.invoices.delete(id).catch(() => {});
}

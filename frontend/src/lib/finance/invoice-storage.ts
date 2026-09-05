import financeService from "../../../services/finance.service";

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
  const paymentDate = raw.paymentDate ? String(raw.paymentDate).slice(0, 10) : "";

  return {
    ...raw,
    paymentDate,
    paidAmount: raw.paidAmount ?? 0,
    remarks: raw.remarks ?? "",
  };
}

function fromApi(raw: any): InvoiceRecord {
  const lineItems = (raw.lineItems || raw.items || []).map((item: any) => ({
    id: item.id,
    description: item.description || item.itemDescription || "Item",
    quantity: Number(item.quantity) || 0,
    price: Number(item.price ?? item.rate) || 0,
  }));

  return normalizeInvoice({
    id: raw.id,
    invoiceNumber: raw.invoiceNumber || "",
    date: raw.date || (raw.invoiceDate ? String(raw.invoiceDate).slice(0, 10) : ""),
    brandName: raw.brandName || "",
    hsnCode: raw.hsnCode || "9988",
    invoiceTo: raw.invoiceTo || {
      company: raw.partyName || "",
      address: raw.partyAddress || "",
      gstin: raw.partyGstin || "",
      state: "",
      code: "",
    },
    commissionRows: raw.commissionRows || [],
    lineItems,
    bankDiscountPct: Number(raw.bankDiscountPct) || 0,
    cgstPct: Number(raw.cgstPct ?? raw.cgstRate) || 0,
    sgstPct: Number(raw.sgstPct ?? raw.sgstRate) || 0,
    paymentDate: raw.paymentDate ? String(raw.paymentDate).slice(0, 10) : "",
    paidAmount: Number(raw.paidAmount) || 0,
    remarks: raw.remarks || "",
    createdAt: raw.createdAt || new Date().toISOString(),
  });
}

export async function addInvoice(invoice: InvoiceRecord) {
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const cgstAmount = subtotal * (invoice.cgstPct / 100);
  const sgstAmount = subtotal * (invoice.sgstPct / 100);
  await financeService.createInvoice({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    partyName: invoice.invoiceTo?.company || invoice.brandName || "Buyer",
    partyGstin: invoice.invoiceTo?.gstin || null,
    partyAddress: invoice.invoiceTo?.address || null,
    invoiceDate: invoice.date ? new Date(invoice.date) : new Date(),
    currency: "INR",
    subtotal,
    cgstRate: invoice.cgstPct,
    cgstAmount,
    sgstRate: invoice.sgstPct,
    sgstAmount,
    grandTotal: subtotal + cgstAmount + sgstAmount,
    lineItems: invoice.lineItems,
    brandName: invoice.brandName,
    hsnCode: invoice.hsnCode,
    invoiceTo: invoice.invoiceTo,
    commissionRows: invoice.commissionRows,
    bankDiscountPct: invoice.bankDiscountPct,
    paymentDate: invoice.paymentDate,
    remarks: invoice.remarks,
  });
}

export async function loadInvoices(monthKey?: string): Promise<InvoiceRecord[]> {
  const invoices = await financeService.getInvoices(monthKey);
  return (invoices || []).map(fromApi);
}

export async function getInvoiceNumbers(): Promise<string[]> {
  return (await loadInvoices()).map((inv) => inv.invoiceNumber);
}

export async function getInvoiceById(id: string): Promise<InvoiceRecord | undefined> {
  const invoice = await financeService.getInvoiceById(id);
  return invoice ? fromApi(invoice) : undefined;
}

export async function updateInvoice(id: string, patch: Partial<InvoiceRecord>) {
  await financeService.updateInvoice(id, patch);
}

export async function deleteInvoice(id: string) {
  await financeService.deleteInvoice(id);
}

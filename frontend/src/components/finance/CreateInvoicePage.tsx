"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Calculator,
  ChevronRight,
  FileText,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { brands } from "@/lib/mock-data";
import {
  buildMockCommissionPos,
  COMMISSION_BRANDS,
  formatInr,
  formatUsd,
  getFactoryDetail,
  type CommissionPo,
} from "@/lib/finance/commission-data";
import {
  addInvoice,
  getInvoiceById,
  getInvoiceNumbers,
  updateInvoice,
  type InvoiceCommissionRow,
  type InvoiceLineItem,
  type InvoiceRecord,
} from "@/lib/finance/invoice-storage";
import {
  amountInWordsINR,
  calcCommissionRowAmountUsd,
  calcCommissionRowInr,
  calcCommissionValue,
  formatInvoiceNumber,
  getFinancialYearSuffix,
  getNextInvoiceSeq,
  isInvoiceNumberTaken,
} from "@/lib/finance/invoice-utils";

const inputClass =
  "w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400/60";

const sectionClass = "rounded-xl border border-gray-700 bg-gray-900 p-6";

const BRAND_OPTIONS = [
  ...COMMISSION_BRANDS.map((b) => b.name),
  ...brands.map((b) => b.name),
];

function newCommissionRow(partial?: Partial<InvoiceCommissionRow>): InvoiceCommissionRow {
  return {
    id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    poId: null,
    styleNo: "",
    poNo: "",
    factory: "",
    quantity: 1000,
    originalQuantity: 1000,
    originalAmountUsd: 10000,
    conversion: 90,
    commissionPct: 2,
    isManual: true,
    ...partial,
  };
}

function newLineItem(): InvoiceLineItem {
  return {
    id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: "",
    quantity: 0,
    price: 0,
  };
}

function poToCommissionRow(po: CommissionPo): InvoiceCommissionRow {
  return newCommissionRow({
    poId: po.id,
    styleNo: po.styleNo,
    poNo: po.poNo,
    factory: po.factory,
    quantity: po.quantity,
    originalQuantity: po.quantity,
    originalAmountUsd: po.poValueUsd,
    conversion: po.rateInrUsd,
    commissionPct: po.commissionPct,
    isManual: false,
  });
}

export function CreateInvoicePage({ editId }: { editId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(editId);
  const [unpaidPos] = useState<CommissionPo[]>(() =>
    buildMockCommissionPos().filter((p) => p.status === "unpaid"),
  );

  const today = new Date();
  const [date, setDate] = useState(today.toISOString().slice(0, 10));
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceNumberTouched, setInvoiceNumberTouched] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [hsnCode, setHsnCode] = useState("9988");
  const [commissionRows, setCommissionRows] = useState<InvoiceCommissionRow[]>([]);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([newLineItem()]);
  const [invoiceTo, setInvoiceTo] = useState({
    company: "",
    address: "",
    gstin: "",
    state: "",
    code: "",
  });
  const [bankDiscountPct, setBankDiscountPct] = useState(3);
  const [cgstPct, setCgstPct] = useState(2.5);
  const [sgstPct, setSgstPct] = useState(2.5);
  const [showPoModal, setShowPoModal] = useState(false);
  const [poSearch, setPoSearch] = useState("");
  const [modalSelectedIds, setModalSelectedIds] = useState<string[]>([]);
  const [invoiceNumberError, setInvoiceNumberError] = useState("");
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!editId) return;
    const existing = getInvoiceById(editId);
    if (!existing) {
      router.replace("/finance/invoices");
      return;
    }
    setInvoiceNumber(existing.invoiceNumber);
    setInvoiceNumberTouched(true);
    setDate(existing.date);
    setBrandName(existing.brandName);
    setHsnCode(existing.hsnCode);
    setCommissionRows(existing.commissionRows);
    setLineItems(existing.lineItems.length ? existing.lineItems : [newLineItem()]);
    setInvoiceTo(existing.invoiceTo);
    setBankDiscountPct(existing.bankDiscountPct);
    setCgstPct(existing.cgstPct);
    setSgstPct(existing.sgstPct);
    setLoaded(true);
  }, [editId, router]);

  useEffect(() => {
    if (invoiceNumberTouched) return;
    const d = new Date(date);
    const fy = getFinancialYearSuffix(d);
    const seq = getNextInvoiceSeq(getInvoiceNumbers(), fy);
    setInvoiceNumber(formatInvoiceNumber(seq, fy));
  }, [date, invoiceNumberTouched]);

  useEffect(() => {
    const factory = commissionRows.find((r) => r.factory)?.factory;
    if (!factory) return;
    const detail = getFactoryDetail(factory);
    setInvoiceTo({
      company: detail.name,
      address: detail.address,
      gstin: detail.gstin,
      state: detail.state,
      code: detail.code,
    });
  }, [commissionRows]);

  const lockedFactory = useMemo(() => {
    if (modalSelectedIds.length === 0) return null;
    const first = unpaidPos.find((p) => p.id === modalSelectedIds[0]);
    return first?.factory ?? null;
  }, [modalSelectedIds, unpaidPos]);

  const modalPos = useMemo(() => {
    const alreadyAdded = new Set(commissionRows.map((r) => r.poId).filter(Boolean));
    const q = poSearch.trim().toLowerCase();

    return unpaidPos.filter((po) => {
      if (alreadyAdded.has(po.id)) return false;
      if (lockedFactory && po.factory !== lockedFactory) return false;
      if (!q) return true;
      return (
        po.poNo.includes(q) ||
        po.styleNo.toLowerCase().includes(q) ||
        po.factory.toLowerCase().includes(q)
      );
    });
  }, [unpaidPos, poSearch, lockedFactory, commissionRows]);

  const commissionCalcs = useMemo(
    () =>
      commissionRows.map((row) => {
        const amountUsd = calcCommissionRowAmountUsd(
          row.quantity,
          row.originalQuantity,
          row.originalAmountUsd,
        );
        const amountInr = calcCommissionRowInr(amountUsd, row.conversion);
        const commission = calcCommissionValue(amountUsd, row.commissionPct, row.conversion);
        return { amountUsd, amountInr, commission };
      }),
    [commissionRows],
  );

  const totalCommission = commissionCalcs.reduce((s, c) => s + c.commission, 0);
  const bankDiscount = (totalCommission * bankDiscountPct) / 100;
  const netCommission = totalCommission - bankDiscount;

  const lineCalcs = useMemo(
    () => lineItems.map((item) => item.quantity * item.price),
    [lineItems],
  );
  const lineTotal = lineCalcs.reduce((s, v) => s + v, 0);
  const cgstAmount = (lineTotal * cgstPct) / 100;
  const sgstAmount = (lineTotal * sgstPct) / 100;
  const netLineAmount = lineTotal + cgstAmount + sgstAmount;

  function updateCommissionRow(id: string, patch: Partial<InvoiceCommissionRow>) {
    setCommissionRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeCommissionRow(id: string) {
    setCommissionRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateLineItem(id: string, patch: Partial<InvoiceLineItem>) {
    setLineItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeLineItem(id: string) {
    setLineItems((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  function togglePoSelection(poId: string) {
    setModalSelectedIds((prev) => {
      if (prev.includes(poId)) return prev.filter((id) => id !== poId);
      return [...prev, poId];
    });
  }

  function confirmPoSelection() {
    const selected = unpaidPos.filter((p) => modalSelectedIds.includes(p.id));
    const newRows = selected.map(poToCommissionRow);
    setCommissionRows((prev) => [...prev, ...newRows]);
    setModalSelectedIds([]);
    setPoSearch("");
    setShowPoModal(false);
  }

  function validateInvoiceNumber(): boolean {
    const parsed = invoiceNumber.trim();
    if (!parsed) {
      setInvoiceNumberError("Invoice number is required.");
      return false;
    }
    if (!/^GS\/\d+\/\d{2}-\d{2}$/i.test(parsed)) {
      setInvoiceNumberError("Use format GS/001/26-27");
      return false;
    }
    if (isInvoiceNumberTaken(
      parsed,
      getInvoiceNumbers(),
      isEdit ? getInvoiceById(editId!)?.invoiceNumber : undefined,
    )) {
      setInvoiceNumberError("This invoice number is already used.");
      return false;
    }
    setInvoiceNumberError("");
    return true;
  }

  function handleSave() {
    if (!date) return;
    if (!validateInvoiceNumber()) return;

    if (isEdit && editId) {
      updateInvoice(editId, {
        invoiceNumber: invoiceNumber.trim().toUpperCase(),
        date,
        brandName,
        hsnCode,
        invoiceTo,
        commissionRows,
        lineItems,
        bankDiscountPct,
        cgstPct,
        sgstPct,
      });
    } else {
      const record: InvoiceRecord = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invoiceNumber.trim().toUpperCase(),
        date,
        brandName,
        hsnCode,
        invoiceTo,
        commissionRows,
        lineItems,
        bankDiscountPct,
        cgstPct,
        sgstPct,
        paymentDate: "",
        paidAmount: 0,
        remarks: "",
        createdAt: new Date().toISOString(),
      };
      addInvoice(record);
    }

    router.push("/finance/invoices");
  }

  if (!loaded) {
    return (
      <SourcingShell breadcrumb={<span className="text-gray-400">Loading...</span>}>
        <p className="text-gray-400">Loading invoice...</p>
      </SourcingShell>
    );
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">Dashboard</Link>
          <ChevronRight size={14} />
          <Link href="/finance" className="transition-colors hover:text-teal-400">Finance</Link>
          <ChevronRight size={14} />
          <Link href="/finance/invoices" className="transition-colors hover:text-teal-400">Invoices</Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">{isEdit ? "Edit" : "Create"}</span>
        </>
      }
    >
      <div className="mb-8">
        <Link
          href="/finance/invoices"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-teal-400"
        >
          <ArrowLeft size={14} /> Back to Invoices
        </Link>
        <h1 className="text-3xl font-bold text-white">{isEdit ? "Edit Invoice" : "Create Invoice"}</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Invoice Information */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <FileText size={18} className="text-teal-400" />
            <h2 className="text-lg font-semibold text-white">Invoice Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Invoice Number *</label>
              <input
                value={invoiceNumber}
                onChange={(e) => {
                  setInvoiceNumberTouched(true);
                  setInvoiceNumber(e.target.value);
                  setInvoiceNumberError("");
                }}
                className={inputClass}
                placeholder="GS/001/26-27"
              />
              {invoiceNumberError ? (
                <p className="mt-1 text-xs text-red-400">{invoiceNumberError}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Auto-increments per financial year. Cannot reuse a saved number.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (!invoiceNumberTouched) {
                    const d = new Date(e.target.value);
                    const fy = getFinancialYearSuffix(d);
                    const seq = getNextInvoiceSeq(getInvoiceNumbers(), fy);
                    setInvoiceNumber(formatInvoiceNumber(seq, fy));
                  }
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Brand Name</label>
              <select value={brandName} onChange={(e) => setBrandName(e.target.value)} className={inputClass}>
                <option value="">Select brand...</option>
                {BRAND_OPTIONS.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">HSN Code</label>
              <input
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Commission Calculation */}
        <section className={sectionClass}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Invoice Details (Commission Calculation)</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowPoModal(true)} className="btn gap-1">
                <Plus size={13} /> Add PO
              </button>
              <button
                type="button"
                onClick={() => setCommissionRows((prev) => [...prev, newCommissionRow()])}
                className="btn-outline gap-1"
              >
                <Plus size={13} /> Add Manual Row
              </button>
            </div>
          </div>

          {commissionRows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-600 bg-black/30 p-12 text-center">
              <Calculator size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm text-gray-400">
                No POs added yet. Click &apos;Add PO&apos; to select commission POs from your list.
              </p>
              <button type="button" onClick={() => setShowPoModal(true)} className="btn mt-4 gap-1">
                <Plus size={13} /> Add PO
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-xs text-gray-400">
                    <th className="px-2 py-2">S.No</th>
                    <th className="px-2 py-2">Style</th>
                    <th className="px-2 py-2">PO No</th>
                    <th className="px-2 py-2">Factory</th>
                    <th className="px-2 py-2">Quantity</th>
                    <th className="px-2 py-2">Amount (USD)</th>
                    <th className="px-2 py-2">Conversion</th>
                    <th className="px-2 py-2">Amount (INR)</th>
                    <th className="px-2 py-2">Comm. %</th>
                    <th className="px-2 py-2">Commission</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {commissionRows.map((row, index) => {
                    const calc = commissionCalcs[index];
                    return (
                      <tr key={row.id} className="border-b border-gray-800 text-gray-300">
                        <td className="px-2 py-2">{index + 1}</td>
                        <td className="px-2 py-2">
                          {row.isManual ? (
                            <input
                              value={row.styleNo}
                              onChange={(e) => updateCommissionRow(row.id, { styleNo: e.target.value })}
                              className="w-20 rounded border border-gray-700 bg-black px-2 py-1 text-xs text-white"
                            />
                          ) : (
                            row.styleNo
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {row.isManual ? (
                            <input
                              value={row.poNo}
                              onChange={(e) => updateCommissionRow(row.id, { poNo: e.target.value })}
                              className="w-24 rounded border border-gray-700 bg-black px-2 py-1 text-xs text-white"
                            />
                          ) : (
                            row.poNo
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {row.isManual ? (
                            <input
                              value={row.factory}
                              onChange={(e) => updateCommissionRow(row.id, { factory: e.target.value })}
                              className="w-32 rounded border border-gray-700 bg-black px-2 py-1 text-xs text-white"
                            />
                          ) : (
                            row.factory
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min={0}
                            value={row.quantity}
                            onChange={(e) =>
                              updateCommissionRow(row.id, { quantity: Number(e.target.value) || 0 })
                            }
                            className="w-20 rounded border border-dashed border-gray-600 bg-black px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="px-2 py-2 text-gray-400">{formatUsd(calc.amountUsd)}</td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min={0}
                            value={row.conversion}
                            onChange={(e) =>
                              updateCommissionRow(row.id, { conversion: Number(e.target.value) || 0 })
                            }
                            className="w-16 rounded border border-dashed border-gray-600 bg-black px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="px-2 py-2 text-gray-400">{formatInr(calc.amountInr)}</td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={row.commissionPct}
                            onChange={(e) =>
                              updateCommissionRow(row.id, { commissionPct: Number(e.target.value) || 0 })
                            }
                            className="w-14 rounded border border-dashed border-gray-600 bg-black px-2 py-1 text-xs text-white"
                          />
                        </td>
                        <td className="px-2 py-2 font-medium text-teal-300">
                          {formatInr(calc.commission)}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => removeCommissionRow(row.id)}
                            className="delete-btn"
                            title="Remove row"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-700">
                    <td colSpan={9} className="px-2 py-3 text-right text-sm text-gray-400">
                      Total Commission
                    </td>
                    <td className="px-2 py-3 font-semibold text-white">{formatInr(totalCommission)}</td>
                    <td />
                  </tr>
                  <tr>
                    <td colSpan={8} className="px-2 py-2 text-right text-sm text-gray-400">
                      Bank Discount
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={bankDiscountPct}
                        onChange={(e) => setBankDiscountPct(Number(e.target.value) || 0)}
                        className="w-14 rounded border border-dashed border-gray-600 bg-black px-2 py-1 text-xs text-white"
                      />
                      <span className="ml-1 text-gray-500">%</span>
                    </td>
                    <td className="px-2 py-2 text-red-400">- {formatInr(bankDiscount)}</td>
                    <td />
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td colSpan={9} className="px-2 py-3 text-right text-sm font-semibold text-white">
                      Net Commission
                    </td>
                    <td className="px-2 py-3 text-lg font-bold text-teal-300">{formatInr(netCommission)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        {/* Invoice To */}
        <section className={sectionClass}>
          <h2 className="mb-5 text-lg font-semibold text-white">Invoice To</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-gray-400">Company / Name</label>
              <input
                value={invoiceTo.company}
                onChange={(e) => setInvoiceTo((p) => ({ ...p, company: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-gray-400">Address</label>
              <textarea
                value={invoiceTo.address}
                onChange={(e) => setInvoiceTo((p) => ({ ...p, address: e.target.value }))}
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">GSTIN</label>
              <input
                value={invoiceTo.gstin}
                onChange={(e) => setInvoiceTo((p) => ({ ...p, gstin: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-400">State</label>
                <input
                  value={invoiceTo.state}
                  onChange={(e) => setInvoiceTo((p) => ({ ...p, state: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Code</label>
                <input
                  value={invoiceTo.code}
                  onChange={(e) => setInvoiceTo((p) => ({ ...p, code: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Line Items */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote size={18} className="text-sky-400" />
              <h2 className="text-lg font-semibold text-white">Invoice Line Items</h2>
            </div>
            <button
              type="button"
              onClick={() => setLineItems((prev) => [...prev, newLineItem()])}
              className="btn gap-1"
            >
              <Plus size={13} /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-left text-xs text-gray-400">
                  <th className="px-2 py-2">S.No</th>
                  <th className="px-2 py-2">Description</th>
                  <th className="px-2 py-2">Quantity</th>
                  <th className="px-2 py-2">Price</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-800 text-gray-300">
                    <td className="px-2 py-2">{index + 1}</td>
                    <td className="px-2 py-2">
                      <input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                        placeholder="JOB WORK (STITCHING TO CHECKING)"
                        className="w-full min-w-[200px] rounded border border-gray-700 bg-black px-2 py-1.5 text-xs text-white"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, { quantity: Number(e.target.value) || 0 })}
                        className="w-20 rounded border border-gray-700 bg-black px-2 py-1.5 text-xs text-white"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.price}
                        onChange={(e) => updateLineItem(item.id, { price: Number(e.target.value) || 0 })}
                        className="w-24 rounded border border-gray-700 bg-black px-2 py-1.5 text-xs text-white"
                      />
                    </td>
                    <td className="px-2 py-2 text-gray-400">
                      {lineCalcs[index] > 0 ? formatInr(lineCalcs[index]) : "—"}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="delete-btn"
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-sm space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Total Amount</span>
                <span className="text-white">{formatInr(lineTotal)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-2">
                  CGST
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={cgstPct}
                    onChange={(e) => setCgstPct(Number(e.target.value) || 0)}
                    className="w-14 rounded border border-dashed border-gray-600 bg-black px-1 py-0.5 text-xs text-white"
                  />
                  %
                </span>
                <span>{formatInr(cgstAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span className="flex items-center gap-2">
                  SGST
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={sgstPct}
                    onChange={(e) => setSgstPct(Number(e.target.value) || 0)}
                    className="w-14 rounded border border-dashed border-gray-600 bg-black px-1 py-0.5 text-xs text-white"
                  />
                  %
                </span>
                <span>{formatInr(sgstAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2 text-base font-bold">
                <span className="text-white">Net Amount</span>
                <span className="text-emerald-400">{formatInr(netLineAmount)}</span>
              </div>
              <p className="text-xs text-gray-500">
                Amount in words: <span className="text-gray-400">{amountInWordsINR(netLineAmount)}</span>
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 pb-8">
          <Link href="/finance/invoices" className="btn-outline">
            Cancel
          </Link>
          <button type="button" onClick={handleSave} className="btn">
            {isEdit ? "Update Invoice" : "Save Invoice"}
          </button>
        </div>
      </div>

      {showPoModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => {
            setShowPoModal(false);
            setModalSelectedIds([]);
            setPoSearch("");
          }}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-gray-700 bg-gray-900 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white">Select Commission POs</h3>
              <button
                type="button"
                onClick={() => {
                  setShowPoModal(false);
                  setModalSelectedIds([]);
                  setPoSearch("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {lockedFactory ? (
              <p className="border-b border-gray-800 bg-teal-500/10 px-4 py-2 text-xs text-teal-300">
                Showing POs from <strong>{lockedFactory}</strong> only — one factory per invoice.
              </p>
            ) : null}

            <div className="border-b border-gray-700 p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={poSearch}
                  onChange={(e) => setPoSearch(e.target.value)}
                  placeholder="Search by PO No, Style, or Factory..."
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-800/90 text-xs text-gray-400">
                  <tr>
                    <th className="px-4 py-2" />
                    <th className="px-4 py-2 text-left">Style</th>
                    <th className="px-4 py-2 text-left">PO No</th>
                    <th className="px-4 py-2 text-left">Factory</th>
                    <th className="px-4 py-2 text-left">Ship Date</th>
                    <th className="px-4 py-2 text-left">Value (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {modalPos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                        No unpaid commission POs match your search.
                      </td>
                    </tr>
                  ) : (
                    modalPos.map((po) => (
                      <tr
                        key={po.id}
                        className="cursor-pointer border-b border-gray-800 text-gray-300 hover:bg-gray-800/50"
                        onClick={() => togglePoSelection(po.id)}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={modalSelectedIds.includes(po.id)}
                            onChange={() => togglePoSelection(po.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="accent-teal-500"
                          />
                        </td>
                        <td className="px-4 py-2">{po.styleNo}</td>
                        <td className="px-4 py-2">{po.poNo}</td>
                        <td className="px-4 py-2">{po.factory}</td>
                        <td className="px-4 py-2">{po.shipmentDate}</td>
                        <td className="px-4 py-2">{formatUsd(po.poValueUsd)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-700 p-4">
              <button
                type="button"
                onClick={() => {
                  setShowPoModal(false);
                  setModalSelectedIds([]);
                  setPoSearch("");
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPoSelection}
                disabled={modalSelectedIds.length === 0}
                className="btn disabled:opacity-40"
              >
                Add Selected ({modalSelectedIds.length})
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SourcingShell>
  );
}

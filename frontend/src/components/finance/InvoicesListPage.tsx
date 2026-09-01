"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  FileDown,
  FileText,
  Pencil,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { CompanySettingsModal } from "@/components/finance/CompanySettingsModal";
import {
  calcInvoiceNetAmount,
  FY_OPTIONS,
  formatInrShort,
  getDefaultFySuffix,
  getInvoicePaymentStatus,
  invoiceMatchesFy,
} from "@/lib/finance/invoice-calculations";
import { downloadInvoicePdf } from "@/lib/finance/invoice-pdf";
import {
  deleteInvoice,
  loadInvoices,
  updateInvoice,
  type InvoiceRecord,
} from "@/lib/finance/invoice-storage";

const selectClass =
  "rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400/60";

type EditableCellProps = {
  value: string;
  placeholder?: string;
  type?: "text" | "date" | "number";
  onSave: (value: string) => void;
};

function EditableCell({ value, placeholder = "Click to edit", type = "text", onSave }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          onSave(draft);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSave(draft);
            setEditing(false);
          }
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="w-full min-w-[100px] rounded border border-teal-500/50 bg-black px-2 py-1 text-xs text-white outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`w-full text-left text-xs ${value ? "text-gray-300" : "italic text-gray-600"}`}
    >
      {value || placeholder}
    </button>
  );
}

function statusBadge(status: ReturnType<typeof getInvoicePaymentStatus>) {
  if (status === "paid") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  }
  if (status === "partial") {
    return "bg-sky-500/15 text-sky-300 border-sky-500/40";
  }
  return "bg-amber-500/15 text-amber-300 border-amber-500/40";
}

function statusLabel(status: ReturnType<typeof getInvoicePaymentStatus>) {
  if (status === "paid") return "Paid";
  if (status === "partial") return "Partial";
  return "Pending";
}

export function InvoicesListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [fySuffix, setFySuffix] = useState(getDefaultFySuffix);
  const [factoryFilter, setFactoryFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  const refresh = useCallback(() => {
    setInvoices(loadInvoices());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const factoryOptions = useMemo(() => {
    const names = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.invoiceTo.company) names.add(inv.invoiceTo.company);
    });
    return [...names].sort();
  }, [invoices]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (!invoiceMatchesFy(inv, fySuffix)) return false;
      if (factoryFilter !== "all" && inv.invoiceTo.company !== factoryFilter) return false;
      return true;
    });
  }, [invoices, fySuffix, factoryFilter]);

  const totals = useMemo(() => {
    let net = 0;
    let paid = 0;
    filtered.forEach((inv) => {
      net += calcInvoiceNetAmount(inv);
      paid += inv.paidAmount ?? 0;
    });
    return { net, paid };
  }, [filtered]);

  const fyLabel = FY_OPTIONS.find((f) => f.suffix === fySuffix)?.label ?? `FY ${fySuffix}`;

  async function patchInvoice(id: string, patch: Partial<InvoiceRecord>) {
    await updateInvoice(id, patch);
    refresh();
  }

  async function handleDelete(inv: InvoiceRecord) {
    if (!window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) return;
    try {
      await deleteInvoice(inv.id);
      refresh();
    } catch (error: any) {
      alert(error?.message || "Failed to delete invoice.");
    }
  }

  const fyPillClass = (suffix: string) =>
    suffix === fySuffix
      ? "rounded-lg border border-white bg-white px-4 py-2 text-sm font-semibold text-black"
      : "rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:border-gray-500";

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">Dashboard</Link>
          <ChevronRight size={14} />
          <Link href="/finance" className="transition-colors hover:text-teal-400">Finance</Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">Invoices</span>
        </>
      }
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="mt-1 text-sm text-gray-400">Create &amp; manage invoices with payment tracking.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setShowSettings(true)} className="btn-outline gap-1.5">
            <Settings2 size={14} /> GSTIN
          </button>
          <Link href="/finance/invoices/create" className="btn gap-1.5">
            <Plus size={14} /> Create Invoice
          </Link>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FY_OPTIONS.map((fy) => (
            <button
              key={fy.suffix}
              type="button"
              onClick={() => setFySuffix(fy.suffix)}
              className={fyPillClass(fy.suffix)}
            >
              {fy.label}
            </button>
          ))}
        </div>
        <select
          value={factoryFilter}
          onChange={(e) => setFactoryFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Factories</option>
          {factoryOptions.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 text-gray-500">
            <FileText size={28} />
          </div>
          <h2 className="text-lg font-semibold text-white">No invoices yet</h2>
          <p className="mt-2 text-sm text-gray-400">Create your first invoice to get started.</p>
          <Link href="/finance/invoices/create" className="btn mt-6 inline-flex">
            Create Invoice
          </Link>
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
          <div className="border-b border-gray-700 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-300">Invoices — {fyLabel}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-teal-950/40 text-left text-xs text-gray-300">
                  <th className="px-4 py-3">Invoice No.</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3 text-right">Net Amount</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3 text-right">Paid Amount</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                      No invoices for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => {
                    const net = calcInvoiceNetAmount(inv);
                    const status = getInvoicePaymentStatus(inv);
                    return (
                      <tr key={inv.id} className="border-b border-gray-800 text-gray-300">
                        <td className="px-4 py-3 font-medium text-teal-300">{inv.invoiceNumber}</td>
                        <td className="px-4 py-3">{inv.date}</td>
                        <td className="px-4 py-3">{inv.invoiceTo.company || "—"}</td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {formatInrShort(net)}
                        </td>
                        <td className="px-4 py-3">
                          <EditableCell
                            value={inv.paymentDate}
                            type="date"
                            onSave={(v) => patchInvoice(inv.id, { paymentDate: v })}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <EditableCell
                            value={inv.paidAmount ? String(inv.paidAmount) : ""}
                            type="number"
                            placeholder="Click to edit"
                            onSave={(v) => patchInvoice(inv.id, { paidAmount: Number(v) || 0 })}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <EditableCell
                            value={inv.remarks}
                            onSave={(v) => patchInvoice(inv.id, { remarks: v })}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge(status)}`}
                          >
                            {statusLabel(status)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => downloadInvoicePdf(inv)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-teal-400"
                              title="Download PDF"
                            >
                              <FileDown size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(`/finance/invoices/${inv.id}/edit`)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-teal-400"
                              title="Edit invoice"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(inv)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
                              title="Delete invoice"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filtered.length > 0 ? (
                <tfoot>
                  <tr className="border-t border-gray-700 bg-gray-800/30 font-semibold text-white">
                    <td className="px-4 py-3" colSpan={3}>
                      Total
                    </td>
                    <td className="px-4 py-3 text-right">{formatInrShort(totals.net)}</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right">{formatInrShort(totals.paid)}</td>
                    <td className="px-4 py-3" colSpan={3} />
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </section>
      )}

      <CompanySettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </SourcingShell>
  );
}

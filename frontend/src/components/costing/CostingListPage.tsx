"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import {
  deleteCosting,
  loadCostings,
  loadCostingsAsync,
  saveOrUpdateCosting,
  type CostSheet,
} from "@/lib/costing/costing-data";

export function CostingListPage() {
  const router = useRouter();
  const [costings, setCostings] = useState<CostSheet[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const loaded = await loadCostingsAsync();
        setCostings(loaded || []);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    window.clearTimeout((showToast as any)._timer);
    (showToast as any)._timer = window.setTimeout(() => setToastMsg(null), 3500);
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Are you sure you want to delete costing "${name}"?`)) {
      setCostings((prev) => prev.filter((c) => c.id !== id));
      await deleteCosting(id);
      showToast("Costing deleted");
    }
  }

  function handleDuplicate(costSheet: CostSheet) {
    const duplicated: CostSheet = {
      ...JSON.parse(JSON.stringify(costSheet)),
      id: `cost-${Date.now()}`,
      name: `${costSheet.name} (Copy)`,
      styleNo: `${costSheet.styleNo}-COPY`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    saveOrUpdateCosting(duplicated);
    setCostings([duplicated, ...costings]);
    showToast("Costing duplicated");
  }

  function formatDate(d?: string) {
    if (!d) return "—";
    const parts = d.split("T")[0].split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return d;
  }

  return (
    <SourcingShell>
      <div className="max-w-6xl mx-auto space-y-6 pb-20 text-gray-200">
        {/* Toast */}
        {toastMsg && (
          <div className="guhaya-toast" role="status" aria-live="polite">
            <span className="text-emerald-300">{toastMsg}</span>
            <button type="button" onClick={() => setToastMsg(null)} aria-label="Dismiss notification">×</button>
          </div>
        )}

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">Costing</h1>

          <div>
            <Link
              href="/costing/create"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg"
            >
              <Plus size={15} /> Create New Costing
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="guhaya-panel p-5 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
              Loading costing records...
            </div>
          </div>
        ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#0d1414] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-black/60 text-[11px] font-bold text-gray-400">
                  <th className="py-3 px-4 w-16 text-center"></th>
                  <th className="py-3 px-4 min-w-[120px]">Date</th>
                  <th className="py-3 px-4 min-w-[100px] text-center">Brand</th>
                  <th className="py-3 px-6 min-w-[280px]">Name</th>
                  <th className="py-3 px-6 text-right min-w-[140px]">Final Price (USD)</th>
                  <th className="py-3 px-4 text-right w-28"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-sans">
                {costings.map((c) => {
                  const priceFormatted =
                    c.usdFinalPrice !== undefined
                      ? `$${c.usdFinalPrice.toFixed(2)}`
                      : "$1.27";

                  return (
                    <tr key={c.id} className="hover:bg-gray-800/20 transition">
                      {/* Image Thumbnail */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="w-10 h-10 rounded-lg border border-gray-800 bg-white p-0.5 overflow-hidden flex items-center justify-center mx-auto shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.image || "/models/chaos-tote.png"}
                            alt={c.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-4 font-mono text-gray-400">
                        {formatDate(c.createdAt)}
                      </td>

                      {/* Brand Pill */}
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-block rounded-md bg-black/80 border border-gray-800 px-3 py-1 text-[11px] font-bold text-gray-300">
                          {c.brand || "Sinsay"}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-6 font-semibold text-white">
                        <Link
                          href={`/costing/${c.id}/edit`}
                          className="hover:text-teal-300 transition"
                        >
                          {c.name}
                        </Link>
                      </td>

                      {/* Final Price (USD) */}
                      <td className="py-2.5 px-6 text-right font-mono font-bold text-white text-sm">
                        {priceFormatted}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2.5">
                          <button
                            type="button"
                            title="Duplicate"
                            onClick={() => handleDuplicate(c)}
                            className="p-1 text-gray-400 hover:text-white transition"
                          >
                            <Copy size={14} />
                          </button>
                          <Link
                            href={`/costing/${c.id}/edit`}
                            title="Edit"
                            className="p-1 text-gray-400 hover:text-teal-400 transition"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => handleDelete(c.id, c.name)}
                            className="p-1 text-gray-400 hover:text-red-400 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </SourcingShell>
  );
}

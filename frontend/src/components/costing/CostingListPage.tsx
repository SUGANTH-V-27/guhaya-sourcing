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
  saveOrUpdateCosting,
  type CostSheet,
} from "@/lib/costing/costing-data";

export function CostingListPage() {
  const router = useRouter();
  const [costings, setCostings] = useState<CostSheet[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Initial mock seed costings matching the screenshot if storage is empty
  const defaultCostings: CostSheet[] = [
    {
      id: "cost-1",
      brand: "Sinsay",
      name: "299OO – Without Snap Button",
      styleNo: "299OO-NOSNAP",
      fabricComposition: "100% Cotton",
      gsm: "160",
      currency: "USD",
      exchangeRate: 92,
      targetQuantity: 10000,
      garmentCount: 1,
      garmentSections: [],
      notes: "",
      usdFinalPrice: 1.27,
      createdAt: "2026-08-22",
      updatedAt: "2026-08-22",
      image: "/models/chaos-tote.png",
    },
    {
      id: "cost-2",
      brand: "Sinsay",
      name: "299OO",
      styleNo: "299OO",
      fabricComposition: "100% Cotton",
      gsm: "160",
      currency: "USD",
      exchangeRate: 92,
      targetQuantity: 10000,
      garmentCount: 1,
      garmentSections: [],
      notes: "",
      usdFinalPrice: 1.44,
      createdAt: "2026-08-22",
      updatedAt: "2026-08-22",
      image: "/models/chaos-tote.png",
    },
    {
      id: "cost-3",
      brand: "Sinsay",
      name: "271OO",
      styleNo: "271OO",
      fabricComposition: "100% Cotton",
      gsm: "180",
      currency: "USD",
      exchangeRate: 92,
      targetQuantity: 10000,
      garmentCount: 1,
      garmentSections: [],
      notes: "",
      usdFinalPrice: 1.86,
      createdAt: "2026-08-22",
      updatedAt: "2026-08-22",
      image: "/models/chaos-tote.png",
    },
    {
      id: "cost-4",
      brand: "Sinsay",
      name: "399ON",
      styleNo: "399ON",
      fabricComposition: "100% Cotton",
      gsm: "160",
      currency: "USD",
      exchangeRate: 92,
      targetQuantity: 10000,
      garmentCount: 1,
      garmentSections: [],
      notes: "",
      usdFinalPrice: 1.21,
      createdAt: "2026-07-28",
      updatedAt: "2026-07-28",
      image: "/models/chaos-tote.png",
    },
    {
      id: "cost-5",
      brand: "Sinsay",
      name: "400ON",
      styleNo: "400ON",
      fabricComposition: "100% Cotton",
      gsm: "160",
      currency: "USD",
      exchangeRate: 92,
      targetQuantity: 10000,
      garmentCount: 1,
      garmentSections: [],
      notes: "",
      usdFinalPrice: 1.00,
      createdAt: "2026-07-28",
      updatedAt: "2026-07-28",
      image: "/models/chaos-tote.png",
    },
    {
      id: "cost-6",
      brand: "Sinsay",
      name: "470KN – Cotton",
      styleNo: "470KN-C",
      fabricComposition: "100% Cotton",
      gsm: "220",
      currency: "USD",
      exchangeRate: 92,
      targetQuantity: 10000,
      garmentCount: 1,
      garmentSections: [],
      notes: "",
      usdFinalPrice: 4.32,
      createdAt: "2026-05-13",
      updatedAt: "2026-05-13",
      image: "/models/chaos-tote.png",
    },
    {
      id: "cost-7",
      brand: "Sinsay",
      name: "472KN – Elastane",
      styleNo: "472KN-E",
      fabricComposition: "95% Cotton 5% Elastane",
      gsm: "220",
      currency: "USD",
      exchangeRate: 92,
      targetQuantity: 10000,
      garmentCount: 1,
      garmentSections: [],
      notes: "",
      usdFinalPrice: 3.95,
      createdAt: "2026-05-13",
      updatedAt: "2026-05-13",
      image: "/models/chaos-tote.png",
    },
    {
      id: "cost-8",
      brand: "Sinsay",
      name: "470KN",
      styleNo: "470KN",
      fabricComposition: "100% Cotton",
      gsm: "240",
      currency: "USD",
      exchangeRate: 92,
      targetQuantity: 10000,
      garmentCount: 1,
      garmentSections: [],
      notes: "",
      usdFinalPrice: 5.14,
      createdAt: "2026-05-12",
      updatedAt: "2026-05-12",
      image: "/models/chaos-tote.png",
    },
    {
      id: "cost-9",
      brand: "Sinsay",
      name: "943LB",
      styleNo: "943LB",
      fabricComposition: "100% Cotton",
      gsm: "200",
      currency: "USD",
      exchangeRate: 92,
      targetQuantity: 10000,
      garmentCount: 1,
      garmentSections: [],
      notes: "",
      usdFinalPrice: 4.23,
      createdAt: "2026-05-05",
      updatedAt: "2026-05-05",
      image: "/models/chaos-tote.png",
    },
  ];

  useEffect(() => {
    const loaded = loadCostings();
    if (loaded && loaded.length > 0) {
      setCostings(loaded);
    } else {
      setCostings(defaultCostings);
    }
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Are you sure you want to delete costing "${name}"?`)) {
      deleteCosting(id);
      setCostings((prev) => prev.filter((c) => c.id !== id));
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
          <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-bold text-black shadow-xl">
            {toastMsg}
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

        {/* Costing Table Card */}
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
      </div>
    </SourcingShell>
  );
}

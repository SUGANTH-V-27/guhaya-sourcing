"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import {
  getCostingById,
  saveOrUpdateCosting,
  type CostSheet,
} from "@/lib/costing/costing-data";

type Props = {
  costingId?: string;
  isNew?: boolean;
};

interface CostItemRow {
  id: string;
  item: string;
  detail: string;
  value: number;
}

interface GarmentSection {
  id: string;
  name: string;
  fabricRows: CostItemRow[];
  wastagePct: number;
  garmentRows: CostItemRow[];
  overheadPct: number;
}

function defaultFabricRows(prefix: string): CostItemRow[] {
  return [
    { id: `${prefix}-f1`, item: "Yarn", detail: "", value: 0 },
    { id: `${prefix}-f2`, item: "Knit", detail: "", value: 0 },
    { id: `${prefix}-f3`, item: "Dye", detail: "", value: 0 },
    { id: `${prefix}-f4`, item: "Compacting", detail: "", value: 0 },
  ];
}

function defaultGarmentRows(prefix: string): CostItemRow[] {
  return [
    { id: `${prefix}-g1`, item: "Fabric", detail: "", value: 0 },
    { id: `${prefix}-g2`, item: "CMT", detail: "", value: 0 },
    { id: `${prefix}-g3`, item: "Print", detail: "", value: 0 },
    { id: `${prefix}-g4`, item: "Trims", detail: "", value: 0 },
    { id: `${prefix}-g5`, item: "FOB", detail: "", value: 0 },
  ];
}

function createSection(index: number): GarmentSection {
  const prefix = `g${index + 1}-${Date.now()}`;
  return {
    id: prefix,
    name: `Garment ${index + 1}`,
    fabricRows: defaultFabricRows(prefix),
    wastagePct: 0,
    garmentRows: defaultGarmentRows(prefix),
    overheadPct: 0,
  };
}

function calcSectionTotals(sec: GarmentSection) {
  const fabricBase = sec.fabricRows.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const wastageAmount = Math.round(fabricBase * (sec.wastagePct / 100) * 100) / 100;
  const totalFabricCost = fabricBase + wastageAmount;

  const garmentBase = sec.garmentRows.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const overheadAmount = Math.round(garmentBase * (sec.overheadPct / 100) * 100) / 100;
  const totalCost = garmentBase + overheadAmount;

  return { fabricBase, wastageAmount, totalFabricCost, garmentBase, overheadAmount, totalCost };
}

export function CostingEditPage({ costingId, isNew }: Props) {
  const router = useRouter();

  // ── Top Form Fields ────────────────────────────────────────────────────────
  const [brand, setBrand] = useState("");
  const [costingName, setCostingName] = useState("");
  const [fabricComposition, setFabricComposition] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [gsm, setGsm] = useState("");
  const [noOfGarments, setNoOfGarments] = useState(1);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [usdRate, setUsdRate] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ── Per-Garment Sections ───────────────────────────────────────────────────
  const [sections, setSections] = useState<GarmentSection[]>([createSection(0)]);

  // Sync sections array when noOfGarments changes
  useEffect(() => {
    setSections((prev) => {
      if (noOfGarments > prev.length) {
        // Add new sections
        const toAdd = Array.from({ length: noOfGarments - prev.length }, (_, i) =>
          createSection(prev.length + i)
        );
        return [...prev, ...toAdd];
      } else if (noOfGarments < prev.length) {
        // Remove extra sections
        return prev.slice(0, noOfGarments);
      }
      return prev;
    });
  }, [noOfGarments]);

  // Load existing if editing
  useEffect(() => {
    if (costingId && !isNew) {
      const existing = getCostingById(costingId);
      if (existing) {
        setBrand(existing.brand || "");
        setCostingName(existing.name || "");
        setFabricComposition(existing.fabricComposition || "");
        setGsm(existing.gsm || "");
        setUsdRate(existing.exchangeRate || 0);
        if (existing.image) setStyleImage(existing.image);
      }
    }
  }, [costingId, isNew]);

  // ── Grand Totals ───────────────────────────────────────────────────────────
  const sectionTotals = useMemo(() => sections.map(calcSectionTotals), [sections]);

  const grandTotal = useMemo(
    () => sectionTotals.reduce((s, t) => s + t.totalCost, 0),
    [sectionTotals]
  );

  const finalPriceUsd = useMemo(() => {
    if (!usdRate || usdRate <= 0) return 0;
    return Math.round((grandTotal / usdRate) * 10000) / 10000;
  }, [grandTotal, usdRate]);

  // ── Section Mutation Helpers ───────────────────────────────────────────────
  function updateSectionName(idx: number, name: string) {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, name } : s)));
  }

  function updateSectionWastage(idx: number, pct: number) {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, wastagePct: pct } : s)));
  }

  function updateSectionOverhead(idx: number, pct: number) {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, overheadPct: pct } : s)));
  }

  function addFabricRow(idx: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              fabricRows: [
                ...s.fabricRows,
                { id: `${s.id}-f${Date.now()}`, item: "Process", detail: "—", value: 0 },
              ],
            }
          : s
      )
    );
  }

  function deleteFabricRow(secIdx: number, rowId: string) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? { ...s, fabricRows: s.fabricRows.filter((r) => r.id !== rowId) }
          : s
      )
    );
  }

  function updateFabricRow(secIdx: number, rowId: string, field: keyof CostItemRow, val: any) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? {
              ...s,
              fabricRows: s.fabricRows.map((r) =>
                r.id === rowId ? { ...r, [field]: val } : r
              ),
            }
          : s
      )
    );
  }

  function addGarmentRow(idx: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === idx
          ? {
              ...s,
              garmentRows: [
                ...s.garmentRows,
                { id: `${s.id}-g${Date.now()}`, item: "Item", detail: "—", value: 0 },
              ],
            }
          : s
      )
    );
  }

  function deleteGarmentRow(secIdx: number, rowId: string) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? { ...s, garmentRows: s.garmentRows.filter((r) => r.id !== rowId) }
          : s
      )
    );
  }

  function updateGarmentRow(secIdx: number, rowId: string, field: keyof CostItemRow, val: any) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? {
              ...s,
              garmentRows: s.garmentRows.map((r) =>
                r.id === rowId ? { ...r, [field]: val } : r
              ),
            }
          : s
      )
    );
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setStyleImage(url);
  }

  async function handleSave() {
    const costSheet: CostSheet = {
      id: costingId || `cost-${Date.now()}`,
      brand,
      name: costingName.trim() || "Untitled Costing",
      styleNo: costingName.trim() || `STYLE-${Date.now().toString().slice(-4)}`,
      fabricComposition,
      gsm,
      currency: "USD",
      exchangeRate: usdRate,
      targetQuantity: 0,
      garmentCount: noOfGarments,
      garmentSections: [],
      notes: "",
      usdFinalPrice: finalPriceUsd,
      image: styleImage || undefined,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    await saveOrUpdateCosting(costSheet);
    setToastMsg("Costing saved!");
    setTimeout(() => router.push("/costing"), 1000);
  }

  // ── Table Component (reused for fabric & garment) ──────────────────────────
  function CostTable({
    rows,
    onUpdate,
    onDelete,
    onAdd,
  }: {
    rows: CostItemRow[];
    onUpdate: (id: string, field: keyof CostItemRow, val: any) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
  }) {
    return (
      <div className="space-y-3">
        <table className="w-full text-left text-gray-300 border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-800/80 text-[11px] font-bold text-gray-400">
              <th className="py-2 px-2">Item</th>
              <th className="py-2 px-2 text-center">Detail</th>
              <th className="py-2 px-2 text-center">Value</th>
              <th className="py-2 px-1 w-6" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="py-1.5 px-2">
                  <input
                    type="text"
                    value={r.item}
                    onChange={(e) => onUpdate(r.id, "item", e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black/60 px-2.5 py-1 text-xs text-white outline-none focus:border-teal-400"
                  />
                </td>
                <td className="py-1.5 px-2">
                  <input
                    type="text"
                    value={r.detail}
                    onChange={(e) => onUpdate(r.id, "detail", e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black/60 px-2.5 py-1 text-xs text-center text-gray-300 outline-none focus:border-teal-400"
                  />
                </td>
                <td className="py-1.5 px-2">
                  <input
                    type="number"
                    value={r.value || ""}
                    placeholder="0"
                    onChange={(e) => onUpdate(r.id, "value", parseFloat(e.target.value) || 0)}
                    className="w-20 rounded-lg border border-gray-800 bg-black/60 px-2.5 py-1 text-xs text-center font-mono text-white outline-none focus:border-teal-400"
                  />
                </td>
                <td className="py-1.5 px-1 text-center">
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="p-1 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300"
        >
          <Plus size={14} /> Add
        </button>
      </div>
    );
  }

  return (
    <SourcingShell>
      <div className="max-w-6xl mx-auto space-y-6 pb-24 text-gray-200">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed bottom-24 right-6 z-50 rounded-lg bg-teal-500 px-4 py-2.5 text-xs font-bold text-black shadow-xl">
            {toastMsg}
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Costing</h1>
        </div>

        {/* ── Top Info Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2/3: Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Brand</label>
                <div className="relative">
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  >
                    {["Sinsay", "Reserved", "Mohito", "Cropp", "House", "SOXO"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Costing Name</label>
                <input
                  type="text"
                  value={costingName}
                  placeholder="e.g. 160MA"
                  onChange={(e) => setCostingName(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Fabric Composition</label>
                <input
                  type="text"
                  value={fabricComposition}
                  placeholder="e.g. 100% COTTON"
                  onChange={(e) => setFabricComposition(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Fabric Type</label>
                <input
                  type="text"
                  value={fabricType}
                  placeholder="e.g. Single Jersey"
                  onChange={(e) => setFabricType(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">GSM</label>
                <input
                  type="text"
                  value={gsm}
                  placeholder="e.g. 160"
                  onChange={(e) => setGsm(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white placeholder-gray-600 outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">No. of Garments</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={noOfGarments}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                    setNoOfGarments(v);
                  }}
                  className="w-full rounded-lg border border-teal-500/60 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Right 1/3: Style Image */}
          <div className="space-y-2">
            <div className="rounded-lg bg-blue-600 text-white font-bold text-center py-2 text-xs tracking-wider uppercase">
              STYLE IMAGE
            </div>
            <label className="flex flex-col items-center justify-center w-full h-44 rounded-2xl border border-dashed border-gray-800 bg-[#0d1414] hover:border-teal-500/50 transition cursor-pointer p-4 text-center group">
              {styleImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={styleImage} alt="Style" className="max-h-36 max-w-full object-contain rounded-lg" />
              ) : (
                <div className="space-y-1.5 text-gray-500 group-hover:text-teal-400 transition-colors">
                  <ImageIcon size={28} className="mx-auto text-gray-400 group-hover:text-teal-400" />
                  <span className="text-xs font-semibold block text-gray-300">Click to upload</span>
                  <span className="text-[10px] text-gray-500 block">JPG, PNG, WEBP</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        {/* ── Per-Garment Sections ──────────────────────────────────────────── */}
        {sections.map((sec, secIdx) => {
          const t = sectionTotals[secIdx] ?? { fabricBase: 0, wastageAmount: 0, totalFabricCost: 0, garmentBase: 0, overheadAmount: 0, totalCost: 0 };

          return (
            <div key={sec.id} className="space-y-4">
              {/* Garment Name Field */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-semibold">
                  Garment {secIdx + 1} name:
                </span>
                <input
                  type="text"
                  value={sec.name}
                  onChange={(e) => updateSectionName(secIdx, e.target.value)}
                  className="rounded-lg border border-gray-800 bg-[#0d1414] px-3 py-1.5 text-xs text-white w-40 outline-none focus:border-teal-400"
                />
              </div>

              {/* Two Cards Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FABRIC COST Card */}
                <div className="rounded-2xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-xl">
                  <div className="bg-[#b45309] px-6 py-2.5 text-center">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                      FABRIC COST – {sec.name}
                    </h2>
                  </div>
                  <div className="p-5 space-y-4 text-xs">
                    <CostTable
                      rows={sec.fabricRows}
                      onUpdate={(id, field, val) => updateFabricRow(secIdx, id, field, val)}
                      onDelete={(id) => deleteFabricRow(secIdx, id)}
                      onAdd={() => addFabricRow(secIdx)}
                    />

                    {/* Totals */}
                    <div className="pt-2 border-t border-gray-800/80 space-y-2">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>Total</span>
                        <span className="font-mono">{t.fabricBase}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-semibold">Wastage</span>
                          <input
                            type="number"
                            value={sec.wastagePct}
                            onChange={(e) => updateSectionWastage(secIdx, parseFloat(e.target.value) || 0)}
                            className="w-12 rounded border border-gray-800 bg-black px-1.5 py-0.5 text-center font-mono text-white text-xs outline-none focus:border-teal-400"
                          />
                          <span className="text-gray-400">%</span>
                        </div>
                        <span className="font-mono text-gray-300">{t.wastageAmount}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-[#3b2314] px-3.5 py-2 font-bold text-amber-200 border border-amber-800/40">
                        <span>Total Fabric Cost</span>
                        <span className="font-mono">{t.totalFabricCost}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GARMENT COST Card */}
                <div className="rounded-2xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-xl">
                  <div className="bg-[#b45309] px-6 py-2.5 text-center">
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                      GARMENT COST – {sec.name}
                    </h2>
                  </div>
                  <div className="p-5 space-y-4 text-xs">
                    <CostTable
                      rows={sec.garmentRows}
                      onUpdate={(id, field, val) => updateGarmentRow(secIdx, id, field, val)}
                      onDelete={(id) => deleteGarmentRow(secIdx, id)}
                      onAdd={() => addGarmentRow(secIdx)}
                    />

                    {/* Totals */}
                    <div className="pt-2 border-t border-gray-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-semibold">Overheads + Profit</span>
                          <input
                            type="number"
                            value={sec.overheadPct}
                            onChange={(e) => updateSectionOverhead(secIdx, parseFloat(e.target.value) || 0)}
                            className="w-12 rounded border border-gray-800 bg-black px-1.5 py-0.5 text-center font-mono text-white text-xs outline-none focus:border-teal-400"
                          />
                          <span className="text-gray-400">%</span>
                        </div>
                        <span className="font-mono text-gray-300">{t.overheadAmount}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-white border-t border-gray-800/40 pt-1">
                        <span>Total Cost</span>
                        <span className="font-mono">{t.totalCost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Grand Total Summary (shown when >1 garment) ─────────────────── */}
        {noOfGarments > 1 && (
          <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-xl space-y-2 text-xs">
            {sections.map((sec, idx) => {
              const t = sectionTotals[idx];
              return (
                <div key={sec.id} className="flex items-center justify-between py-1 border-b border-gray-800/60">
                  <span className="text-gray-400">{sec.name} Total Cost</span>
                  <span className="font-mono font-bold text-white">{t?.totalCost ?? 0}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-1 font-bold text-white">
              <span>Grand Total</span>
              <span className="font-mono text-sm">{grandTotal}</span>
            </div>
          </div>
        )}

        {/* ── USD Conversion Card ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-white">USD</span>
            <input
              type="number"
              value={usdRate}
              onChange={(e) => setUsdRate(parseFloat(e.target.value) || 0)}
              className="w-20 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-mono font-bold text-white text-xs outline-none focus:border-teal-400"
            />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${finalPriceUsd.toFixed(2)}
          </div>
        </div>

        {/* ── Bottom Actions ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/costing")}
            className="rounded-lg border border-gray-800 px-5 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-[#00BFA5] px-7 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl"
          >
            Save Costing
          </button>
        </div>
      </div>
    </SourcingShell>
  );
}

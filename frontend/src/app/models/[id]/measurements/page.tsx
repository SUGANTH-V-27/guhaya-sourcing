"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Plus,
  Ruler,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi } from "@/lib/api/models-api";
import { uploadModelFile } from "@/lib/storage";

interface MeasurementRow {
  pom: string;
  tolerance: string;
  sizes: Record<string, string>;
}

export default function ModelMeasurementsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);

  // ── Garment Count State ────────────────────────────────────────────────────
  const [garmentCount, setGarmentCount] = useState(1);
  const [garmentLabels, setGarmentLabels] = useState<string[]>(["Garment 1"]);

  // ── Sizes State ────────────────────────────────────────────────────────────
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSizeInput, setNewSizeInput] = useState("");

  // ── Uploaded Images State ──────────────────────────────────────────────────
  const [chartImages, setChartImages] = useState<Record<number, { name: string; url?: string }>>({});
  const [wayToMeasureImages, setWayToMeasureImages] = useState<Array<{ name: string; url?: string }>>([]);

  // ── Spec Table Rows State ──────────────────────────────────────────────────
  const [specRows, setSpecRows] = useState<MeasurementRow[]>([]);

  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    ModelsApi.getQcInspections(modelId, "measurements")
      .then((records) => {
        const latest = records[0] as any;
        if (!latest?.remarks) return;
        try {
          const saved = JSON.parse(latest.remarks);
          if (saved.garmentCount) setGarmentCount(saved.garmentCount);
          if (saved.garmentLabels) setGarmentLabels(saved.garmentLabels);
          if (saved.sizes) setSizes(saved.sizes);
          if (saved.chartImages) setChartImages(saved.chartImages);
          if (saved.wayToMeasureImages) setWayToMeasureImages(saved.wayToMeasureImages);
          if (saved.specRows) setSpecRows(saved.specRows);
        } catch {}
      })
      .catch(() => {});
  }, [modelId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleGarmentCountChange(count: number) {
    const val = Math.max(1, Math.min(10, count || 1));
    setGarmentCount(val);
    const newLabels = [...garmentLabels];
    while (newLabels.length < val) {
      newLabels.push(`Garment ${newLabels.length + 1}`);
    }
    setGarmentLabels(newLabels.slice(0, val));
  }

  function handleAddSize() {
    if (!newSizeInput.trim()) return;
    const clean = newSizeInput.trim().toUpperCase();
    if (!sizes.includes(clean)) {
      setSizes([...sizes, clean]);
      setSpecRows((prev) =>
        prev.map((row) => ({
          ...row,
          sizes: { ...row.sizes, [clean]: "" },
        }))
      );
    }
    setNewSizeInput("");
  }

  function handleRemoveSize(sizeToRemove: string) {
    if (sizes.length <= 1) return;
    setSizes(sizes.filter((s) => s !== sizeToRemove));
  }

  async function handleChartUpload(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = (await uploadModelFile(modelId, file)) || URL.createObjectURL(file);
      setChartImages((prev) => ({ ...prev, [index]: { name: file.name, url } }));
    } catch (error: any) {
      alert(error?.message || "Failed to upload measurement chart.");
    }
  }

  async function handleWayUpload(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = (await uploadModelFile(modelId, file)) || URL.createObjectURL(file);
      setWayToMeasureImages((prev) =>
        prev.map((item, i) => (i === index ? { name: file.name, url } : item))
      );
    } catch (error: any) {
      alert(error?.message || "Failed to upload measurement image.");
    }
  }

  function handleAddWayImage() {
    setWayToMeasureImages([...wayToMeasureImages, { name: "" }]);
  }

  function handleAddSpecRow() {
    const defaultSizes: Record<string, string> = {};
    sizes.forEach((s) => (defaultSizes[s] = ""));
    const newRow: MeasurementRow = {
      pom: "",
      tolerance: "±1.0 cm",
      sizes: defaultSizes,
    };
    setSpecRows([...specRows, newRow]);
  }

  function handleDeleteSpecRow(index: number) {
    if (specRows.length <= 1) return;
    setSpecRows(specRows.filter((_, i) => i !== index));
  }

  function handleUpdateSpecRow(index: number, field: keyof MeasurementRow, value: any) {
    setSpecRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  }

  async function handleSave() {
    try {
      await ModelsApi.saveQcInspection({
        id: `measurements-${modelId}`,
        modelId,
        inspectionType: "measurements",
        inspectionDate: new Date().toISOString(),
        result: "Pending",
        remarks: JSON.stringify({ garmentCount, garmentLabels, sizes, chartImages, wayToMeasureImages, specRows }),
      });
    } catch (error: any) {
      alert(error?.message || "Failed to save measurement specifications.");
      return;
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-20 max-w-6xl mx-auto">
        {/* Top Back Link */}
        <div>
          <Link
            href={`/models/${modelId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-teal-400 transition"
          >
            <ArrowLeft size={14} /> Back to Model
          </Link>
        </div>

        {/* Header with Ruler Icon & Save Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Ruler size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
                MEASUREMENTS
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Model <span className="font-mono text-white font-semibold">{modelId || "5906482949644"}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-6 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg self-start sm:self-auto"
          >
            <Save size={15} /> SAVE
          </button>
        </div>

        {/* Save Confirmation Toast */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ Measurement specs, charts, and way-to-measure guidelines saved!</span>
            <button onClick={() => setIsSaved(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* ── Section 1: NUMBER OF GARMENTS ──────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              NUMBER OF GARMENTS
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Define how many garments are in this style (e.g. TOP + SHORTS = 2)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={10}
              value={garmentCount}
              onChange={(e) => handleGarmentCountChange(parseInt(e.target.value) || 1)}
              className="w-16 rounded-lg border border-gray-800 bg-black px-3 py-2 font-mono text-xs font-bold text-white outline-none focus:border-teal-400"
            />
            <span className="text-xs text-gray-400">garment(s)</span>
          </div>

          {/* Garment Labels Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {garmentLabels.map((label, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold w-20 shrink-0">
                  Garment {idx + 1}
                </span>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => {
                    const newLabels = [...garmentLabels];
                    newLabels[idx] = e.target.value;
                    setGarmentLabels(newLabels);
                  }}
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: SIZES ───────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              SIZES
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Define the sizes for AI measurement extraction
            </p>
          </div>

          {/* Size Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            {sizes.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-mono font-bold text-teal-300"
              >
                {s}
                <button
                  type="button"
                  onClick={() => handleRemoveSize(s)}
                  className="text-teal-400 hover:text-white ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>

          {/* Size Add Input */}
          <div className="flex items-center gap-3 max-w-sm">
            <input
              type="text"
              placeholder="e.g. S, M, L..."
              value={newSizeInput}
              onChange={(e) => setNewSizeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSize())}
              className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddSize}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
            >
              <Plus size={14} /> Add size
            </button>
          </div>
        </div>

        {/* ── Section 3: MEASUREMENT CHART IMAGES ────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              MEASUREMENT CHART IMAGES
            </h2>
          </div>

          <div className="space-y-4">
            {garmentLabels.map((gLabel, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-xs font-semibold text-gray-300">
                  {gLabel} — Measurement Chart
                </span>

                {/* Drop Zone */}
                {chartImages[idx]?.url ? (
                  <div className="relative w-full sm:w-80 h-44 rounded-2xl border border-teal-500/40 bg-black p-2 overflow-hidden shadow-lg group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={chartImages[idx].url}
                      alt={chartImages[idx].name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setChartImages((prev) => {
                          const copy = { ...prev };
                          delete copy[idx];
                          return copy;
                        })
                      }
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 text-red-400 hover:bg-black hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full sm:w-80 h-36 rounded-2xl border-2 border-dashed border-teal-900/60 bg-black/40 hover:border-teal-500/50 hover:bg-black/60 transition cursor-pointer space-y-2 group">
                    <Upload size={22} className="text-teal-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200">
                      Upload measurement chart
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleChartUpload(idx, e)}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: WAY TO MEASURE IMAGES ────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              WAY TO MEASURE IMAGES
            </h2>
            <button
              type="button"
              onClick={handleAddWayImage}
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
            >
              <Plus size={14} /> Add image
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {wayToMeasureImages.map((way, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-xs font-semibold text-gray-300">
                  Way to Measure {wayToMeasureImages.length > 1 ? `#${idx + 1}` : ""}
                </span>

                {way.url ? (
                  <div className="relative w-full h-44 rounded-2xl border border-teal-500/40 bg-black p-2 overflow-hidden shadow-lg group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={way.url}
                      alt={way.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setWayToMeasureImages(wayToMeasureImages.filter((_, i) => i !== idx))
                      }
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 text-red-400 hover:bg-black hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-teal-900/60 bg-black/40 hover:border-teal-500/50 hover:bg-black/60 transition cursor-pointer space-y-2 group">
                    <Upload size={22} className="text-teal-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200">
                      Upload way to measure
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleWayUpload(idx, e)}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 5: INTERACTIVE MEASUREMENT SPEC TABLE ──────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                POINT OF MEASURE (POM) SPECIFICATION
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Garment measurements in centimeters (cm) with tolerance limits
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSpecRow}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition"
            >
              <Plus size={14} /> Add POM
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/40">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-3 px-4 min-w-[260px]">Point of Measure</th>
                  <th className="py-3 px-3 text-center min-w-[110px]">Tolerance</th>
                  {sizes.map((s) => (
                    <th key={s} className="py-3 px-3 text-center min-w-[90px] uppercase">
                      {s} (cm)
                    </th>
                  ))}
                  <th className="py-3 px-2 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {specRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/20 transition">
                    <td className="py-2.5 px-4 font-sans">
                      <input
                        type="text"
                        value={row.pom}
                        placeholder="e.g. Chest Width (1 inch below armhole)"
                        onChange={(e) => handleUpdateSpecRow(idx, "pom", e.target.value)}
                        className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-xs text-white placeholder-gray-600 outline-none hover:border-gray-800 focus:border-teal-400 focus:bg-black"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="text"
                        value={row.tolerance}
                        placeholder="±1.0 cm"
                        onChange={(e) => handleUpdateSpecRow(idx, "tolerance", e.target.value)}
                        className="w-20 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs text-amber-300 outline-none focus:border-teal-400"
                      />
                    </td>
                    {sizes.map((s) => (
                      <td key={s} className="py-2.5 px-3 text-center">
                        <input
                          type="text"
                          value={row.sizes[s] ?? ""}
                          placeholder="0.0"
                          onChange={(e) =>
                            handleUpdateSpecRow(idx, "sizes", {
                              ...row.sizes,
                              [s]: e.target.value,
                            })
                          }
                          className="w-16 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs font-bold text-teal-300 outline-none focus:border-teal-400"
                        />
                      </td>
                    ))}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteSpecRow(idx)}
                        className="text-gray-600 hover:text-red-400 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-8 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl"
          >
            <Save size={15} /> SAVE
          </button>
        </div>
      </div>
    </SourcingShell>
  );
}

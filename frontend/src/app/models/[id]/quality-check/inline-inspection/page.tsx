"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Download,
  FileCheck,
  FileText,
  Plus,
  Ruler,
  Save,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";

interface DefectRow {
  id: string;
  description: string;
  critical: number;
  major: number;
  minor: number;
}

interface InlineInspectionReport {
  id: string;
  styleNumber: string;
  poNumber: string;
  orderQty: number;
  factory: string;
  inlineDate: string;
  outputQty: number;
  sampleSize: number;
  maxCritical: number;
  maxMajor: number;
  maxMinor: number;
  defects: DefectRow[];
  totalCritical: number;
  totalMajor: number;
  totalMinor: number;
  result: "PASS" | "FAIL";
  checkMeasurements: boolean;
  comments: string;
  createdAt: string;
}

// AQL Level II Standard Calculation Helper
function getAqlSample(qty: number) {
  if (qty <= 0) return { sampleSize: 0, maxCritical: 0, maxMajor: 0, maxMinor: 0 };
  if (qty <= 50) return { sampleSize: 8, maxCritical: 0, maxMajor: 0, maxMinor: 1 };
  if (qty <= 150) return { sampleSize: 20, maxCritical: 0, maxMajor: 1, maxMinor: 2 };
  if (qty <= 280) return { sampleSize: 32, maxCritical: 0, maxMajor: 2, maxMinor: 3 };
  if (qty <= 500) return { sampleSize: 50, maxCritical: 0, maxMajor: 3, maxMinor: 5 };
  if (qty <= 1200) return { sampleSize: 80, maxCritical: 0, maxMajor: 5, maxMinor: 7 };
  if (qty <= 3200) return { sampleSize: 125, maxCritical: 0, maxMajor: 7, maxMinor: 10 };
  if (qty <= 10000) return { sampleSize: 200, maxCritical: 0, maxMajor: 10, maxMinor: 14 };
  return { sampleSize: 315, maxCritical: 0, maxMajor: 14, maxMinor: 21 };
}

export default function InlineInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);

  // ── Mode: "list" | "create" ────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [inspections, setInspections] = useState<InlineInspectionReport[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // ── Form State for New/Edit Inline Inspection ──────────────────────────────
  const [styleNumber, setStyleNumber] = useState(modelId || "");
  const [poNumber, setPoNumber] = useState("");
  const [orderQty, setOrderQty] = useState<number | string>("");
  const [factory, setFactory] = useState("");
  const [inlineDate, setInlineDate] = useState(new Date().toISOString().split("T")[0]);
  const [outputQty, setOutputQty] = useState<string>("");

  const [defects, setDefects] = useState<DefectRow[]>([]);

  const [checkMeasurements, setCheckMeasurements] = useState<boolean>(false);
  const [comments, setComments] = useState("");

  // ── AQL Calculation ────────────────────────────────────────────────────────
  const outputNumber = parseInt(outputQty.replace(/,/g, "")) || 0;
  const aql = useMemo(() => getAqlSample(outputNumber), [outputNumber]);

  const totals = useMemo(() => {
    const critical = defects.reduce((sum, d) => sum + (d.critical || 0), 0);
    const major = defects.reduce((sum, d) => sum + (d.major || 0), 0);
    const minor = defects.reduce((sum, d) => sum + (d.minor || 0), 0);
    const isPass =
      critical <= aql.maxCritical &&
      (aql.sampleSize === 0 || major <= aql.maxMajor) &&
      (aql.sampleSize === 0 || minor <= aql.maxMinor);

    return {
      critical,
      major,
      minor,
      result: isPass ? ("PASS" as const) : ("FAIL" as const),
    };
  }, [defects, aql]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleAddDefectRow() {
    setDefects([
      ...defects,
      { id: `d-${Date.now()}`, description: "", critical: 0, major: 0, minor: 0 },
    ]);
  }

  function handleDeleteDefectRow(id: string) {
    if (defects.length <= 1) return;
    setDefects(defects.filter((d) => d.id !== id));
  }

  function handleUpdateDefect(
    id: string,
    field: keyof DefectRow,
    value: string | number
  ) {
    setDefects((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  }

  function handleSaveInspection() {
    const newReport: InlineInspectionReport = {
      id: `inline-${Date.now()}`,
      styleNumber,
      poNumber,
      orderQty: Number(orderQty) || 0,
      factory,
      inlineDate,
      outputQty: outputNumber,
      sampleSize: aql.sampleSize,
      maxCritical: aql.maxCritical,
      maxMajor: aql.maxMajor,
      maxMinor: aql.maxMinor,
      defects,
      totalCritical: totals.critical,
      totalMajor: totals.major,
      totalMinor: totals.minor,
      result: totals.result,
      checkMeasurements,
      comments,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setInspections([newReport, ...inspections]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setViewMode("list");
  }

  function handleDeleteInspection(id: string) {
    if (confirm("Delete this in-line inspection?")) {
      setInspections(inspections.filter((i) => i.id !== id));
    }
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-20 max-w-5xl mx-auto">
        {/* Save Toast Notification */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ In-Line Inspection report saved successfully!</span>
            <button onClick={() => setIsSaved(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            VIEW 1: LIST / EMPTY STATE (Screenshot 1)
           ══════════════════════════════════════════════════════════════════════ */}
        {viewMode === "list" && (
          <div className="space-y-6">
            {/* Top Back Link */}
            <div>
              <Link
                href={`/models/${modelId}/quality-check`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-teal-400 transition"
              >
                <ArrowLeft size={14} /> Back to Quality Check
              </Link>
            </div>

            {/* Header & Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <ClipboardCheck size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
                    In-Line Inspection
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Model <span className="font-mono text-white font-semibold">{modelId || "5906482949644"}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewMode("create")}
                className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg self-start sm:self-auto"
              >
                <Plus size={15} /> Create New In-Line Inspection
              </button>
            </div>

            {/* Empty State / List */}
            {inspections.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-[#0d1414] py-20 px-4 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-black/60 border border-gray-800 flex items-center justify-center text-gray-500 shadow-inner">
                  <ClipboardCheck size={26} className="text-teal-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No in-line inspections yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Create the first in-line inspection report for this style.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode("create")}
                  className="flex items-center gap-2 rounded-full bg-[#00BFA5] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg"
                >
                  <Plus size={15} /> Create New In-Line Inspection
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {inspections.map((insp) => (
                  <div
                    key={insp.id}
                    className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-teal-500/10 px-2.5 py-0.5 text-xs font-bold text-teal-300 border border-teal-500/20 font-mono">
                          {insp.inlineDate}
                        </span>
                        <h3 className="text-base font-bold text-white">In-Line Sewing Audit</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Output: {insp.outputQty.toLocaleString()} pcs • Checked: {insp.sampleSize} pcs (AQL II) • Major: {insp.totalMajor}, Minor: {insp.totalMinor}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          insp.result === "PASS"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {insp.result}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteInspection(insp.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            VIEW 2: CREATE IN-LINE INSPECTION REPORT (Screenshots 2, 3, 4)
           ══════════════════════════════════════════════════════════════════════ */}
        {viewMode === "create" && (
          <div className="space-y-6">
            {/* Top Back Link */}
            <div>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-teal-400 transition cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to In-Line Inspections
              </button>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-500/40 flex items-center justify-center text-blue-400 font-mono font-black text-sm shrink-0">
                  IL
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight font-serif uppercase">
                    NEW IN-LINE INSPECTION
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Model <span className="font-mono text-white font-semibold">{styleNumber}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveInspection}
                className="flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-6 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg self-start sm:self-auto"
              >
                <Save size={14} /> SAVE
              </button>
            </div>

            {/* ── Section 1: ORDER INFORMATION ───────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-xl">
              <div className="bg-[#1b2533] px-6 py-3 border-b border-gray-700">
                <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  ORDER INFORMATION
                </h2>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">
                    Style Number
                  </label>
                  <input
                    type="text"
                    value={styleNumber}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-white cursor-default"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">
                    PO Number
                  </label>
                  <input
                    type="text"
                    value={poNumber}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-white cursor-default"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">
                    Order Quantity
                  </label>
                  <input
                    type="text"
                    value={orderQty.toLocaleString()}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono font-bold text-white cursor-default"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">
                    Factory
                  </label>
                  <input
                    type="text"
                    value={factory}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-white cursor-default"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">
                    In-Line Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={inlineDate}
                      onChange={(e) => setInlineDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-white outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">
                    Output Quantity
                  </label>
                  <input
                    type="text"
                    value={outputQty}
                    placeholder="Enter output qty..."
                    onChange={(e) => setOutputQty(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            </div>

            {/* ── Section 2: AQL STANDARD — PIECES TO CHECK ──────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                AQL STANDARD — PIECES TO CHECK
              </h2>

              {outputNumber === 0 ? (
                <div className="rounded-xl border border-gray-800 bg-black/40 p-5 text-center text-xs text-gray-500">
                  Enter the <span className="font-bold text-white">Output Quantity</span> above to auto-calculate the AQL sample size.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-3.5 text-center">
                    <span className="text-[10px] text-teal-400 font-bold block uppercase">SAMPLE SIZE (AQL II)</span>
                    <span className="text-lg font-black text-white mt-0.5 block">{aql.sampleSize} pcs</span>
                  </div>

                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-center">
                    <span className="text-[10px] text-red-400 font-bold block uppercase">CRITICAL MAX</span>
                    <span className="text-lg font-black text-red-300 mt-0.5 block">{aql.maxCritical}</span>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center">
                    <span className="text-[10px] text-amber-400 font-bold block uppercase">MAJOR MAX (2.5)</span>
                    <span className="text-lg font-black text-amber-300 mt-0.5 block">{aql.maxMajor}</span>
                  </div>

                  <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3.5 text-center">
                    <span className="text-[10px] text-yellow-400 font-bold block uppercase">MINOR MAX (4.0)</span>
                    <span className="text-lg font-black text-yellow-300 mt-0.5 block">{aql.maxMinor}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 3: DEFECT ENTRY ────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                DEFECT ENTRY
              </h2>

              <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/40">
                <table className="w-full text-left text-xs text-gray-300 border-collapse">
                  <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold text-gray-400">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-4 min-w-[280px]">Defect Description</th>
                      <th className="py-3 px-3 text-center w-24 text-red-400 font-bold">Critical</th>
                      <th className="py-3 px-3 text-center w-24 text-amber-400 font-bold">Major</th>
                      <th className="py-3 px-3 text-center w-24 text-yellow-400 font-bold">Minor</th>
                      <th className="py-3 px-2 w-8 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-sans">
                    {defects.map((def, idx) => (
                      <tr key={def.id} className="hover:bg-gray-800/20 transition">
                        <td className="py-2.5 px-3 text-center font-mono text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={def.description}
                            placeholder="Defect description..."
                            onChange={(e) => handleUpdateDefect(def.id, "description", e.target.value)}
                            className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            value={def.critical || ""}
                            placeholder="0"
                            onChange={(e) => handleUpdateDefect(def.id, "critical", parseInt(e.target.value) || 0)}
                            className="w-20 rounded-lg border border-red-500/40 bg-black px-2 py-1.5 text-center font-mono text-xs font-bold text-red-400 outline-none focus:border-red-400"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            value={def.major || ""}
                            placeholder="0"
                            onChange={(e) => handleUpdateDefect(def.id, "major", parseInt(e.target.value) || 0)}
                            className="w-20 rounded-lg border border-amber-500/40 bg-black px-2 py-1.5 text-center font-mono text-xs font-bold text-amber-400 outline-none focus:border-amber-400"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min={0}
                            value={def.minor || ""}
                            placeholder="0"
                            onChange={(e) => handleUpdateDefect(def.id, "minor", parseInt(e.target.value) || 0)}
                            className="w-20 rounded-lg border border-yellow-500/40 bg-black px-2 py-1.5 text-center font-mono text-xs font-bold text-yellow-300 outline-none focus:border-yellow-400"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteDefectRow(def.id)}
                            className="p-1 text-gray-600 hover:text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Summary Row: Total Found */}
                    <tr className="bg-black/60 font-mono text-xs font-bold border-t border-gray-800">
                      <td colSpan={2} className="py-3 px-5 text-gray-300 font-sans">
                        Total Found:
                      </td>
                      <td className="py-3 px-3 text-center text-red-400">{totals.critical}</td>
                      <td className="py-3 px-3 text-center text-amber-400">{totals.major}</td>
                      <td className="py-3 px-3 text-center text-yellow-400">{totals.minor}</td>
                      <td></td>
                    </tr>

                    {/* Summary Row: Accept */}
                    <tr className="bg-black/40 font-mono text-xs font-bold">
                      <td colSpan={2} className="py-2.5 px-5 text-gray-400 font-sans">
                        Accept:
                      </td>
                      <td className="py-2.5 px-3 text-center text-red-500">{aql.maxCritical}</td>
                      <td className="py-2.5 px-3 text-center text-gray-300">{aql.maxMajor || "—"}</td>
                      <td className="py-2.5 px-3 text-center text-gray-300">{aql.maxMinor || "—"}</td>
                      <td></td>
                    </tr>

                    {/* Summary Row: Result */}
                    <tr className="bg-black/80 font-mono text-xs font-bold">
                      <td colSpan={2} className="py-3 px-5 text-white font-sans">
                        Result:
                      </td>
                      <td colSpan={3} className="py-3 px-3 text-left">
                        <span
                          className={`rounded-md px-4 py-1 text-xs font-black ${
                            totals.result === "PASS"
                              ? "bg-emerald-500 text-black"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {totals.result}
                        </span>
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddDefectRow}
                  className="rounded-lg border border-teal-500/40 bg-teal-500/10 px-4 py-2 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition"
                >
                  + ADD DEFECT ROW
                </button>
              </div>
            </div>

            {/* ── Section 4: MEASUREMENT CHECK TOGGLE ────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-6 text-xs">
                <span className="font-semibold text-white">Do you want to check measurements</span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="measureToggle"
                    checked={checkMeasurements === true}
                    onChange={() => setCheckMeasurements(true)}
                    className="accent-teal-400"
                  />
                  <span>Yes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="measureToggle"
                    checked={checkMeasurements === false}
                    onChange={() => setCheckMeasurements(false)}
                    className="accent-teal-400"
                  />
                  <span>No</span>
                </label>
              </div>

              {/* Expandable Measurement Table if Yes */}
              {checkMeasurements && (
                <div className="pt-2 space-y-2">
                  <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/40">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold uppercase text-gray-400">
                        <tr>
                          <th className="py-2.5 px-4">Point of Measure</th>
                          <th className="py-2.5 px-3 text-center">Spec (cm)</th>
                          <th className="py-2.5 px-3 text-center">Measured (cm)</th>
                          <th className="py-2.5 px-3 text-center">Diff</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60 font-mono">
                        {[
                          { pom: "Total Width (Flat)", spec: "42.0", actual: "42.2", diff: "+0.2", status: "PASS" },
                          { pom: "Total Height", spec: "46.0", actual: "46.0", diff: "0.0", status: "PASS" },
                          { pom: "Handle Drop Length", spec: "28.0", actual: "28.1", diff: "+0.1", status: "PASS" },
                        ].map((m, idx) => (
                          <tr key={idx} className="hover:bg-gray-800/20">
                            <td className="py-2 px-4 font-sans text-gray-200">{m.pom}</td>
                            <td className="py-2 px-3 text-center">{m.spec}</td>
                            <td className="py-2 px-3 text-center text-teal-300">{m.actual}</td>
                            <td className="py-2 px-3 text-center">{m.diff}</td>
                            <td className="py-2 px-3 text-center">
                              <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 5: COMMENTS / FINDINGS ─────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                COMMENTS / FINDINGS
              </h2>

              <textarea
                rows={4}
                value={comments}
                placeholder="Enter your comments or findings here..."
                onChange={(e) => setComments(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-teal-400 leading-relaxed"
              />
            </div>

            {/* Bottom Save Action */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveInspection}
                className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-8 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl"
              >
                <Save size={15} /> Save In-Line Inspection
              </button>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

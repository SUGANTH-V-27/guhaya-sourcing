"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bluetooth,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
  Ruler,
  Save,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi } from "@/lib/api/models-api";

interface SizeQtyItem {
  id: string;
  size: string;
  qty: string;
}

interface GSMItem {
  id: string;
  fabricLabel: string;
  colourCode: string;
  requiredGsm: number;
  evaluatedGsm: string;
  imageName?: string;
  imageUrl?: string;
}

interface EvaluationRecord {
  id: string;
  sampleType: string;
  submission: string;
  sizes: SizeQtyItem[];
  gsmEvaluations: GSMItem[];
  comments: string;
  status: "PASS" | "FAIL" | "PENDING";
  createdAt: string;
}

export default function SampleEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);

  // ── Mode: "list" | "create" ────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    ModelsApi.getQcInspections(modelId, "sample-evaluation")
      .then((records) => {
        setEvaluations(records.flatMap((record: any) => {
          try { return [JSON.parse(record.remarks) as EvaluationRecord]; } catch { return []; }
        }));
      })
      .catch(() => {});
  }, [modelId]);

  // ── Form State for New/Edit Evaluation ─────────────────────────────────────
  const [sampleType, setSampleType] = useState("Fit Sample");
  const [submission, setSubmission] = useState("1st Submission");
  const [sizeList, setSizeList] = useState<SizeQtyItem[]>([]);
  const [gsmList, setGsmList] = useState<GSMItem[]>([]);

  const [comments, setComments] = useState("");
  const [bleConnected, setBleConnected] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleAddSizeRow() {
    setSizeList([
      ...sizeList,
      { id: `sq-${Date.now()}`, size: "", qty: "1" },
    ]);
  }

  function handleDeleteSizeRow(id: string) {
    if (sizeList.length <= 1) return;
    setSizeList(sizeList.filter((s) => s.id !== id));
  }

  function handleUpdateSizeRow(id: string, field: "size" | "qty", val: string) {
    setSizeList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  }

  function handleGsmImageUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setGsmList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, imageName: file.name, imageUrl: url } : g))
    );
  }

  async function handleSaveEvaluation() {
    const newEval: EvaluationRecord = {
      id: `eval-${Date.now()}`,
      sampleType,
      submission,
      sizes: sizeList,
      gsmEvaluations: gsmList,
      comments,
      status: "PASS",
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      await ModelsApi.saveQcInspection({
        id: newEval.id,
        modelId,
        inspectionType: "sample-evaluation",
        inspectionDate: new Date().toISOString(),
        result: newEval.status,
        remarks: JSON.stringify(newEval),
      });
    } catch (error: any) {
      alert(error?.message || "Failed to save sample evaluation.");
      return;
    }
    setEvaluations([newEval, ...evaluations]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setViewMode("list");
  }

  async function handleDeleteEval(id: string) {
    if (confirm("Delete this sample evaluation report?")) {
      try {
        await ModelsApi.deleteQcInspection(modelId, id);
        setEvaluations((current) => current.filter((e) => e.id !== id));
      } catch (error: any) {
        alert(error?.message || "Failed to delete sample evaluation.");
      }
    }
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-20 max-w-5xl mx-auto">
        {/* Save Toast Notification */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ Sample evaluation report saved successfully!</span>
            <button onClick={() => setIsSaved(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            VIEW 1: LIST / EMPTY VIEW (Image 1)
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
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Ruler size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
                    Sample Evaluation
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
                <Plus size={15} /> Create New Sample Evaluation
              </button>
            </div>

            {/* Empty State / List */}
            {evaluations.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-[#0d1414] py-20 px-4 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-black/60 border border-gray-800 flex items-center justify-center text-gray-500 shadow-inner">
                  <Ruler size={26} className="text-teal-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No sample evaluations yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Create the first sample evaluation report for this style.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode("create")}
                  className="flex items-center gap-2 rounded-full bg-[#00BFA5] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg"
                >
                  <Plus size={15} /> Create New Sample Evaluation
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {evaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-teal-500/10 px-2.5 py-0.5 text-xs font-bold text-teal-300 border border-teal-500/20">
                          {ev.submission}
                        </span>
                        <h3 className="text-base font-bold text-white">{ev.sampleType}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Sizes: {ev.sizes.map((s) => `${s.size} (${s.qty} pcs)`).join(", ")} • Created: {ev.createdAt}
                      </p>
                      {ev.comments && (
                        <p className="text-xs text-gray-400 italic mt-1 line-clamp-1">
                          Remarks: {ev.comments}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                        {ev.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEval(ev.id)}
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
            VIEW 2: CREATE / EDIT SAMPLE EVALUATION FORM (Images 2 & 3)
           ══════════════════════════════════════════════════════════════════════ */}
        {viewMode === "create" && (
          <div className="space-y-6">
            {/* Top Back Link to List */}
            <div>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-teal-400 transition cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Sample Evaluations
              </button>
            </div>

            {/* Form Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Ruler size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight font-serif uppercase">
                    SAMPLE EVALUATION
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Model <span className="font-mono text-white font-semibold">{modelId || "5906482949644"}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: BLE Tape, Export, Save */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setBleConnected(!bleConnected)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
                    bleConnected
                      ? "border-teal-400 bg-teal-500/20 text-teal-300"
                      : "border-gray-800 bg-[#0d1414] text-gray-300 hover:border-gray-700"
                  }`}
                >
                  <Bluetooth size={14} className={bleConnected ? "text-teal-400" : "text-gray-400"} />
                  <span>{bleConnected ? "Tape Connected" : "BLE Tape"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
                >
                  <Download size={14} /> EXPORT <ChevronDown size={12} />
                </button>

                <button
                  type="button"
                  onClick={handleSaveEvaluation}
                  className="flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg"
                >
                  <Save size={14} /> SAVE
                </button>
              </div>
            </div>

            {/* ── Card 1: SAMPLE ────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                SAMPLE
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Sample Type
                  </label>
                  <div className="relative">
                    <select
                      value={sampleType}
                      onChange={(e) => setSampleType(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                    >
                      <option value="Proto">Proto Sample</option>
                      <option value="Fit Sample">Fit Sample</option>
                      <option value="Size Set">Size Set</option>
                      <option value="Gold Seal">Gold Seal</option>
                      <option value="Sales Sample">Sales Sample</option>
                      <option value="TOP / Pre-production">TOP / Pre-production</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Submission
                  </label>
                  <div className="relative">
                    <select
                      value={submission}
                      onChange={(e) => setSubmission(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                    >
                      <option value="1st Submission">1st Submission</option>
                      <option value="2nd Submission">2nd Submission</option>
                      <option value="3rd Submission">3rd Submission</option>
                      <option value="4th Submission">4th Submission</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 2: SIZE & QUANTITY ────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  SIZE &amp; QUANTITY
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add multiple sizes if needed
                </p>
              </div>

              <div className="space-y-3">
                {sizeList.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={item.size}
                      placeholder="Size (e.g. ONE S, M, L)"
                      onChange={(e) => handleUpdateSizeRow(item.id, "size", e.target.value)}
                      className="w-44 rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                    />

                    <span className="text-gray-400 font-bold">✕</span>

                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleUpdateSizeRow(item.id, "qty", e.target.value)}
                      className="w-24 rounded-lg border border-gray-800 bg-black px-3 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                    />

                    <span className="text-xs text-gray-400">pcs</span>

                    <button
                      type="button"
                      onClick={() => handleDeleteSizeRow(item.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition ml-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAddSizeRow}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
                >
                  <Plus size={14} /> Add another size
                </button>
              </div>
            </div>

            {/* ── Card 3: GSM EVALUATION (TOLERANCE: ±3%) ─────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  GSM EVALUATION <span className="text-gray-400 font-normal">(TOLERANCE: ±3%)</span>
                </h2>
              </div>

              <div className="space-y-6">
                {gsmList.map((gsm) => {
                  const minGsm = +(gsm.requiredGsm * 0.97).toFixed(1);
                  const maxGsm = +(gsm.requiredGsm * 1.03).toFixed(1);
                  return (
                    <div key={gsm.id} className="space-y-3.5 pt-2 border-t border-gray-800/80 first:border-0 first:pt-0">
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        {gsm.fabricLabel}
                      </span>

                      {/* Colour Code */}
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                          Colour Code
                        </label>
                        <input
                          type="text"
                          value={gsm.colourCode}
                          onChange={(e) =>
                            setGsmList((prev) =>
                              prev.map((g) => (g.id === gsm.id ? { ...g, colourCode: e.target.value } : g))
                            )
                          }
                          className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                        />
                      </div>

                      {/* Required GSM with Tolerance Range on right */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-semibold text-gray-400">
                            Required GSM
                          </label>
                          <span className="text-[11px] font-mono text-gray-500">
                            {minGsm} – {maxGsm}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={`${gsm.requiredGsm} GSM`}
                          readOnly
                          className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs font-mono font-bold text-white outline-none cursor-default"
                        />
                      </div>

                      {/* GSM Evaluated */}
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                          GSM Evaluated
                        </label>
                        <input
                          type="text"
                          value={gsm.evaluatedGsm}
                          placeholder="Enter GSM..."
                          onChange={(e) =>
                            setGsmList((prev) =>
                              prev.map((g) => (g.id === gsm.id ? { ...g, evaluatedGsm: e.target.value } : g))
                            )
                          }
                          className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs font-mono text-teal-300 outline-none focus:border-teal-400"
                        />
                      </div>

                      {/* GSM Image Upload Box */}
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                          GSM Image
                        </label>

                        {gsm.imageUrl ? (
                          <div className="relative w-full sm:w-80 h-36 rounded-xl border border-teal-500/40 bg-black p-2 overflow-hidden shadow-inner group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={gsm.imageUrl} alt={gsm.imageName} className="w-full h-full object-contain rounded-lg" />
                            <button
                              type="button"
                              onClick={() =>
                                setGsmList((prev) =>
                                  prev.map((g) => (g.id === gsm.id ? { ...g, imageName: undefined, imageUrl: undefined } : g))
                                )
                              }
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-teal-900/60 bg-black/40 hover:border-teal-500/50 hover:bg-black/60 transition cursor-pointer space-y-1.5 group">
                            <Camera size={20} className="text-teal-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200">
                              Upload
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleGsmImageUpload(gsm.id, e)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Card 4: COMMENTS ───────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                COMMENTS
              </h2>

              <textarea
                rows={4}
                value={comments}
                placeholder="Enter your comments here..."
                onChange={(e) => setComments(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-teal-400 leading-relaxed"
              />
            </div>

            {/* Bottom Save Action */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveEvaluation}
                className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-8 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl"
              >
                <Save size={15} /> SAVE
              </button>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

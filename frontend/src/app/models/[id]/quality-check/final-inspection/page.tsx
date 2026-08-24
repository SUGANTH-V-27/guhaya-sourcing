"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Download,
  Edit2,
  Eye,
  FileCheck,
  FileText,
  Mail,
  Package,
  Plus,
  Ruler,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { models } from "@/lib/mock-data";

type ResultStatus = "PASSED" | "FAILED" | "INCONCLUSIVE";

interface ChecklistSection {
  key: string;
  title: string;
  status: ResultStatus;
  notes?: string;
  expanded?: boolean;
}

interface FinalInspectionReport {
  id: string;
  modelCode: string;
  selectedPos: string[];
  brand: string;
  vendorName: string;
  factoryAddress: string;
  department: string;
  productDesc: string;
  approvedSample: string;
  fabric: string;
  gsm: string;
  inspectionDate: string;
  inspectorName: string;
  overallConclusion: "PASS" | "FAIL";
  sections: ChecklistSection[];
  stylePhotos: string[];
  createdAt: string;
}

export default function FinalInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);
  const currentModel = models.find((m) => m.id === modelId || m.code === modelId);

  // ── Mode: "list" | "create" ────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [reports, setReports] = useState<FinalInspectionReport[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // ── PO Selection Pop-up Modal State ────────────────────────────────────────
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [availablePos] = useState([
    { poNo: "PI_NF_001", channel: "Retail", orderQty: 5760 },
  ]);
  const [selectedPos, setSelectedPos] = useState<string[]>(["PI_NF_001"]);

  // ── Form State for New Final Inspection ────────────────────────────────────
  const [brand] = useState("SOXO");
  const [modelCode] = useState(modelId || "5906482949644");
  const [department] = useState("Home Textiles");
  const [productDesc] = useState("CHAOS Tote Bag");
  const [approvedSample, setApprovedSample] = useState("Available");

  const [vendorName] = useState("NANDHI FABRICS");
  const [factoryAddress] = useState("34- KAMARAJAPURAM (EAST), KARUR -639002, (TN) INDIA");
  const [fabric] = useState("100% Cotton ; WOVEN");
  const [gsm] = useState("280 GSM");
  const [inspectionDate, setInspectionDate] = useState("2026-08-23");
  const [inspectorName, setInspectorName] = useState("Suganth V (Lead Auditor)");

  const [overallConclusion, setOverallConclusion] = useState<"PASS" | "FAIL">("PASS");

  // ── 7 Inspection Result Summary Modules ────────────────────────────────────
  const [sections, setSections] = useState<ChecklistSection[]>([
    { key: "qty", title: "A. Quantity", status: "PASSED", notes: "100% carton count and 5,760 pcs verified." },
    { key: "packing", title: "B. Packing Audit – Retail", status: "PASSED", notes: "Barcodes scanned 100% readable." },
    { key: "conformity", title: "C. Product Conformity", status: "PASSED", notes: "Print sharpness and color match approved standard." },
    { key: "labeling", title: "D. Labeling & Trims", status: "PASSED", notes: "Wash care and fiber composition accurate." },
    { key: "gsm", title: "E. GSM", status: "PASSED", notes: "Evaluated 280 GSM (Tolerance: ±3%)." },
    { key: "aql", title: "F. AQL", status: "PASSED", notes: "AQL 2.5 Major: 0 found (Max 7), Minor: 2 found (Max 10)." },
    { key: "measurement", title: "G. Measurement", status: "PASSED", notes: "All POM measurements within tolerance." },
  ]);

  // ── Style Pictures State ───────────────────────────────────────────────────
  const [stylePhotos, setStylePhotos] = useState<string[]>([]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleOpenPoModal() {
    setIsPoModalOpen(true);
  }

  function handleProceedFromPoModal() {
    if (selectedPos.length === 0) {
      alert("Please select at least one PO number for inspection.");
      return;
    }
    setIsPoModalOpen(false);
    setViewMode("create");
  }

  function handleSectionStatus(key: string, status: ResultStatus) {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, status } : s))
    );
  }

  function toggleSectionExpand(key: string) {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, expanded: !s.expanded } : s))
    );
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setStylePhotos([...stylePhotos, url]);
  }

  function handleSaveReport() {
    const newReport: FinalInspectionReport = {
      id: `final-${Date.now()}`,
      modelCode,
      selectedPos,
      brand,
      vendorName,
      factoryAddress,
      department,
      productDesc,
      approvedSample,
      fabric,
      gsm,
      inspectionDate,
      inspectorName,
      overallConclusion,
      sections,
      stylePhotos,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setReports([newReport, ...reports]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setViewMode("list");
  }

  function handleDeleteReport(id: string) {
    if (confirm("Delete this final inspection report?")) {
      setReports(reports.filter((r) => r.id !== id));
    }
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-28 max-w-6xl mx-auto">
        {/* Save Toast Notification */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ Final Inspection Report saved successfully!</span>
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
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <ClipboardCheck size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
                    Final Inspection
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Model <span className="font-mono text-white font-semibold">{modelId || "5906482949644"}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenPoModal}
                className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg self-start sm:self-auto"
              >
                <Plus size={15} /> Create New Final Inspection
              </button>
            </div>

            {/* Empty State / List */}
            {reports.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-[#0d1414] py-20 px-4 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-black/60 border border-gray-800 flex items-center justify-center text-gray-500 shadow-inner">
                  <ClipboardCheck size={26} className="text-teal-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No final inspections yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Create the first final inspection report for this style.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenPoModal}
                  className="flex items-center gap-2 rounded-full bg-[#00BFA5] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg"
                >
                  <Plus size={15} /> Create New Final Inspection
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-teal-500/10 px-2.5 py-0.5 text-xs font-bold text-teal-300 border border-teal-500/20 font-mono">
                          {rep.selectedPos.join(", ")}
                        </span>
                        <h3 className="text-base font-bold text-white">Final Pre-Shipment Inspection (PSI)</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Auditor: {rep.inspectorName} • Factory: {rep.vendorName} • Date: {rep.inspectionDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          rep.overallConclusion === "PASS"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {rep.overallConclusion}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteReport(rep.id)}
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
            VIEW 2: CREATE FINAL INSPECTION REPORT (Screenshots 3, 4, 5)
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
                <ArrowLeft size={14} /> Back to Final Inspections
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <ClipboardCheck size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight font-serif uppercase">
                  FINAL INSPECTION REPORT
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Model <span className="font-mono text-white font-semibold">{modelCode}</span>
                </p>
              </div>
            </div>

            {/* ── Section 1: GENERAL INFORMATION ──────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <div className="space-y-2">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  GENERAL INFORMATION
                </h2>
                <div className="w-full h-[1.5px] bg-teal-500/30 rounded" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={brand}
                      readOnly
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-white cursor-default"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={modelCode}
                      readOnly
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-white cursor-default"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Purchase Order (PO) No.
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 rounded-lg border border-gray-800 bg-black px-3.5 py-2">
                        {selectedPos.map((po) => (
                          <span
                            key={po}
                            className="inline-flex items-center gap-1 rounded bg-teal-500/10 px-2 py-0.5 text-xs font-mono font-bold text-teal-300 border border-teal-500/20"
                          >
                            {po} <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1 rounded">Retail</span>
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenPoModal}
                        className="flex items-center gap-1 rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      readOnly
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-white cursor-default"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Product Description
                    </label>
                    <input
                      type="text"
                      value={productDesc}
                      readOnly
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-white cursor-default"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Approved Sample
                    </label>
                    <div className="relative">
                      <select
                        value={approvedSample}
                        onChange={(e) => setApprovedSample(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-white outline-none focus:border-teal-400"
                      >
                        <option value="Available">Available (Gold Seal Sample)</option>
                        <option value="Not Available">Not Available</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Vendor Name (Factory)
                    </label>
                    <input
                      type="text"
                      value={vendorName}
                      readOnly
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-white cursor-default"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Factory Address
                    </label>
                    <input
                      type="text"
                      value={factoryAddress}
                      readOnly
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-gray-300 cursor-default"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Fabric
                    </label>
                    <input
                      type="text"
                      value={fabric}
                      readOnly
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-white cursor-default"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      GSM
                    </label>
                    <input
                      type="text"
                      value={gsm}
                      readOnly
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-white cursor-default"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Inspection Date
                    </label>
                    <input
                      type="date"
                      value={inspectionDate}
                      onChange={(e) => setInspectionDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Inspector Name(s)
                    </label>
                    <input
                      type="text"
                      value={inspectorName}
                      placeholder="Name"
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-white outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: OVERALL INSPECTION CONCLUSION ───────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                OVERALL INSPECTION CONCLUSION
              </h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOverallConclusion("PASS")}
                  className={`rounded-lg px-8 py-2 text-xs font-black transition ${
                    overallConclusion === "PASS"
                      ? "bg-emerald-500 text-black ring-2 ring-emerald-400"
                      : "bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-950"
                  }`}
                >
                  PASS
                </button>

                <button
                  type="button"
                  onClick={() => setOverallConclusion("FAIL")}
                  className={`rounded-lg px-8 py-2 text-xs font-black transition ${
                    overallConclusion === "FAIL"
                      ? "bg-red-500 text-white ring-2 ring-red-400"
                      : "bg-red-950/40 border border-red-800/60 text-red-400 hover:bg-red-950"
                  }`}
                >
                  FAIL
                </button>
              </div>
            </div>

            {/* ── Section 3: INSPECTION RESULT SUMMARY (7 Expandable Modules) ─── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-xl">
              <div className="bg-[#1b2533] px-6 py-3 border-b border-gray-700">
                <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  INSPECTION RESULT SUMMARY
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300 border-collapse">
                  <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold uppercase text-gray-400">
                    <tr>
                      <th className="py-3 px-5 min-w-[300px]">Inspection Result Summary</th>
                      <th className="py-3 px-4 text-center w-28 text-emerald-400">PASSED</th>
                      <th className="py-3 px-4 text-center w-28 text-red-400">FAILED</th>
                      <th className="py-3 px-4 text-center w-36 text-gray-400">INCONCLUSIVE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-sans">
                    {sections.map((sec) => (
                      <React.Fragment key={sec.key}>
                        <tr className="hover:bg-gray-800/20 transition">
                          <td className="py-3 px-5 font-bold text-teal-300">
                            <button
                              type="button"
                              onClick={() => toggleSectionExpand(sec.key)}
                              className="flex items-center gap-1.5 hover:underline text-left text-teal-300"
                            >
                              <span>{sec.title}</span>
                              <ChevronRight
                                size={14}
                                className={`transition-transform ${sec.expanded ? "rotate-90" : ""}`}
                              />
                            </button>
                          </td>

                          {/* PASSED */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleSectionStatus(sec.key, "PASSED")}
                              className={`w-6 h-6 rounded border mx-auto flex items-center justify-center transition ${
                                sec.status === "PASSED"
                                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-400"
                                  : "border-gray-700 bg-transparent text-transparent hover:border-gray-500"
                              }`}
                            >
                              {sec.status === "PASSED" && <Check size={14} strokeWidth={3} />}
                            </button>
                          </td>

                          {/* FAILED */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleSectionStatus(sec.key, "FAILED")}
                              className={`w-6 h-6 rounded border mx-auto flex items-center justify-center transition ${
                                sec.status === "FAILED"
                                  ? "border-red-400 bg-red-500/20 text-red-400"
                                  : "border-gray-700 bg-transparent text-transparent hover:border-gray-500"
                              }`}
                            >
                              {sec.status === "FAILED" && <X size={14} strokeWidth={3} />}
                            </button>
                          </td>

                          {/* INCONCLUSIVE */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleSectionStatus(sec.key, "INCONCLUSIVE")}
                              className={`w-6 h-6 rounded border mx-auto flex items-center justify-center transition ${
                                sec.status === "INCONCLUSIVE"
                                  ? "border-amber-400 bg-amber-500/20 text-amber-400"
                                  : "border-gray-700 bg-transparent text-transparent hover:border-gray-500"
                              }`}
                            >
                              {sec.status === "INCONCLUSIVE" && <span className="text-[11px] font-black">?</span>}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Details Pane */}
                        {sec.expanded && (
                          <tr className="bg-black/40">
                            <td colSpan={4} className="p-4 px-6 text-xs text-gray-300 space-y-2 border-b border-gray-800">
                              <div className="rounded-xl border border-gray-800 bg-[#070b0b] p-3.5">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                  Auditor Checklist &amp; Verification Notes
                                </span>
                                <input
                                  type="text"
                                  value={sec.notes || ""}
                                  placeholder="Enter specific findings, measurements, or packaging remarks for this module..."
                                  onChange={(e) =>
                                    setSections(
                                      sections.map((s) => (s.key === sec.key ? { ...s, notes: e.target.value } : s))
                                    )
                                  }
                                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Section 4: STYLE PICTURES ──────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                STYLE PICTURES
              </h2>

              <div className="flex flex-wrap items-center gap-4">
                {/* Model Image Frame */}
                <div className="relative w-48 h-52 rounded-2xl border border-teal-500/40 bg-white p-2 overflow-hidden shadow-inner flex flex-col items-center justify-between">
                  <div className="w-full flex-1 flex items-center justify-center overflow-hidden">
                    {currentModel?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={currentModel.image} alt="Model" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                        <span className="font-black text-base tracking-widest bg-gradient-to-r from-teal-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                          CHAOS
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-full bg-black/80 py-1 text-center text-[10px] font-bold text-white rounded-md mt-1">
                    Model Image
                  </div>
                </div>

                {/* Uploaded Photos */}
                {stylePhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative w-48 h-52 rounded-2xl border border-gray-800 bg-black p-2 overflow-hidden shadow-lg group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="Photo" className="w-full h-full object-contain rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setStylePhotos(stylePhotos.filter((_, i) => i !== idx))}
                      className="absolute top-3 right-3 p-1 rounded-lg bg-black/80 text-red-400 hover:text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {/* Add Photo Drop Zone */}
                <label className="flex flex-col items-center justify-center w-48 h-52 rounded-2xl border-2 border-dashed border-teal-900/60 bg-black/40 hover:border-teal-500/50 hover:bg-black transition cursor-pointer space-y-2 group">
                  <Upload size={22} className="text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-teal-400">Add Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            {/* ── Fixed Bottom Action Bar ────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => alert("Report mailed to vendor and buyer representatives.")}
                className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white transition"
              >
                <Mail size={14} /> MAIL REPORT
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-xs font-semibold text-gray-200 hover:text-white transition"
              >
                <Download size={14} /> DOWNLOAD PDF
              </button>

              <button
                type="button"
                onClick={handleSaveReport}
                className="flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-8 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl"
              >
                <Save size={14} /> SAVE
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            MODAL: SELECT PO NUMBERS FOR INSPECTION (Screenshot 2)
           ══════════════════════════════════════════════════════════════════════ */}
        {isPoModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
            onClick={() => setIsPoModalOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0d1414] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-900/50">
                <h2 className="text-base font-bold text-white">Select PO numbers for inspection</h2>
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 text-xs">
                <p className="text-gray-400">
                  Choose the purchase orders to include in this final inspection.
                </p>

                <div className="space-y-2">
                  {availablePos.map((po) => {
                    const isChecked = selectedPos.includes(po.poNo);
                    return (
                      <label
                        key={po.poNo}
                        className="flex items-center justify-between rounded-xl border border-gray-800 bg-black/60 p-3.5 cursor-pointer hover:border-teal-500/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              setSelectedPos(
                                isChecked
                                  ? selectedPos.filter((p) => p !== po.poNo)
                                  : [...selectedPos, po.poNo]
                              )
                            }
                            className="accent-teal-400 w-4 h-4"
                          />
                          <span className="font-mono font-bold text-white text-sm">{po.poNo}</span>
                        </div>

                        <span className="rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 text-[11px] font-bold">
                          {po.channel}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setIsPoModalOpen(false)}
                    className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedFromPoModal}
                    className="rounded-lg bg-[#00BFA5] px-6 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg"
                  >
                    PROCEED
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Download,
  FileCheck,
  Plus,
  Save,
  Trash2,
  XCircle,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";

type StatusVal = "OK" | "NOT OK" | "N/A";
type YesNoVal = "YES" | "NO";

interface ElementRow {
  id: string;
  category: string;
  element: string;
  status?: StatusVal;
  remarks: string;
  sublabel?: string;
}

interface KeyPointRow {
  id: string;
  question: string;
  status?: YesNoVal;
  remarks: string;
}

export default function FirstGarmentOutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);

  // ── Header Details State ───────────────────────────────────────────────────
  const [styleCode] = useState(modelId || "5906482949644");
  const [orderNo] = useState("PI_NF_001");
  const [factory] = useState("NANDHI FABRICS");
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split("T")[0]);
  const [reviewedBy, setReviewedBy] = useState("Suganth V (Quality Lead)");

  // ── Element Inspection Rows ────────────────────────────────────────────────
  const [rows, setRows] = useState<ElementRow[]>([
    // Trimmings
    { id: "t-1", category: "Trimmings", element: "Main Label", status: "OK", remarks: "" },
    { id: "t-2", category: "Trimmings", element: "Size Print", status: "OK", remarks: "" },
    { id: "t-3", category: "Trimmings", element: "Wash care label", status: "OK", remarks: "" },
    { id: "t-4", category: "Trimmings", element: "Other Label", status: "N/A", remarks: "" },
    { id: "t-5", category: "Trimmings", element: "License label", status: "N/A", remarks: "" },
    { id: "t-6", category: "Trimmings", element: "Placement Print", status: "OK", remarks: "" },
    { id: "t-7", category: "Trimmings", element: "All Over Print", status: "N/A", remarks: "" },
    { id: "t-8", category: "Trimmings", element: "Embroidery", status: "N/A", remarks: "" },

    // Embellishment
    { id: "e-1", category: "Embellishment", element: "Embroidery Backing", status: "N/A", remarks: "" },
    { id: "e-2", category: "Embellishment", element: "Applique", status: "N/A", remarks: "" },
    { id: "e-3", category: "Embellishment", element: "Applique Backing", status: "N/A", remarks: "" },
    { id: "e-4", category: "Embellishment", element: "Sequins", status: "N/A", remarks: "" },
    { id: "e-5", category: "Embellishment", element: "Sequins Backing", status: "N/A", remarks: "" },
    { id: "e-6", category: "Embellishment", element: "Stone", status: "N/A", remarks: "" },

    // Fabric
    { id: "f-1", category: "Fabric", element: "Fabric Composition", status: "OK", remarks: "100% Cotton" },
    { id: "f-2", category: "Fabric", element: "Fabric GSM", status: "OK", remarks: "280 GSM verified" },
    { id: "f-3", category: "Fabric", element: "Fabric Shade", status: "OK", remarks: "Black shade approved" },
    { id: "f-4", category: "Fabric", element: "Shell 2 Composition", status: "N/A", remarks: "" },
    { id: "f-5", category: "Fabric", element: "Shell 2 GSM", status: "N/A", remarks: "" },
    { id: "f-6", category: "Fabric", element: "Shell 2 Shade", status: "N/A", remarks: "" },
    { id: "f-7", category: "Fabric", element: "Fabric Handfeel", status: "OK", remarks: "Good structure" },
    { id: "f-8", category: "Fabric", element: "Shell 2 Handfeel", status: "N/A", remarks: "" },
    { id: "f-9", category: "Fabric", element: "Lining", status: "N/A", remarks: "" },
    { id: "f-10", category: "Fabric", element: "Snap", status: "N/A", remarks: "" },
    { id: "f-11", category: "Fabric", element: "Rivets", status: "N/A", remarks: "" },

    // Buttons and 3D Elements
    {
      id: "b-1",
      category: "Buttons and 3D Elements",
      sublabel: "Need Additional Testing",
      element: "Button",
      status: "N/A",
      remarks: "",
    },
    {
      id: "b-2",
      category: "Buttons and 3D Elements",
      sublabel: "Need Additional Testing",
      element: "Spare Button",
      status: "N/A",
      remarks: "",
    },
    {
      id: "b-3",
      category: "Buttons and 3D Elements",
      sublabel: "Need Additional Testing",
      element: "Zipper",
      status: "N/A",
      remarks: "",
    },
    {
      id: "b-4",
      category: "Buttons and 3D Elements",
      sublabel: "Need Additional Testing",
      element: "Bow",
      status: "N/A",
      remarks: "",
    },
    {
      id: "b-5",
      category: "Buttons and 3D Elements",
      sublabel: "Need Additional Testing",
      element: "Other 3D Element",
      status: "N/A",
      remarks: "",
    },

    // Sewing Accessories
    { id: "s-1", category: "Sewing Accessories", element: "Twill Tape", status: "N/A", remarks: "" },
    { id: "s-2", category: "Sewing Accessories", element: "Drawcord", status: "N/A", remarks: "" },
    { id: "s-3", category: "Sewing Accessories", element: "Elastic", status: "N/A", remarks: "" },
    { id: "s-4", category: "Sewing Accessories", element: "Thread", status: "OK", remarks: "Core spun poly" },
    { id: "s-5", category: "Sewing Accessories", element: "Bartack", status: "OK", remarks: "Box-X at handles" },
    { id: "s-6", category: "Sewing Accessories", element: "Contrast Stitch", status: "N/A", remarks: "" },
    { id: "s-7", category: "Sewing Accessories", element: "SPI", status: "OK", remarks: "11-12 SPI verified" },
    { id: "s-8", category: "Sewing Accessories", element: "Mobilion Tape", status: "N/A", remarks: "" },
  ]);

  // ── Key Points To Check ────────────────────────────────────────────────────
  const [keyPoints, setKeyPoints] = useState<KeyPointRow[]>([
    {
      id: "kp-1",
      question: "Buyer's Comments Followed?",
      status: "YES",
      remarks: "All comments from tech pack V2 addressed.",
    },
    {
      id: "kp-2",
      question: "Comments from size set implemented?",
      status: "YES",
      remarks: "Handle width adjusted to 3.5cm as requested.",
    },
    {
      id: "kp-3",
      question: "All measurements are within tolerance?",
      status: "YES",
      remarks: "100% specs within ±1.0cm tolerance.",
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleStatusChange(rowId: string, status: StatusVal) {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, status } : r))
    );
  }

  function handleRemarksChange(rowId: string, remarks: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, remarks } : r))
    );
  }

  function handleAddCustomRow() {
    const newRow: ElementRow = {
      id: `custom-${Date.now()}`,
      category: "Others",
      element: "Custom Element",
      status: "OK",
      remarks: "",
    };
    setRows([...rows, newRow]);
  }

  function handleKeyPointStatus(kpId: string, status: YesNoVal) {
    setKeyPoints((prev) =>
      prev.map((k) => (k.id === kpId ? { ...k, status } : k))
    );
  }

  function handleKeyPointRemarks(kpId: string, remarks: string) {
    setKeyPoints((prev) =>
      prev.map((k) => (k.id === kpId ? { ...k, remarks } : k))
    );
  }

  function handleSave() {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  // Group rows by category
  const categories = Array.from(new Set(rows.map((r) => r.category)));

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-24 max-w-6xl mx-auto">
        {/* Top Back Link */}
        <div>
          <Link
            href={`/models/${modelId}/quality-check`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-teal-400 transition"
          >
            <ArrowLeft size={14} /> Back to Quality Check
          </Link>
        </div>

        {/* Save Toast Notification */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ First Bulk Review Report saved successfully!</span>
            <button onClick={() => setIsSaved(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Header with Title and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <ClipboardList size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight font-serif uppercase">
                FIRST BULK REVIEW REPORT
              </h1>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">
                Model: <span className="text-white font-bold">{styleCode}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-[#0d1414] px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
            >
              <Download size={14} /> Download PDF
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-6 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg"
            >
              <Save size={14} /> Save
            </button>
          </div>
        </div>

        {/* ── Main Container Card ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-2xl space-y-0">
          {/* Top Slate Banner */}
          <div className="bg-[#242b35] px-6 py-3 border-b border-gray-700">
            <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              FIRST BULK REVIEW REPORT
            </h2>
          </div>

          {/* 4-Column Details Grid */}
          <div className="p-6 border-b border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400 font-semibold w-28 shrink-0">Style:</span>
                <input
                  type="text"
                  value={styleCode}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-mono text-white cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400 font-semibold w-28 shrink-0">Order No.:</span>
                <input
                  type="text"
                  value={orderNo}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-mono text-white cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400 font-semibold w-28 shrink-0">Date:</span>
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-mono text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400 font-semibold w-28 shrink-0">Factory:</span>
                <input
                  type="text"
                  value={factory}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-white cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400 font-semibold w-28 shrink-0">Reviewed By:</span>
                <input
                  type="text"
                  value={reviewedBy}
                  placeholder="Reviewed By"
                  onChange={(e) => setReviewedBy(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          {/* ── Main Inspection Audit Table ─────────────────────────────────── */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 border-collapse">
              <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold uppercase text-gray-400">
                <tr>
                  <th className="py-3 px-5 w-44">CATEGORY</th>
                  <th className="py-3 px-4 min-w-[200px]">ELEMENTS</th>
                  <th className="py-3 px-3 text-center w-16">OK</th>
                  <th className="py-3 px-3 text-center w-16">NOT OK</th>
                  <th className="py-3 px-3 text-center w-16">N/A</th>
                  <th className="py-3 px-5 min-w-[260px]">REMARKS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-sans">
                {categories.map((catName) => {
                  const catRows = rows.filter((r) => r.category === catName);
                  return catRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-gray-800/20 transition">
                      {/* Category Column Spanning Rows */}
                      {idx === 0 && (
                        <td
                          rowSpan={catRows.length}
                          className="py-3 px-5 font-bold text-white border-r border-gray-800/80 align-top bg-black/20"
                        >
                          <div className="sticky top-2">
                            <span>{catName}</span>
                            {row.sublabel && (
                              <p className="text-[10px] text-red-400 font-normal mt-1 leading-tight">
                                {row.sublabel}
                              </p>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Element Name */}
                      <td className="py-2.5 px-4 font-semibold text-gray-200">
                        {row.element}
                      </td>

                      {/* OK Radio */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.id, "OK")}
                          className={`w-4 h-4 rounded-full border mx-auto flex items-center justify-center transition ${
                            row.status === "OK"
                              ? "border-emerald-400 bg-emerald-500"
                              : "border-gray-600 bg-transparent hover:border-gray-400"
                          }`}
                        >
                          {row.status === "OK" && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </button>
                      </td>

                      {/* NOT OK Radio */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.id, "NOT OK")}
                          className={`w-4 h-4 rounded-full border mx-auto flex items-center justify-center transition ${
                            row.status === "NOT OK"
                              ? "border-red-400 bg-red-500"
                              : "border-gray-600 bg-transparent hover:border-gray-400"
                          }`}
                        >
                          {row.status === "NOT OK" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>
                      </td>

                      {/* N/A Radio */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.id, "N/A")}
                          className={`w-4 h-4 rounded-full border mx-auto flex items-center justify-center transition ${
                            row.status === "N/A"
                              ? "border-gray-400 bg-gray-500"
                              : "border-gray-600 bg-transparent hover:border-gray-400"
                          }`}
                        >
                          {row.status === "N/A" && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </button>
                      </td>

                      {/* Remarks Input */}
                      <td className="py-2 px-5">
                        <input
                          type="text"
                          value={row.remarks}
                          placeholder="Remarks"
                          onChange={(e) => handleRemarksChange(row.id, e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-black/60 px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
                        />
                      </td>
                    </tr>
                  ));
                })}

                {/* Add Custom Rows in Others Category */}
                <tr className="bg-black/30">
                  <td className="py-3 px-5 font-bold text-white border-r border-gray-800/80">
                    Others
                  </td>
                  <td colSpan={5} className="py-3 px-4">
                    <button
                      type="button"
                      onClick={handleAddCustomRow}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300"
                    >
                      <Plus size={14} /> ADD ROWS
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Section: KEY POINTS TO CHECK ───────────────────────────────── */}
          <div className="border-t border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300 border-collapse">
                <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold uppercase text-gray-400">
                  <tr>
                    <th className="py-3 px-5 min-w-[320px]">KEY POINTS TO CHECK</th>
                    <th className="py-3 px-4 text-center w-20">YES</th>
                    <th className="py-3 px-4 text-center w-20">NO</th>
                    <th className="py-3 px-5 min-w-[260px]">REMARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-sans">
                  {keyPoints.map((kp) => (
                    <tr key={kp.id} className="hover:bg-gray-800/20 transition">
                      <td className="py-3 px-5 font-semibold text-gray-200">
                        {kp.question}
                      </td>

                      {/* YES */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleKeyPointStatus(kp.id, "YES")}
                          className={`w-4 h-4 rounded-full border mx-auto flex items-center justify-center transition ${
                            kp.status === "YES"
                              ? "border-emerald-400 bg-emerald-500"
                              : "border-gray-600 bg-transparent hover:border-gray-400"
                          }`}
                        >
                          {kp.status === "YES" && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </button>
                      </td>

                      {/* NO */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleKeyPointStatus(kp.id, "NO")}
                          className={`w-4 h-4 rounded-full border mx-auto flex items-center justify-center transition ${
                            kp.status === "NO"
                              ? "border-red-400 bg-red-500"
                              : "border-gray-600 bg-transparent hover:border-gray-400"
                          }`}
                        >
                          {kp.status === "NO" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>
                      </td>

                      {/* Remarks */}
                      <td className="py-2.5 px-5">
                        <input
                          type="text"
                          value={kp.remarks}
                          placeholder="Remarks"
                          onChange={(e) => handleKeyPointRemarks(kp.id, e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-black/60 px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-8 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl"
          >
            <Save size={15} /> Save First Bulk Review
          </button>
        </div>
      </div>
    </SourcingShell>
  );
}

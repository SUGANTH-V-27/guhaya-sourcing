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
  Download,
  FileCheck,
  FileText,
  Image as ImageIcon,
  Plus,
  Printer,
  Save,
  Trash2,
  Upload,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";

interface MeasurementRow {
  id: string;
  pom: string;
  description: string;
  tol: string;
  spec: string;
  dev1st: string;
  dev2nd: string;
}

interface MeasurementSection {
  id: string;
  name: string;
  color: string;
  bannerColor: string;
  date: string;
  description: string;
  rows: MeasurementRow[];
  comments: string;
}

interface CustomTrimItem {
  id: string;
  name: string;
  badge: string;
  imageUrl?: string;
  imageName?: string;
  remarks: string;
}

interface MeetingSection {
  id: string;
  title: string;
  minutes: string[];
  criticalAreas: string[];
}

export default function PreProductionMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);

  // ── General Info State ─────────────────────────────────────────────────────
  const [brand, setBrand] = useState("");
  const [modelNo, setModelNo] = useState(modelId || "");
  const [poNumber, setPoNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [approvedSample, setApprovedSample] = useState("");
  const [merchandiser, setMerchandiser] = useState("");

  const [factoryName, setFactoryName] = useState("");
  const [factoryAddress, setFactoryAddress] = useState("");
  const [fabric, setFabric] = useState("");
  const [composition, setComposition] = useState("");
  const [gsm, setGsm] = useState("");
  const [ppDate, setPpDate] = useState(new Date().toISOString().split("T")[0]);
  const [qualityController, setQualityController] = useState("");

  // ── PP Meeting Summary Checklist State ─────────────────────────────────────
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // ── Size Set Evaluation Measurement Sections ───────────────────────────────
  const [measurementSections, setMeasurementSections] = useState<MeasurementSection[]>([]);

  // ── Custom Trims State ─────────────────────────────────────────────────────
  const [trimmings, setTrimmings] = useState<CustomTrimItem[]>([]);

  // ── Meeting Minutes State ──────────────────────────────────────────────────
  const [minutesSections, setMinutesSections] = useState<MeetingSection[]>([]);

  const [ppMeetingResult, setPpMeetingResult] = useState<"PASS" | "FAIL">("PASS");
  const [stylePhoto, setStylePhoto] = useState<string | null>(null);
  const [generalPhoto, setGeneralPhoto] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleChecklistToggle(key: string, val: boolean) {
    setChecklist((prev) => ({ ...prev, [key]: val }));
  }

  function handleAddMeasurementSection() {
    const nextNum = measurementSections.length + 1;
    const newSec: MeasurementSection = {
      id: `sec-${Date.now()}`,
      name: `SECTION ${nextNum}`,
      color: "Purple",
      bannerColor: "bg-purple-600",
      date: new Date().toISOString().split("T")[0],
      description: "",
      rows: [
        {
          id: `r-${Date.now()}`,
          pom: "#",
          description: "Measurement point",
          tol: "±1.0",
          spec: "-",
          dev1st: "-",
          dev2nd: "-",
        },
      ],
      comments: "",
    };
    setMeasurementSections([...measurementSections, newSec]);
  }

  function handleDeleteMeasurementSection(id: string) {
    if (measurementSections.length <= 1) return;
    setMeasurementSections(measurementSections.filter((s) => s.id !== id));
  }

  function handleAddMeasurementRow(sectionId: string) {
    setMeasurementSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          rows: [
            ...sec.rows,
            {
              id: `r-${Date.now()}`,
              pom: "#",
              description: "Measurement point",
              tol: "±1.0",
              spec: "-",
              dev1st: "-",
              dev2nd: "-",
            },
          ],
        };
      })
    );
  }

  function handleDeleteMeasurementRow(sectionId: string, rowId: string) {
    setMeasurementSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          rows: sec.rows.filter((r) => r.id !== rowId),
        };
      })
    );
  }

  function handleUpdateMeasurementRow(
    sectionId: string,
    rowId: string,
    field: keyof MeasurementRow,
    val: string
  ) {
    setMeasurementSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          rows: sec.rows.map((r) => (r.id === rowId ? { ...r, [field]: val } : r)),
        };
      })
    );
  }

  function handleAddTrim() {
    setTrimmings([
      ...trimmings,
      {
        id: `trim-${Date.now()}`,
        name: `Custom Trim ${trimmings.length + 1}`,
        badge: "Extra",
        remarks: "",
      },
    ]);
  }

  function handleDeleteTrim(id: string) {
    setTrimmings(trimmings.filter((t) => t.id !== id));
  }

  function handleAddMinute(sectionId: string) {
    setMinutesSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, minutes: [...s.minutes, ""] }
          : s
      )
    );
  }

  function handleAddCriticalArea(sectionId: string) {
    const area = prompt("Enter critical risk area / observation:");
    if (!area) return;
    setMinutesSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, criticalAreas: [...s.criticalAreas, area] }
          : s
      )
    );
  }

  function handleSave() {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-20 max-w-6xl mx-auto">
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
            <span>✓ Pre-Production Meeting protocol and minutes saved!</span>
            <button onClick={() => setIsSaved(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Header with Title and Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-serif uppercase">
              PRE-PRODUCTION MEETING
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              Model: <span className="text-white font-bold">{modelNo}</span> — <span className="text-teal-400">{brand}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-[#0d1414] px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
            >
              <Download size={14} /> PDF
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

        {/* ── Section 1: GENERAL INFORMATION ────────────────────────────────── */}
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
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Brand:</span>
                <input
                  type="text"
                  value={brand}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-medium text-white cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Model:</span>
                <input
                  type="text"
                  value={modelNo}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-mono font-medium text-white cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Purchase Order (PO) No.:</span>
                <input
                  type="text"
                  value={poNumber}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-mono font-medium text-white cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Department:</span>
                <input
                  type="text"
                  value={department}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-gray-300 cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Product Description:</span>
                <input
                  type="text"
                  value={productDesc}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-white cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Approved Sample:</span>
                <div className="relative flex-1">
                  <select
                    value={approvedSample}
                    onChange={(e) => setApprovedSample(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-white outline-none focus:border-teal-400"
                  >
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Merchandiser:</span>
                <input
                  type="text"
                  value={merchandiser}
                  placeholder="Enter name"
                  onChange={(e) => setMerchandiser(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Factory Name:</span>
                <input
                  type="text"
                  value={factoryName}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-medium text-white cursor-default"
                />
              </div>

              <div className="flex items-start justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0 pt-1">Factory Address:</span>
                <textarea
                  rows={2}
                  value={factoryAddress}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-gray-300 cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Fabric:</span>
                <input
                  type="text"
                  value={fabric}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-gray-300 cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Composition:</span>
                <input
                  type="text"
                  value={composition}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-gray-300 cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">GSM:</span>
                <input
                  type="text"
                  value={gsm}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-mono text-white cursor-default"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">PP Meeting Date:</span>
                <input
                  type="date"
                  value={ppDate}
                  onChange={(e) => setPpDate(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 font-mono text-white outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-400 font-semibold w-44 shrink-0">Quality Controller:</span>
                <input
                  type="text"
                  value={qualityController}
                  placeholder="Enter name"
                  onChange={(e) => setQualityController(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: PP MEETING SUMMARY ─────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              PP MEETING SUMMARY
            </h2>
            <div className="w-full h-[1.5px] bg-teal-500/30 rounded" />
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/40">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold uppercase text-gray-400">
                <tr>
                  <th className="py-3 px-5">PP MEETING SUMMARY</th>
                  <th className="py-3 px-6 text-center w-36">CHECKED</th>
                  <th className="py-3 px-6 text-center w-36">NOT CHECKED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-sans">
                {[
                  { key: "size_set", label: "Size Set Evaluation" },
                  { key: "trims", label: "Trims" },
                  { key: "tna", label: "Production Planning / TNA" },
                  { key: "license", label: "License Authorisations (Only License styles)" },
                  { key: "detailed_checklist", label: "Detailed Checklist" },
                ].map((item) => {
                  const isChecked = checklist[item.key] === true;
                  return (
                    <tr key={item.key} className="hover:bg-gray-800/20 transition">
                      <td className="py-3 px-5 font-semibold text-gray-200">{item.label}</td>
                      <td className="py-3 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleChecklistToggle(item.key, true)}
                          className={`w-5 h-5 rounded border flex items-center justify-center mx-auto transition ${
                            isChecked
                              ? "bg-teal-500 border-teal-400 text-black font-black"
                              : "border-gray-700 bg-black/60 hover:border-gray-500"
                          }`}
                        >
                          {isChecked && <Check size={13} strokeWidth={3} />}
                        </button>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleChecklistToggle(item.key, false)}
                          className={`w-5 h-5 rounded border flex items-center justify-center mx-auto transition ${
                            !isChecked
                              ? "bg-red-500/20 border-red-500 text-red-400 font-black"
                              : "border-gray-700 bg-black/60 hover:border-gray-500"
                          }`}
                        >
                          {!isChecked && <Check size={13} strokeWidth={3} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section 3: SIZE SET EVALUATION — MEASUREMENTS ─────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              SIZE SET EVALUATION — MEASUREMENTS
            </h2>
            <button
              type="button"
              onClick={handleAddMeasurementSection}
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300"
            >
              <Plus size={14} /> Add Section
            </button>
          </div>

          <div className="space-y-5">
            {measurementSections.map((sec) => (
              <div
                key={sec.id}
                className="rounded-2xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-xl"
              >
                {/* Colored Section Header Banner */}
                <div className={`${sec.bannerColor} px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-white`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={sec.name}
                      onChange={(e) =>
                        setMeasurementSections(
                          measurementSections.map((s) => (s.id === sec.id ? { ...s, name: e.target.value } : s))
                        )
                      }
                      className="rounded bg-black/30 px-3 py-1 text-sm font-black text-white outline-none"
                    />

                    <div className="flex items-center gap-1.5">
                      <span className="text-white/80">Color:</span>
                      <input
                        type="text"
                        value={sec.color}
                        onChange={(e) =>
                          setMeasurementSections(
                            measurementSections.map((s) => (s.id === sec.id ? { ...s, color: e.target.value } : s))
                          )
                        }
                        className="w-20 rounded bg-black/30 px-2 py-1 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-white/80">Date:</span>
                      <input
                        type="date"
                        value={sec.date}
                        onChange={(e) =>
                          setMeasurementSections(
                            measurementSections.map((s) => (s.id === sec.id ? { ...s, date: e.target.value } : s))
                          )
                        }
                        className="rounded bg-black/30 px-2 py-1 text-xs text-white outline-none font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-white/80">Desc:</span>
                      <input
                        type="text"
                        value={sec.description}
                        placeholder="Description"
                        onChange={(e) =>
                          setMeasurementSections(
                            measurementSections.map((s) => (s.id === sec.id ? { ...s, description: e.target.value } : s))
                          )
                        }
                        className="w-48 rounded bg-black/30 px-2 py-1 text-xs text-white outline-none placeholder-white/50"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMeasurementSection(sec.id)}
                    className="p-1 rounded bg-black/20 text-white/80 hover:text-white hover:bg-black/40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Section Table */}
                <div className="p-5 space-y-4">
                  <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/40">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold uppercase text-gray-400">
                        <tr>
                          <th className="py-2.5 px-3 w-10">POM</th>
                          <th className="py-2.5 px-3 min-w-[200px]">DESCRIPTION</th>
                          <th className="py-2.5 px-3 text-center w-24">TOL +/-</th>
                          <th className="py-2.5 px-3 text-center" colSpan={3}>
                            ONE SIZE
                            <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-gray-500 mt-0.5">
                              <span>Spec</span>
                              <span>Dev 1st</span>
                              <span>Dev 2nd</span>
                            </div>
                          </th>
                          <th className="py-2.5 px-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60 font-mono">
                        {sec.rows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-800/20 transition">
                            <td className="py-2 px-3 font-bold text-gray-500">#</td>
                            <td className="py-2 px-3 font-sans">
                              <input
                                type="text"
                                value={row.description}
                                onChange={(e) => handleUpdateMeasurementRow(sec.id, row.id, "description", e.target.value)}
                                className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-xs text-white outline-none hover:border-gray-800 focus:border-teal-400 focus:bg-black"
                              />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <input
                                type="text"
                                value={row.tol}
                                onChange={(e) => handleUpdateMeasurementRow(sec.id, row.id, "tol", e.target.value)}
                                className="w-16 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs text-amber-300 outline-none"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="text"
                                value={row.spec}
                                onChange={(e) => handleUpdateMeasurementRow(sec.id, row.id, "spec", e.target.value)}
                                className="w-16 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs text-teal-300 outline-none"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="text"
                                value={row.dev1st}
                                onChange={(e) => handleUpdateMeasurementRow(sec.id, row.id, "dev1st", e.target.value)}
                                className="w-16 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs text-gray-200 outline-none"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="text"
                                value={row.dev2nd}
                                onChange={(e) => handleUpdateMeasurementRow(sec.id, row.id, "dev2nd", e.target.value)}
                                className="w-16 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs text-gray-200 outline-none"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteMeasurementRow(sec.id, row.id)}
                                className="p-1 text-gray-600 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => handleAddMeasurementRow(sec.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300"
                    >
                      <Plus size={13} /> Add Row
                    </button>
                  </div>

                  {/* Section Comments */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Comments
                    </label>
                    <textarea
                      rows={2}
                      value={sec.comments}
                      placeholder="Any comments for this section..."
                      onChange={(e) =>
                        setMeasurementSections(
                          measurementSections.map((s) => (s.id === sec.id ? { ...s, comments: e.target.value } : s))
                        )
                      }
                      className="w-full rounded-xl border border-gray-800 bg-black px-3.5 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: TRIMMINGS ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            TRIMMINGS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {trimmings.map((trim, idx) => (
              <div
                key={trim.id}
                className="rounded-2xl border border-gray-800 bg-black/40 p-4 space-y-3 shadow-inner relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-white">{trim.name}</h4>
                    <span className="rounded bg-teal-500/20 px-1.5 py-0.2 text-[10px] font-bold text-teal-300">
                      {trim.badge}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTrim(trim.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Upload Photo Drop Zone */}
                <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-teal-900/60 bg-black/40 hover:border-teal-500/50 hover:bg-black transition cursor-pointer space-y-1 group">
                  <Upload size={18} className="text-teal-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-gray-300">Upload Photo</span>
                  <span className="text-[10px] text-gray-500">Click to add evidence</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>

                <input
                  type="text"
                  value={trim.remarks}
                  placeholder="Remarks..."
                  onChange={(e) =>
                    setTrimmings(
                      trimmings.map((t) => (t.id === trim.id ? { ...t, remarks: e.target.value } : t))
                    )
                  }
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                />
              </div>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddTrim}
              className="inline-flex items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition"
            >
              <Plus size={13} /> Add New
            </button>
          </div>
        </div>

        {/* ── Section 5: MEETING MINUTES ────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              MEETING MINUTES
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
              <span>No. of Sections:</span>
              <span className="rounded bg-cyan-500 px-3 py-1 font-mono text-white">
                {minutesSections.length}
              </span>
            </div>
          </div>

          {minutesSections.map((mSec, idx) => (
            <div
              key={mSec.id}
              className="rounded-2xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-xl"
            >
              <div className="bg-cyan-600 px-5 py-2.5 flex items-center justify-between text-xs font-bold text-white">
                <span>SECTION {idx + 1}: {mSec.title}</span>
                <button
                  type="button"
                  onClick={() => setMinutesSections(minutesSections.filter((s) => s.id !== mSec.id))}
                  className="p-1 text-white/80 hover:text-white"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Meeting Minutes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                    <FileText size={15} className="text-teal-400" />
                    <span>MEETING MINUTES</span>
                  </div>

                  <div className="space-y-2">
                    {mSec.minutes.map((min, minIdx) => (
                      <div key={minIdx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">{minIdx + 1}.</span>
                        <input
                          type="text"
                          value={min}
                          placeholder="Enter meeting minute..."
                          onChange={(e) => {
                            const newMin = [...mSec.minutes];
                            newMin[minIdx] = e.target.value;
                            setMinutesSections(
                              minutesSections.map((s) => (s.id === mSec.id ? { ...s, minutes: newMin } : s))
                            );
                          }}
                          className="flex-1 rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddMinute(mSec.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300"
                  >
                    <Plus size={13} /> Add Minute
                  </button>
                </div>

                {/* Critical Areas */}
                <div className="space-y-2 pt-3 border-t border-gray-800/80">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <AlertTriangle size={15} />
                    <span>CRITICAL AREAS</span>
                  </div>

                  {mSec.criticalAreas.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">
                      No critical areas flagged for this section.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {mSec.criticalAreas.map((area, aIdx) => (
                        <div key={aIdx} className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300">
                          ⚠️ {area}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddCriticalArea(mSec.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                  >
                    <Plus size={13} /> Add Critical Area
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Section 6: PP MEETING RESULT ─────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            PP MEETING RESULT
          </h2>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPpMeetingResult("PASS")}
              className={`rounded-lg px-8 py-2 text-xs font-black transition ${
                ppMeetingResult === "PASS"
                  ? "bg-emerald-500 text-black ring-2 ring-emerald-400"
                  : "bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-950"
              }`}
            >
              PASS
            </button>

            <button
              type="button"
              onClick={() => setPpMeetingResult("FAIL")}
              className={`rounded-lg px-8 py-2 text-xs font-black transition ${
                ppMeetingResult === "FAIL"
                  ? "bg-red-500 text-white ring-2 ring-red-400"
                  : "bg-red-950/40 border border-red-800/60 text-red-400 hover:bg-red-950"
              }`}
            >
              FAIL
            </button>
          </div>
        </div>

        {/* ── Section 7: STYLE PICTURES & GENERAL IMAGES ─────────────────────── */}
        <div className="space-y-6">
          {/* Style Pictures */}
          <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              STYLE PICTURES
            </h2>

            <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-teal-900/60 bg-black/40 hover:border-teal-500/50 hover:bg-black transition cursor-pointer space-y-2 group">
              <ImageIcon size={26} className="text-teal-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-gray-300">Click to upload or take photo</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>

          {/* General Images */}
          <div className="rounded-2xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-xl">
            <div className="bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white">
              GENERAL / INSPECTION IMAGES
            </div>

            <div className="p-6">
              <label className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-teal-900/60 bg-black/40 hover:border-teal-500/50 hover:bg-black transition cursor-pointer space-y-2 group">
                <ImageIcon size={26} className="text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-gray-300">Click to upload or take photo</span>
                <span className="text-[10px] text-gray-500">PNG, JPG, WEBP</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-8 py-3 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl"
          >
            <Save size={15} /> Save Pre-Production Meeting
          </button>
        </div>
      </div>
    </SourcingShell>
  );
}

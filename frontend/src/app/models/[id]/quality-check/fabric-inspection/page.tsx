"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Layers,
  Lock,
  Plus,
  Printer,
  Save,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi } from "@/lib/api/models-api";
import { uploadModelFile } from "@/lib/storage";

interface DefectItem {
  id: string;
  defectName: string;
  points: 1 | 2 | 3 | 4;
  yardLocation: string;
}

interface RollItem {
  id: string;
  rollNo: string;
  gsm: number;
  widthInches: number;
  weightKg: number;
  lengthYards: number;
  defects: DefectItem[];
  photos: string[];
  isExpanded?: boolean;
}

interface InspectionPhotoCol {
  id: string;
  label: string;
  imageUrl?: string;
  imageName?: string;
}

interface FabricInspectionReport {
  id: string;
  brand: string;
  model: string;
  vendorName: string;
  factoryAddress: string;
  poNumber: string;
  department: string;
  fabricSpec: string;
  color: string;
  inspectionDate: string;
  inspectorName: string;
  threshold: number;
  totalRequired: string;
  offeredKg: string;
  lotNo: string;
  rolls: RollItem[];
  photoCols: InspectionPhotoCol[];
  overallResult: "PASS" | "FAIL";
  remarks: string;
  createdAt: string;
}

export default function FabricInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);

  // ── Mode: "list" | "create" ────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [reports, setReports] = useState<FabricInspectionReport[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [reportId, setReportId] = useState(`fabric-inspection-${modelId}`);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  React.useEffect(() => {
    ModelsApi.getQcInspections(modelId, "fabric-inspection")
      .then((records) => {
        const saved = records[0] as any;
        if (!saved?.remarks) return;
        setReportId(saved.id || `fabric-inspection-${modelId}`);
        try {
          const data = JSON.parse(saved.remarks) as FabricInspectionReport;
          setReports([data]);
        } catch {}
      })
      .catch(() => {});
  }, [modelId]);

  // ── Form State for New/Edit Inspection Report ──────────────────────────────
  const [brand, setBrand] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [factoryAddress, setFactoryAddress] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [fabricSpec, setFabricSpec] = useState("");
  const [color, setColor] = useState("");
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split("T")[0]);
  const [inspectorName, setInspectorName] = useState("");
  const [threshold, setThreshold] = useState(40);

  const [totalRequired, setTotalRequired] = useState("");
  const [offeredKg, setOfferedKg] = useState("");
  const [lotNo, setLotNo] = useState("");

  // ── Rolls State ────────────────────────────────────────────────────────────
  const [rolls, setRolls] = useState<RollItem[]>([]);

  // ── Inspection Photos State ────────────────────────────────────────────────
  const [photoCols, setPhotoCols] = useState<InspectionPhotoCol[]>([
    { id: "col-1", label: "GSM Checking" },
    { id: "col-2", label: "Shade band" },
    { id: "col-3", label: "GSM All rolls" },
    { id: "col-4", label: "Defects" },
    { id: "col-5", label: "Defects" },
    { id: "col-6", label: "Defects" },
  ]);

  const [overallResult, setOverallResult] = useState<"PASS" | "FAIL">("PASS");
  const [remarks, setRemarks] = useState("");

  // ── Roll Handlers ──────────────────────────────────────────────────────────
  function handleAddRoll() {
    const nextNum = rolls.length + 1;
    const newRoll: RollItem = {
      id: `roll-${Date.now()}`,
      rollNo: `R${String(nextNum).padStart(2, "0")}`,
      gsm: 280,
      widthInches: 58,
      weightKg: 3.5,
      lengthYards: 30,
      defects: [],
      photos: [],
      isExpanded: true,
    };
    setRolls([...rolls, newRoll]);
  }

  function handleDeleteRoll(id: string) {
    if (rolls.length <= 1) return;
    setRolls(rolls.filter((r) => r.id !== id));
  }

  function handleUpdateRoll(id: string, field: keyof RollItem, val: any) {
    setRolls((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: val };
        // Auto-calculate length in yards if weight, gsm, width are present
        if (field === "weightKg" || field === "widthInches" || field === "gsm") {
          const wKg = field === "weightKg" ? parseFloat(val) || 0 : r.weightKg;
          const gsmVal = field === "gsm" ? parseFloat(val) || 280 : r.gsm;
          const widthIn = field === "widthInches" ? parseFloat(val) || 58 : r.widthInches;
          if (wKg > 0 && gsmVal > 0 && widthIn > 0) {
            // Length (yds) = (weight_kg * 1000) / (gsm * (width_inches * 0.0254)) * 1.09361
            const meters = (wKg * 1000) / (gsmVal * (widthIn * 0.0254));
            updated.lengthYards = Math.round(meters * 1.09361 * 10) / 10;
          }
        }
        return updated;
      })
    );
  }

  function handleAddDefect(rollId: string) {
    const newDefect: DefectItem = {
      id: `def-${Date.now()}`,
      defectName: "Slub / Thick Yarn",
      points: 1,
      yardLocation: "12",
    };
    setRolls((prev) =>
      prev.map((r) =>
        r.id === rollId ? { ...r, defects: [...r.defects, newDefect] } : r
      )
    );
  }

  function handleDeleteDefect(rollId: string, defectId: string) {
    setRolls((prev) =>
      prev.map((r) =>
        r.id === rollId
          ? { ...r, defects: r.defects.filter((d) => d.id !== defectId) }
          : r
      )
    );
  }

  function handleUpdateDefect(
    rollId: string,
    defectId: string,
    field: keyof DefectItem,
    val: any
  ) {
    setRolls((prev) =>
      prev.map((r) =>
        r.id === rollId
          ? {
              ...r,
              defects: r.defects.map((d) =>
                d.id === defectId ? { ...d, [field]: val } : d
              ),
            }
          : r
      )
    );
  }

  async function handleRollPhotoUpload(rollId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    let url: string;
    try {
      url = await uploadModelFile(modelId, file, (progress) => {
        setUploadProgress((current) => ({ ...current, [rollId]: progress }));
      });
    } catch (error: any) {
      alert(error?.message || "Failed to upload roll photo.");
      return;
    }
    setRolls((prev) =>
      prev.map((r) =>
        r.id === rollId ? { ...r, photos: [...r.photos, url] } : r
      )
    );
  }

  // ── Photo Columns Handlers ─────────────────────────────────────────────────
  function handleAddPhotoCol() {
    setPhotoCols([
      ...photoCols,
      { id: `col-${Date.now()}`, label: "Defects" },
    ]);
  }

  async function handlePhotoColUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    let url: string;
    try {
      url = await uploadModelFile(modelId, file, (progress) => {
        setUploadProgress((current) => ({ ...current, [id]: progress }));
      });
    } catch (error: any) {
      alert(error?.message || "Failed to upload fabric inspection photo.");
      return;
    }
    setPhotoCols((prev) =>
      prev.map((c) => (c.id === id ? { ...c, imageUrl: url, imageName: file.name } : c))
    );
  }

  // ── 4-Point System Calculations ────────────────────────────────────────────
  const rollSummaries = useMemo(() => {
    return rolls.map((roll) => {
      const totalPoints = roll.defects.reduce((sum, d) => sum + d.points, 0);
      const lengthYds = roll.lengthYards || 1;
      const widthIn = roll.widthInches || 1;
      // Formula: (Total Points * 3600) / (Length in Yards * Width in Inches)
      const pointsPer100SqYd =
        lengthYds > 0 && widthIn > 0
          ? (totalPoints * 3600) / (lengthYds * widthIn)
          : 0;
      const result: "PASS" | "FAIL" = pointsPer100SqYd <= threshold ? "PASS" : "FAIL";

      return {
        rollNo: roll.rollNo,
        gsm: roll.gsm,
        width: roll.widthInches,
        length: roll.lengthYards,
        defectsCount: roll.defects.length,
        totalPoints,
        ptsPer100SqYd: Math.round(pointsPer100SqYd * 10) / 10,
        result,
      };
    });
  }, [rolls, threshold]);

  const totalInspectedKg = useMemo(() => {
    return rolls.reduce((sum, r) => sum + (r.weightKg || 0), 0);
  }, [rolls]);

  async function handleSaveReport() {
    const newReport: FabricInspectionReport = {
      id: `rep-${Date.now()}`,
      brand,
      model: modelId || "5906482949644",
      vendorName,
      factoryAddress,
      poNumber,
      department,
      fabricSpec,
      color,
      inspectionDate,
      inspectorName,
      threshold,
      totalRequired,
      offeredKg,
      lotNo,
      rolls,
      photoCols,
      overallResult,
      remarks,
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      await ModelsApi.saveQcInspection({
        id: reportId,
        modelId,
        inspectionType: "fabric-inspection",
        factoryName: vendorName,
        inspectorName,
        inspectionDate,
        result: overallResult,
        remarks: JSON.stringify(newReport),
        photos: photoCols,
      });
    } catch (error: any) {
      alert(error?.message || "Failed to save fabric inspection.");
      return;
    }
    setReports([newReport, ...reports]);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setViewMode("list");
  }

  async function handleDeleteReport(id: string) {
    if (confirm("Delete this fabric inspection report?")) {
      try {
        await ModelsApi.deleteQcInspection(modelId, id);
        setReports((current) => current.filter((r) => r.id !== id));
      } catch (error: any) {
        alert(error?.message || "Failed to delete fabric inspection report.");
      }
    }
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-28 max-w-6xl mx-auto">
        {/* Save Toast Notification */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ Fabric 4-Point inspection report saved successfully!</span>
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
                  <Layers size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
                    Fabric Inspection
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
                <Plus size={15} /> Create New Fabric Inspection
              </button>
            </div>

            {/* Empty State / Report Cards */}
            {reports.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-[#0d1414] py-20 px-4 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-black/60 border border-gray-800 flex items-center justify-center text-gray-500 shadow-inner">
                  <Layers size={26} className="text-teal-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No fabric inspections yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    Create the first fabric inspection report for this style.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewMode("create")}
                  className="flex items-center gap-2 rounded-full bg-[#00BFA5] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg"
                >
                  <Plus size={15} /> Create New Fabric Inspection
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
                        <span className="rounded bg-teal-500/10 px-2.5 py-0.5 text-xs font-bold text-teal-300 border border-teal-500/20">
                          Lot {rep.lotNo}
                        </span>
                        <h3 className="text-base font-bold text-white">{rep.fabricSpec}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Inspector: {rep.inspectorName} • Rolls: {rep.rolls.length} • Inspected: {rep.offeredKg} kg • Date: {rep.inspectionDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          rep.overallResult === "PASS"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {rep.overallResult}
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
            VIEW 2: CREATE REPORT FORM (Screenshots 2, 3, 4, 5)
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
                <ArrowLeft size={14} /> Back to Fabric Inspections
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight font-serif uppercase">
                  NEW FABRIC INSPECTION REPORT
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  4-Point System — Model <span className="font-mono text-white font-semibold">{modelId || "5906482949644"}</span>
                </p>
              </div>
            </div>

            {/* ── Section 1: 4-POINT SCORING GUIDE ────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-xl space-y-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                4-POINT SCORING GUIDE
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center font-mono">1</span>
                    <span>Up to 3 inches</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-amber-950/60 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-300">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center font-mono">2</span>
                    <span>3 – 6 inches</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-orange-950/60 border border-orange-500/30 px-3.5 py-1.5 text-xs font-bold text-orange-300">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center font-mono">3</span>
                    <span>6 – 9 inches</span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-red-950/60 border border-red-500/30 px-3.5 py-1.5 text-xs font-bold text-red-300">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center font-mono">4</span>
                    <span>&gt; 9 inches / Hole</span>
                  </div>
                </div>

                <span className="text-xs font-bold font-mono text-gray-400 bg-black/60 px-3 py-1.5 rounded-lg border border-gray-800">
                  Acceptance: ≤ 40 pts / 100 sq yd
                </span>
              </div>
            </div>

            {/* ── Section 2: GENERAL INFORMATION ──────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  GENERAL INFORMATION
                </h2>
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <Lock size={11} /> Fields with lock are auto-filled from PO
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mb-1">
                    Brand <Lock size={11} className="text-gray-500" />
                  </label>
                  <input
                    type="text"
                    value={brand}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs font-semibold text-white cursor-default"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mb-1">
                    Model <Lock size={11} className="text-gray-500" />
                  </label>
                  <input
                    type="text"
                    value={modelId || "5906482949644"}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 font-mono text-xs font-semibold text-white cursor-default"
                  />
                </div>

                {/* Vendor Name */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mb-1">
                    Vendor Name (Factory) <Lock size={11} className="text-gray-500" />
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs font-semibold text-white cursor-default"
                  />
                </div>

                {/* Factory Address */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mb-1">
                    Factory Address <Lock size={11} className="text-gray-500" />
                  </label>
                  <input
                    type="text"
                    value={factoryAddress}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs text-gray-300 cursor-default"
                  />
                </div>

                {/* PO Number */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mb-1">
                    PO Number(s) <Lock size={11} className="text-gray-500" />
                  </label>
                  <input
                    type="text"
                    value={poNumber}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 font-mono text-xs font-semibold text-white cursor-default"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mb-1">
                    Department <Lock size={11} className="text-gray-500" />
                  </label>
                  <input
                    type="text"
                    value={department}
                    readOnly
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs text-gray-300 cursor-default"
                  />
                </div>
              </div>

              {/* Fabric Spec Pill */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-gray-400">
                    Fabric (Composition &amp; GSM)
                  </label>
                  <button
                    type="button"
                    className="text-[11px] font-bold text-teal-400 hover:text-teal-300"
                  >
                    + Add New Fabric
                  </button>
                </div>
                <div className="inline-block rounded-xl bg-teal-500/20 border border-teal-400 px-4 py-1.5 text-xs font-mono font-bold text-teal-300">
                  {fabricSpec}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Color */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Color ✏️
                  </label>
                  <input
                    type="text"
                    value={color}
                    placeholder="e.g. Navy Blue"
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>

                {/* Inspection Date */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Inspection Date ✏️
                  </label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>

                {/* Inspector Name */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Inspector Name(s) ✏️
                  </label>
                  <input
                    type="text"
                    value={inspectorName}
                    placeholder="Name"
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>

                {/* Acceptance Threshold */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Acceptance Threshold (pts / 100 sq yd) ✏️
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value) || 40)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-xs font-bold text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            </div>

            {/* ── Section 3: FABRIC QUANTITY TRACKING ─────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                FABRIC QUANTITY TRACKING
              </h2>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 mb-1">
                  Total Fabric Required for Style <Lock size={11} className="text-gray-500" />
                </label>
                <input
                  type="text"
                  value={totalRequired}
                  readOnly
                  className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-xs text-gray-300 cursor-default"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Add fabric quantities in the Fabric Status page to auto-populate this field.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Fabric Offered for Inspection (kg) ✏️
                  </label>
                  <input
                    type="text"
                    value={offeredKg}
                    placeholder="e.g. 350"
                    onChange={(e) => setOfferedKg(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Lot No. ✏️
                  </label>
                  <input
                    type="text"
                    value={lotNo}
                    placeholder="e.g. L1"
                    onChange={(e) => setLotNo(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* 3 Summary Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-xl border border-gray-800 bg-black/60 p-4 text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    TOTAL REQUIRED
                  </span>
                  <span className="text-sm font-bold font-mono text-teal-300 mt-1 block">
                    {totalRequired || "—"}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-black/60 p-4 text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    OFFERED FOR INSPECTION
                  </span>
                  <span className="text-sm font-bold font-mono text-teal-300 mt-1 block">
                    {offeredKg ? `${offeredKg} kgs` : "—"}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-800 bg-black/60 p-4 text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    TOTAL INSPECTED
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                    {totalInspectedKg > 0 ? `${totalInspectedKg.toFixed(1)} kgs` : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Section 4: ROLL-BY-ROLL INSPECTION ──────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  ROLL-BY-ROLL INSPECTION
                </h2>
                <button
                  type="button"
                  onClick={handleAddRoll}
                  className="flex items-center gap-1 rounded-lg bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition"
                >
                  <Plus size={14} /> Add Roll
                </button>
              </div>

              <div className="space-y-4">
                {rolls.map((roll, idx) => (
                  <div
                    key={roll.id}
                    className="rounded-2xl border border-gray-800 bg-black/40 p-5 space-y-4 shadow-inner"
                  >
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-bold text-white">Roll {idx + 1} ({roll.rollNo})</h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteRoll(roll.id)}
                        className="text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Roll Inputs */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                          Roll No.
                        </label>
                        <input
                          type="text"
                          value={roll.rollNo}
                          placeholder="e.g. R01"
                          onChange={(e) => handleUpdateRoll(roll.id, "rollNo", e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-white outline-none focus:border-teal-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                          GSM
                        </label>
                        <input
                          type="number"
                          value={roll.gsm}
                          onChange={(e) => handleUpdateRoll(roll.id, "gsm", parseFloat(e.target.value) || 280)}
                          className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-white outline-none focus:border-teal-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                          Width (inches)
                        </label>
                        <input
                          type="number"
                          value={roll.widthInches}
                          placeholder="58"
                          onChange={(e) => handleUpdateRoll(roll.id, "widthInches", parseFloat(e.target.value) || 58)}
                          className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-white outline-none focus:border-teal-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={roll.weightKg}
                          placeholder="3.5"
                          onChange={(e) => handleUpdateRoll(roll.id, "weightKg", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-white outline-none focus:border-teal-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                          Length (yards)
                        </label>
                        <input
                          type="number"
                          value={roll.lengthYards}
                          onChange={(e) => handleUpdateRoll(roll.id, "lengthYards", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-teal-300 font-bold outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    {/* Defects Sub-section */}
                    <div className="space-y-2 pt-2 border-t border-gray-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          DEFECTS
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddDefect(roll.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300"
                        >
                          <Plus size={13} /> Add Defect
                        </button>
                      </div>

                      {roll.defects.length === 0 ? (
                        <p className="text-xs text-gray-500 italic py-1">
                          No defects recorded — click &quot;+ Add Defect&quot; to start.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {roll.defects.map((def) => (
                            <div
                              key={def.id}
                              className="flex flex-wrap items-center gap-3 rounded-lg bg-[#0d1414] p-2.5 border border-gray-800 text-xs"
                            >
                              <input
                                type="text"
                                value={def.defectName}
                                placeholder="Defect type (e.g. Hole, Slub, Knot)"
                                onChange={(e) =>
                                  handleUpdateDefect(roll.id, def.id, "defectName", e.target.value)
                                }
                                className="flex-1 min-w-[150px] rounded border border-gray-800 bg-black px-2.5 py-1 text-xs text-white outline-none focus:border-teal-400"
                              />

                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-gray-400 font-semibold">Points:</span>
                                <select
                                  value={def.points}
                                  onChange={(e) =>
                                    handleUpdateDefect(roll.id, def.id, "points", parseInt(e.target.value))
                                  }
                                  className="rounded border border-gray-800 bg-black px-2 py-1 font-mono text-xs font-bold text-amber-300 outline-none"
                                >
                                  <option value={1}>1 pt (up to 3&quot;)</option>
                                  <option value={2}>2 pts (3-6&quot;)</option>
                                  <option value={3}>3 pts (6-9&quot;)</option>
                                  <option value={4}>4 pts (&gt;9&quot; / Hole)</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-gray-400 font-semibold">Location:</span>
                                <input
                                  type="text"
                                  value={def.yardLocation}
                                  placeholder="Yds"
                                  onChange={(e) =>
                                    handleUpdateDefect(roll.id, def.id, "yardLocation", e.target.value)
                                  }
                                  className="w-16 rounded border border-gray-800 bg-black px-2 py-1 font-mono text-xs text-white outline-none"
                                />
                                <span className="text-[11px] text-gray-500">yds</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteDefect(roll.id, def.id)}
                                className="p-1 text-gray-500 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Roll Photos */}
                    <div className="pt-2 border-t border-gray-800/80">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                        ROLL PHOTOS
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        {roll.photos.map((photoUrl, pIdx) => (
                          <div key={pIdx} className="w-16 h-16 rounded-lg border border-teal-500/40 bg-black overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photoUrl} alt="Roll photo" className="w-full h-full object-cover" />
                          </div>
                        ))}

                        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition">
                          <Camera size={13} /> Upload Photo
                          {uploadProgress[roll.id] > 0 && uploadProgress[roll.id] < 100 && <span>{uploadProgress[roll.id]}%</span>}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleRollPhotoUpload(roll.id, e)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 5: INSPECTION SUMMARY TABLE ─────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                INSPECTION SUMMARY
              </h2>

              <div className="overflow-x-auto rounded-xl border border-gray-800 bg-black/40">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold uppercase text-gray-400">
                    <tr>
                      <th className="py-3 px-4">Roll No.</th>
                      <th className="py-3 px-3 text-center">GSM</th>
                      <th className="py-3 px-3 text-center">Width (in)</th>
                      <th className="py-3 px-3 text-center">Length (yd)</th>
                      <th className="py-3 px-3 text-center">Defects</th>
                      <th className="py-3 px-3 text-center">Total Pts</th>
                      <th className="py-3 px-3 text-center">Pts/100 sq yd</th>
                      <th className="py-3 px-4 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-mono">
                    {rollSummaries.map((s, idx) => (
                      <tr key={idx} className="hover:bg-gray-800/20 transition">
                        <td className="py-2.5 px-4 font-bold text-white">{s.rollNo}</td>
                        <td className="py-2.5 px-3 text-center">{s.gsm}</td>
                        <td className="py-2.5 px-3 text-center">{s.width}</td>
                        <td className="py-2.5 px-3 text-center">{s.length}</td>
                        <td className="py-2.5 px-3 text-center">{s.defectsCount}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-300">{s.totalPoints}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-teal-300">{s.ptsPer100SqYd}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              s.result === "PASS"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {s.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Section 6: INSPECTION PHOTOS ────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  INSPECTION PHOTOS
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Upload photos for each inspection category. Click + to add more columns.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {photoCols.map((col) => (
                  <div
                    key={col.id}
                    className="rounded-xl border border-gray-800 bg-black/40 p-3 flex flex-col items-center justify-between min-h-[140px]"
                  >
                    <span className="text-[11px] font-semibold text-gray-300 text-center truncate w-full mb-2">
                      {col.label}
                    </span>

                    {col.imageUrl ? (
                      <div className="relative w-full h-20 rounded-lg overflow-hidden border border-teal-500/40 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={col.imageUrl} alt={col.label} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoCols(photoCols.map((c) => (c.id === col.id ? { ...c, imageUrl: undefined } : c)))
                          }
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-red-400 hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-20 rounded-lg border border-dashed border-teal-900/60 bg-black/30 hover:border-teal-500/50 hover:bg-black transition space-y-1 group">
                        <Camera size={18} className="text-teal-400 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-gray-500 group-hover:text-gray-300">{uploadProgress[col.id] > 0 && uploadProgress[col.id] < 100 ? `${uploadProgress[col.id]}%` : "Upload"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoColUpload(col.id, e)}
                        />
                      </label>
                    )}
                  </div>
                ))}

                {/* Add Column Button */}
                <button
                  type="button"
                  onClick={handleAddPhotoCol}
                  className="rounded-xl border-2 border-dashed border-teal-900/60 hover:border-teal-400/60 bg-teal-500/5 hover:bg-teal-500/10 p-3 flex flex-col items-center justify-center min-h-[140px] text-teal-400 transition cursor-pointer"
                >
                  <Plus size={22} />
                  <span className="text-xs font-bold mt-1">Add Column</span>
                </button>
              </div>
            </div>

            {/* ── Section 7: OVERALL INSPECTION RESULT ────────────────────────── */}
            <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                OVERALL INSPECTION RESULT
              </h2>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOverallResult("PASS")}
                  className={`rounded-lg px-6 py-2 text-xs font-black transition ${
                    overallResult === "PASS"
                      ? "bg-emerald-500 text-black ring-2 ring-emerald-400"
                      : "bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-950"
                  }`}
                >
                  PASS
                </button>

                <button
                  type="button"
                  onClick={() => setOverallResult("FAIL")}
                  className={`rounded-lg px-6 py-2 text-xs font-black transition ${
                    overallResult === "FAIL"
                      ? "bg-red-500 text-white ring-2 ring-red-400"
                      : "bg-red-950/40 border border-red-800/60 text-red-400 hover:bg-red-950"
                  }`}
                >
                  FAIL
                </button>

                <span className="text-xs text-gray-500 italic ml-2">
                  Auto-calculated from rolls (can be overridden)
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                  Comments / Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  placeholder="Enter any additional comments or observations..."
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-black px-4 py-2.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════
                FIXED BOTTOM ACTION BAR (as requested by user)
               ══════════════════════════════════════════════════════════════════ */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070b0b]/95 border-t border-teal-900/40 backdrop-blur-md py-3.5 px-6 shadow-2xl">
              <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/80 px-5 py-2.5 text-xs font-semibold text-gray-200 hover:text-white hover:bg-gray-800 transition"
                >
                  <Download size={15} /> Download PDF
                </button>

                <button
                  type="button"
                  onClick={handleSaveReport}
                  className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-8 py-2.5 text-xs font-black text-black hover:bg-[#0cae9d] transition shadow-xl"
                >
                  <Save size={15} /> Create Inspection Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

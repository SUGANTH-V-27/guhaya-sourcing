"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Layers,
  Lock,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";

interface FabricHeaderRow {
  id: string;
  fabricType: string;
  quantityKgs: string;
  noOfLots: string;
  avgConsumption?: string;
}

interface FabricStatusEntry {
  id: string;
  stageName: string;
  fabricType: string;
  lotNumber: string;
  status: "Pending" | "In Process" | "Completed" | "Approved" | "Delayed";
  quantity: string;
  completedDate?: string;
  remarks: string;
}

export default function ModelFabricStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);
  const [currentModel, setCurrentModel] = useState<ModelEntity | null>(null);

  useEffect(() => {
    async function loadModel() {
      if (!modelId) return;
      try {
        const data = await ModelsApi.getById(modelId);
        if (data) setCurrentModel(data);
      } catch {}
    }
    loadModel();
  }, [modelId]);

  // ── Header State ───────────────────────────────────────────────────────────
  const [totalOrderQty, setTotalOrderQty] = useState(0);
  const [numberOfFabrics, setNumberOfFabrics] = useState(0);
  const [fabricRows, setFabricRows] = useState<FabricHeaderRow[]>([]);

  // ── Status Entries State ───────────────────────────────────────────────────
  const [statusEntries, setStatusEntries] = useState<FabricStatusEntry[]>([]);

  // ── Modal State ────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStageName, setModalStageName] = useState("");
  const [modalFabricType, setModalFabricType] = useState("");
  const [modalLotNumber, setModalLotNumber] = useState("");
  const [modalStatus, setModalStatus] = useState<"Pending" | "In Process" | "Completed" | "Approved" | "Delayed">("In Process");
  const [modalQuantity, setModalQuantity] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    ModelsApi.getQcInspections(modelId, "fabric-status")
      .then((records) => {
        const saved = records[0] as any;
        if (!saved?.remarks) return;
        try {
          const data = JSON.parse(saved.remarks);
          if (typeof data.totalOrderQty === "number") setTotalOrderQty(data.totalOrderQty);
          if (typeof data.numberOfFabrics === "number") setNumberOfFabrics(data.numberOfFabrics);
          if (Array.isArray(data.fabricRows)) setFabricRows(data.fabricRows);
          if (Array.isArray(data.statusEntries)) setStatusEntries(data.statusEntries);
        } catch {}
      })
      .catch(() => {});
  }, [modelId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleNumberFabricsChange(count: number) {
    const val = Math.max(1, Math.min(10, count || 1));
    setNumberOfFabrics(val);
    const newRows = [...fabricRows];
    while (newRows.length < val) {
      newRows.push({
        id: `f-${newRows.length + 1}`,
        fabricType: "",
        quantityKgs: "",
        noOfLots: "",
      });
    }
    setFabricRows(newRows.slice(0, val));
  }

  function handleUpdateFabricRow(id: string, field: keyof FabricHeaderRow, value: string) {
    setFabricRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "quantityKgs") {
          const kgs = parseFloat(value.replace(/,/g, "")) || 0;
          if (kgs > 0 && totalOrderQty > 0) {
            updated.avgConsumption = `${(kgs / totalOrderQty).toFixed(2)} kg/pc`;
          }
        }
        return updated;
      })
    );
  }

  function handleCreateStatusEntry() {
    const newEntry: FabricStatusEntry = {
      id: `stat-${Date.now()}`,
      stageName: modalStageName,
      fabricType: modalFabricType,
      lotNumber: modalLotNumber,
      status: modalStatus,
      quantity: modalQuantity,
      completedDate: modalStatus === "Completed" || modalStatus === "Approved" ? new Date().toISOString().split("T")[0] : undefined,
      remarks: modalRemarks,
    };
    setStatusEntries([...statusEntries, newEntry]);
    setIsModalOpen(false);
    setModalRemarks("");
  }

  function handleDeleteStatusEntry(id: string) {
    setStatusEntries(statusEntries.filter((s) => s.id !== id));
  }

  async function handleSaveHeader() {
    try {
      await ModelsApi.saveQcInspection({
        id: `fabric-status-${modelId}`,
        modelId,
        inspectionType: "fabric-status",
        inspectionDate: new Date().toISOString(),
        result: "Pending",
        remarks: JSON.stringify({ totalOrderQty, numberOfFabrics, fabricRows, statusEntries }),
      });
    } catch (error: any) {
      alert(error?.message || "Failed to save fabric status.");
      return;
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  const totalKgs = fabricRows.reduce(
    (sum, r) => sum + (parseFloat(r.quantityKgs.replace(/,/g, "")) || 0),
    0
  );

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-20">
        {/* Top Back Link */}
        <div>
          <Link
            href={`/models/${modelId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-teal-400 transition"
          >
            <ArrowLeft size={14} /> Back to Model
          </Link>
        </div>

        {/* Save Toast */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ Fabric status header and process logs saved successfully!</span>
            <button onClick={() => setIsSaved(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* 2-Column Section: Fabric Status Card (Left) + Model Image (Right) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Fabric Status Card */}
          <div className="flex-1 min-w-0 rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Layers size={20} />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight font-serif">
                FABRIC STATUS
              </h1>
            </div>

            {/* Total Order Qty & Number of Fabrics */}
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                  Total Order Quantity
                </label>
                <div className="h-9 px-4 flex items-center bg-yellow-100/90 border border-yellow-400/80 rounded-lg text-xs font-mono font-bold text-gray-900 min-w-[120px]">
                  {totalOrderQty.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                  Number of Fabrics
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={numberOfFabrics}
                  onChange={(e) => handleNumberFabricsChange(parseInt(e.target.value) || 1)}
                  className="h-9 w-20 rounded-lg border border-gray-800 bg-black px-3 font-mono text-xs font-bold text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Fabric Table */}
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider pb-1">
                <div className="col-span-5">Fabric Type</div>
                <div className="col-span-3">Quantity (kgs)</div>
                <div className="col-span-2">No. of Lots</div>
                <div className="col-span-2">Avg. Fabric Consumption</div>
              </div>

              {fabricRows.map((row) => (
                <div key={row.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={row.fabricType}
                      placeholder="e.g. Single Jersey – Base"
                      onChange={(e) => handleUpdateFabricRow(row.id, "fabricType", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-[#070b0b] px-3 py-2 text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="text"
                      value={row.quantityKgs}
                      placeholder="0"
                      onChange={(e) => handleUpdateFabricRow(row.id, "quantityKgs", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-[#070b0b] px-3 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      value={row.noOfLots}
                      placeholder="1"
                      onChange={(e) => handleUpdateFabricRow(row.id, "noOfLots", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-[#070b0b] px-3 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="col-span-2 font-mono text-xs text-gray-400">
                    {row.avgConsumption || "—"}
                  </div>
                </div>
              ))}

              {/* Summary Row */}
              <div className="grid grid-cols-12 gap-3 items-center py-2 border-t border-gray-800/80 text-xs font-semibold">
                <div className="col-span-5 text-white font-bold">Total Fabric Required</div>
                <div className="col-span-3 font-mono font-bold text-teal-300">
                  {totalKgs > 0 ? `${totalKgs.toLocaleString()} kgs` : "0"}
                </div>
                <div className="col-span-2 font-mono text-gray-400">{fabricRows.length} Lots</div>
                <div className="col-span-2 font-mono text-gray-400">
                  {totalKgs > 0 ? `${(totalKgs / totalOrderQty).toFixed(2)} kg/pc` : "—"}
                </div>
              </div>
            </div>

            {/* Save Header Button */}
            <div>
              <button
                type="button"
                onClick={handleSaveHeader}
                className="rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-teal-400 transition"
              >
                SAVE HEADER
              </button>
            </div>
          </div>

          {/* Model Preview Card (Right Column) */}
          <div className="w-full lg:w-72 shrink-0 rounded-2xl border border-teal-900/40 bg-[#0d1414] p-5 flex flex-col items-center justify-between shadow-xl">
            {/* Model Number */}
            <div className="w-full border-b border-teal-900/40 pb-3 text-center">
              <h2 className="text-lg font-bold font-mono text-white tracking-widest">
                {modelId || "5906482949644"}
              </h2>
            </div>

            {/* Image Container */}
            <div className="my-5 w-full h-56 rounded-2xl bg-white p-3 flex items-center justify-center overflow-hidden shadow-inner">
              {currentModel?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentModel.image}
                  alt={currentModel.name || "Model"}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                  <span className="font-black text-xl tracking-widest bg-gradient-to-r from-teal-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                    CHAOS
                  </span>
                </div>
              )}
            </div>

            {/* Overdue Badge */}
            <div className="w-full flex items-center justify-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-400">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              <span>3 Days overdue!</span>
            </div>
          </div>
        </div>

        {/* ── Center + CREATE NEW STATUS Button ───────────────────────────────── */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-[#00BFA5] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl"
          >
            <Plus size={16} /> CREATE NEW STATUS
          </button>
        </div>

        {/* ── Status Entries List ─────────────────────────────────────────────── */}
        {statusEntries.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Fabric Processing Stages &amp; Batch Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statusEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-teal-300 border border-teal-500/20">
                        {entry.lotNumber}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{entry.stageName}</h3>
                      <p className="text-xs text-teal-400">{entry.fabricType}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          entry.status === "Approved" || entry.status === "Completed"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : entry.status === "Delayed"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {entry.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteStatusEntry(entry.id)}
                        className="text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-3 rounded-xl">
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Quantity</span>
                      <div className="font-mono font-bold text-white">{entry.quantity}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 uppercase text-[10px]">Date</span>
                      <div className="font-mono text-gray-300">{entry.completedDate || "In Progress"}</div>
                    </div>
                  </div>

                  {entry.remarks && (
                    <p className="text-xs text-gray-400 italic pt-1">{entry.remarks}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Modal: Create New Fabric Status ──────────────────────────────────── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#0d1414] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-900/60">
                <h2 className="text-base font-bold text-white">Create Fabric Status Entry</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="text-gray-400 uppercase font-semibold block mb-1">
                    Processing Stage *
                  </label>
                  <input
                    type="text"
                    value={modalStageName}
                    onChange={(e) => setModalStageName(e.target.value)}
                    placeholder="e.g. Dyeing & Finishing, Compacting, In-house QC"
                    className="w-full rounded-lg border border-gray-700 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 uppercase font-semibold block mb-1">
                      Fabric Spec
                    </label>
                    <input
                      type="text"
                      value={modalFabricType}
                      onChange={(e) => setModalFabricType(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 uppercase font-semibold block mb-1">
                      Lot Number
                    </label>
                    <input
                      type="text"
                      value={modalLotNumber}
                      onChange={(e) => setModalLotNumber(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-black px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 uppercase font-semibold block mb-1">
                      Batch Quantity (kgs)
                    </label>
                    <input
                      type="text"
                      value={modalQuantity}
                      onChange={(e) => setModalQuantity(e.target.value)}
                      className="w-full rounded-lg border border-gray-700 bg-black px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 uppercase font-semibold block mb-1">
                      Status
                    </label>
                    <select
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-700 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                    >
                      <option value="In Process">In Process</option>
                      <option value="Completed">Completed</option>
                      <option value="Approved">Approved</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 uppercase font-semibold block mb-1">
                    Process Notes / Test Lab Comments
                  </label>
                  <textarea
                    rows={3}
                    value={modalRemarks}
                    onChange={(e) => setModalRemarks(e.target.value)}
                    placeholder="Enter lab dip approval notes, shrinkage percentages, color fastness ratings..."
                    className="w-full rounded-lg border border-gray-700 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-800 px-6 py-4 bg-gray-900/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateStatusEntry}
                  className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-black hover:bg-teal-400"
                >
                  Create Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

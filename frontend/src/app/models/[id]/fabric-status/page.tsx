"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  Pencil,
  Layers,
  Lock,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";
import { ModelStatusWidget } from "@/components/cards/ModelStatusWidget";

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
  inhouseQuantity?: string;
  processRows?: FabricProcessRow[];
  balanceKgs?: number;
  processCount?: number;
  completedDate?: string;
  statusDate?: string;
  remarks: string;
}

interface FabricProcessRow {
  id: string;
  process: string;
  completedQty: string;
  remarks: string;
}

const createProcessRow = (index = 0): FabricProcessRow => ({
  id: `process-${Date.now()}-${index}`,
  process: "",
  completedQty: "",
  remarks: "",
});

function parseKgs(value?: string) {
  return Number.parseFloat((value || "").replace(/,/g, "")) || 0;
}

function formatStatusDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
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
  const [purchaseOrderQty, setPurchaseOrderQty] = useState<number | null>(null);
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
  const [modalInhouseQuantity, setModalInhouseQuantity] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");
  const [modalDate, setModalDate] = useState("");
  const [modalProcessCount, setModalProcessCount] = useState("1");
  const [processRows, setProcessRows] = useState<FabricProcessRow[]>([createProcessRow()]);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FabricStatusEntry | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) return;
    ModelsApi.getPurchaseOrders(modelId)
      .then((orders) => {
        const quantity = orders.reduce((total, order: any) => total + (Number(order.totalQty) || 0), 0);
        if (quantity > 0) {
          setPurchaseOrderQty(quantity);
          setTotalOrderQty(quantity);
        }
      })
      .catch(() => {});
  }, [modelId]);

  useEffect(() => {
    ModelsApi.getQcInspections(modelId, "fabric-status")
      .then((records) => {
        const saved = records[0] as any;
        if (!saved?.remarks) return;
        try {
          const data = JSON.parse(saved.remarks);
          if (typeof data.totalOrderQty === "number" && purchaseOrderQty === null) setTotalOrderQty(data.totalOrderQty);
          if (typeof data.numberOfFabrics === "number") setNumberOfFabrics(data.numberOfFabrics);
          if (Array.isArray(data.fabricRows)) setFabricRows(data.fabricRows);
          if (Array.isArray(data.statusEntries)) {
            setStatusEntries(data.statusEntries.map((entry: FabricStatusEntry) => ({
              ...entry,
              inhouseQuantity: entry.inhouseQuantity || entry.quantity || "",
              processRows: entry.processRows?.length
                ? entry.processRows
                : [{ id: `process-${entry.id}`, process: entry.stageName || "", completedQty: entry.quantity || "", remarks: entry.remarks || "" }],
              processCount: entry.processCount || entry.processRows?.length || 1,
            })));
          }
        } catch {}
      })
      .catch(() => {});
  }, [modelId, purchaseOrderQty]);

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
          if (kgs > 0 && effectiveOrderQty > 0) {
            updated.avgConsumption = `${(kgs / effectiveOrderQty).toFixed(2)} kg/pc`;
          }
        }
        return updated;
      })
    );
  }

  async function persistFabricStatus(entries: FabricStatusEntry[]) {
    await ModelsApi.saveQcInspection({
      id: `fabric-status-${modelId}`,
      modelId,
      inspectionType: "fabric-status",
      inspectionDate: new Date().toISOString(),
      result: "Pending",
      remarks: JSON.stringify({ totalOrderQty, numberOfFabrics, fabricRows, statusEntries: entries }),
    });
  }

  async function handleCreateStatusEntry() {
    const entry: FabricStatusEntry = {
      id: editingEntryId || `stat-${Date.now()}`,
      stageName: processRows[0]?.process || modalStageName,
      fabricType: modalFabricType,
      lotNumber: modalLotNumber,
      status: modalStatus,
      quantity: modalInhouseQuantity,
      inhouseQuantity: modalInhouseQuantity,
      processRows: processRows.map((row) => ({ ...row })),
      processCount: processRows.length,
      balanceKgs: Math.max(0, totalKgs - parseKgs(modalInhouseQuantity)),
      completedDate: modalStatus === "Completed" || modalStatus === "Approved" ? new Date().toISOString().split("T")[0] : undefined,
      statusDate: modalDate,
      remarks: modalRemarks,
    };
    const nextEntries = editingEntryId
      ? statusEntries.map((item) => item.id === editingEntryId ? entry : item)
      : [...statusEntries, entry];
    setStatusEntries(nextEntries);
    try {
      await persistFabricStatus(nextEntries);
    } catch (error: any) {
      alert(error?.message || "Failed to save status entry.");
      return;
    }
    setIsModalOpen(false);
    setModalInhouseQuantity("");
    setModalRemarks("");
    setModalStageName("");
    setModalDate("");
    setModalProcessCount("1");
    setProcessRows([createProcessRow()]);
    setEditingEntryId(null);
  }

  function handleProcessCountChange(value: number) {
    const count = Math.max(1, Math.min(20, value || 1));
    setModalProcessCount(String(count));
    setProcessRows((current) => {
      const next = current.slice(0, count);
      while (next.length < count) next.push(createProcessRow(next.length));
      return next;
    });
  }

  function updateProcessRow(id: string, field: keyof FabricProcessRow, value: string) {
    setProcessRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  }

  async function handleDeleteStatusEntry(id: string) {
    const nextEntries = statusEntries.filter((s) => s.id !== id);
    setStatusEntries(nextEntries);
    try {
      await persistFabricStatus(nextEntries);
    } catch (error: any) {
      alert(error?.message || "Failed to delete status entry.");
    }
    setSelectedEntry(null);
  }

  function handleEditStatusEntry(entry: FabricStatusEntry) {
    setEditingEntryId(entry.id);
    setModalStageName(entry.stageName || "");
    setModalFabricType(entry.fabricType || "");
    setModalLotNumber(entry.lotNumber || "");
    setModalStatus(entry.status || "In Process");
    setModalInhouseQuantity(entry.inhouseQuantity || entry.quantity || "");
    setModalRemarks(entry.remarks || "");
    setModalDate(entry.statusDate || entry.completedDate || "");
    setProcessRows(entry.processRows?.length ? entry.processRows.map((row) => ({ ...row })) : [createProcessRow()]);
    setModalProcessCount(String(entry.processCount || entry.processRows?.length || 1));
    setSelectedEntry(null);
    setIsModalOpen(true);
  }

  function getCompletedQuantity(entry: FabricStatusEntry) {
    return entry.processRows?.reduce((sum, row) => sum + (parseFloat(row.completedQty.replace(/,/g, "")) || 0), 0)
      ?? (parseFloat(entry.quantity.replace(/,/g, "")) || 0);
  }

  async function handleSaveHeader() {
    try {
      await persistFabricStatus(statusEntries);
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
  const completedKgs = statusEntries.reduce((sum, entry) => sum + getCompletedQuantity(entry), 0);
  const balanceKgs = Math.max(0, totalKgs - completedKgs);
  const modalInhouseKgs = parseKgs(modalInhouseQuantity);
  const modalBalanceKgs = Math.max(0, totalKgs - modalInhouseKgs);
  const effectiveOrderQty = purchaseOrderQty ?? totalOrderQty;

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-20">
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
                <div className="h-9 px-4 flex items-center bg-teal-500/10 border border-teal-500/40 rounded-lg text-xs font-mono font-bold text-teal-200 min-w-[120px]">
                  {effectiveOrderQty.toLocaleString()}
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
                    {(() => {
                      const quantityKgs = parseFloat(row.quantityKgs.replace(/,/g, "")) || 0;
                      return quantityKgs > 0 && effectiveOrderQty > 0
                        ? `${(quantityKgs / effectiveOrderQty).toFixed(2)} kg/pc`
                        : "—";
                    })()}
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
                  {totalKgs > 0 && effectiveOrderQty > 0 ? `${(totalKgs / effectiveOrderQty).toFixed(2)} kg/pc` : "—"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-800 pt-4">
              <div className="text-xs text-gray-400">Balance: <span className="font-mono font-bold text-teal-300">{balanceKgs.toLocaleString()} kgs</span></div>
              <button type="button" onClick={handleSaveHeader} className="rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-teal-400 transition">SAVE</button>
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

            <ModelStatusWidget model={{ id: modelId, daysToHandover: currentModel?.daysToHandover }} />
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

        {/* ── Status History ──────────────────────────────────────────────────── */}
        {statusEntries.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="border-b border-teal-500/60 pb-3 text-xl font-bold text-white font-serif">STATUS HISTORY</h2>
            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#0d1414]">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="border-b border-gray-800 bg-black/30 text-sm font-semibold text-gray-200">
                  <tr><th className="px-5 py-4">Date</th><th className="px-5 py-4 text-center">Fabric In-housed</th><th className="px-5 py-4 text-center">Improvement from Previous</th><th className="px-5 py-4 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {statusEntries.map((entry, index) => {
                    const currentQty = parseKgs(entry.inhouseQuantity || entry.quantity);
                    const previousQty = parseKgs(statusEntries[index - 1]?.inhouseQuantity || statusEntries[index - 1]?.quantity);
                    return (
                      <tr key={entry.id} className="border-b border-gray-800/70 last:border-b-0">
                        <td className="px-5 py-5 font-mono text-gray-200">{formatStatusDate(entry.statusDate || entry.completedDate)}</td>
                        <td className="px-5 py-5 text-center font-mono font-bold text-teal-200">{currentQty.toLocaleString()} kgs</td>
                        <td className="px-5 py-5 text-center"><span className="rounded-md bg-teal-500/15 px-3 py-1.5 font-mono font-bold text-teal-200">{index === 0 ? currentQty : currentQty - previousQty} kgs</span></td>
                        <td className="px-5 py-5 text-right"><button type="button" onClick={() => setSelectedEntry(entry)} className="rounded-md p-2 text-teal-300 hover:bg-teal-500/10" title="View status"><Eye size={17} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedEntry(null)}>
            <div className="w-full max-w-[720px] max-h-[92vh] overflow-y-auto rounded-2xl border border-teal-500/40 bg-[#0d1414] p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between border-b border-gray-800 pb-5">
                <h2 className="text-2xl font-bold text-white font-serif">Status Entry — {formatStatusDate(selectedEntry.statusDate || selectedEntry.completedDate)}</h2>
                <button type="button" onClick={() => setSelectedEntry(null)} className="text-2xl leading-none text-gray-400 hover:text-white" aria-label="Close">×</button>
              </div>
              <div className="space-y-5 text-xs">
                <div className="max-w-[240px]">
                  <label className="font-semibold text-gray-200">Date</label>
                  <div className="mt-1 flex h-11 items-center rounded-lg border border-teal-500/40 bg-black px-3.5 font-mono text-white">{formatStatusDate(selectedEntry.statusDate || selectedEntry.completedDate)}</div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_180px_minmax(0,1fr)]">
                  <div>
                    <label className="font-semibold text-gray-200">Total Yarn In-housed (kgs)</label>
                    <div className="mt-1 flex h-11 items-center rounded-lg border border-teal-500/40 bg-black px-3.5 font-mono font-bold text-white">{parseKgs(selectedEntry.inhouseQuantity || selectedEntry.quantity).toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-200">Balance</label>
                    <div className="mt-1 flex h-11 items-center rounded-lg border border-teal-500/40 bg-teal-500/10 px-3.5 font-mono font-bold text-teal-200">{Number(selectedEntry.balanceKgs ?? 0).toLocaleString()} kgs</div>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-200">Remarks</label>
                    <div className="mt-1 flex min-h-11 items-center rounded-lg border border-teal-500/40 bg-black px-3.5 text-white">{selectedEntry.remarks || "—"}</div>
                  </div>
                </div>
                <div className="max-w-[180px]">
                  <label className="font-semibold text-gray-200">No. of Process in Fabric Making</label>
                  <div className="mt-1 flex h-11 items-center rounded-lg border border-teal-500/40 bg-black px-3.5 font-mono font-bold text-white">{selectedEntry.processCount || selectedEntry.processRows?.length || 1}</div>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-800">
                  <div className="grid grid-cols-4 gap-3 bg-black/30 px-4 py-4 text-sm font-bold text-gray-200"><span>Process</span><span>Qty (kgs)</span><span>Balance (kgs)</span><span>Remarks</span></div>
                  {(selectedEntry.processRows || []).map((row, index, rows) => {
                    const completedThroughRow = rows.slice(0, index + 1).reduce((sum, item) => sum + parseKgs(item.completedQty), 0);
                    return <div key={row.id} className="grid grid-cols-4 gap-3 border-t border-gray-800 px-4 py-3 text-sm"><div className="rounded-lg border border-teal-500/40 bg-black px-3 py-2 text-white">{row.process || `Process ${index + 1}`}</div><div className="rounded-lg border border-teal-500/40 bg-black px-3 py-2 font-mono text-white">{row.completedQty || "0"}</div><div className="rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 py-2 font-mono font-bold text-teal-200">{Math.max(0, totalKgs - completedThroughRow).toLocaleString()}</div><div className="rounded-lg border border-teal-500/40 bg-black px-3 py-2 text-white">{row.remarks || "—"}</div></div>;
                  })}
                </div>
              </div>
              <div className="mt-6 flex gap-3 border-t border-gray-800 pt-5"><button type="button" onClick={() => handleEditStatusEntry(selectedEntry)} className="inline-flex items-center gap-1.5 rounded-full bg-teal-500 px-5 py-2.5 text-xs font-bold text-black"><Pencil size={14} /> UPDATE</button><button type="button" onClick={() => handleDeleteStatusEntry(selectedEntry.id)} className="inline-flex items-center gap-1.5 rounded-full bg-red-500/80 px-5 py-2.5 text-xs font-bold text-white"><Trash2 size={14} /> DELETE</button></div>
            </div>
          </div>
        )}

        {/* ── Inline: Create New Fabric Status ─────────────────────────────────── */}
        {isModalOpen && (
          <div className={editingEntryId
            ? "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            : "w-full rounded-2xl border border-teal-400 bg-[#0d1414] shadow-xl overflow-hidden"}
          >
            <div className={editingEntryId
              ? "w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-teal-500/40 bg-[#0d1414] shadow-2xl"
              : "w-full"}
            >
              <div className="border-b border-gray-800 px-6 py-5">
                <h2 className="text-xl font-bold text-white font-serif">
                  {editingEntryId ? `Status Entry - ${modalDate || "New"}` : "CREATE NEW STATUS"}
                </h2>
              </div>

              <div className="space-y-5 px-6 py-5 text-xs">
                <div className="max-w-[240px]">
                  <label className="text-gray-200 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full rounded-lg border border-teal-500/40 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-300"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_180px_minmax(0,1fr)]">
                  <div>
                    <label className="text-gray-200 font-semibold block mb-1">Total Fabric In-housed (kgs)</label>
                    <input
                      type="text"
                      value={modalInhouseQuantity}
                      onChange={(e) => setModalInhouseQuantity(e.target.value)}
                      className="w-full rounded-lg border border-teal-500/40 bg-black px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-300"
                    />
                  </div>
                  <div>
                    <label className="text-gray-200 font-semibold block mb-1">Balance</label>
                    <div className="flex h-[34px] items-center rounded-lg border border-teal-500/40 bg-teal-500/10 px-3.5 font-mono font-bold text-teal-200">
                      {modalBalanceKgs.toLocaleString()} kgs
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-200 font-semibold block mb-1">Remarks</label>
                    <input
                      type="text"
                      value={modalRemarks}
                      onChange={(e) => setModalRemarks(e.target.value)}
                      className="w-full rounded-lg border border-teal-500/40 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-300"
                    />
                  </div>
                </div>

                <div className="max-w-[180px]">
                  <label className="text-gray-200 font-semibold block mb-1">No. of Process in Fabric Making</label>
                  <input
                    type="number"
                    min={1}
                    value={modalProcessCount}
                    onChange={(e) => handleProcessCountChange(Number(e.target.value))}
                    className="w-full rounded-lg border border-teal-500/40 bg-black px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-300"
                  />
                </div>

                <p className="italic text-teal-300/70">Note: Mention the completed quantity only. Do not mention under processing quantity.</p>

                <div className="overflow-hidden rounded-xl border border-gray-800">
                  <div className="grid grid-cols-1 gap-3 bg-black/40 px-3 py-3 font-bold text-gray-300 md:grid-cols-[minmax(0,1.2fr)_180px_180px_minmax(0,1.2fr)]">
                    <span>Process</span><span>Completed Qty (kgs)</span><span>Balance (kgs)</span><span>Remarks</span>
                  </div>
                  {processRows.map((row, index) => {
                    const completedBefore = processRows.slice(0, index).reduce((sum, item) => sum + parseKgs(item.completedQty), 0);
                    const rowBalance = Math.max(0, totalKgs - completedBefore - parseKgs(row.completedQty));
                    return (
                      <div key={row.id} className="grid grid-cols-1 gap-3 border-t border-gray-800 px-3 py-3 md:grid-cols-[minmax(0,1.2fr)_180px_180px_minmax(0,1.2fr)]">
                        <input type="text" value={row.process} onChange={(e) => updateProcessRow(row.id, "process", e.target.value)} placeholder={`Process ${index + 1}`} className="w-full rounded-lg border border-teal-500/40 bg-black px-3 py-2 text-xs text-white outline-none focus:border-teal-300" />
                        <input type="text" value={row.completedQty} onChange={(e) => updateProcessRow(row.id, "completedQty", e.target.value)} placeholder="0" className="w-full rounded-lg border border-teal-500/40 bg-black px-3 py-2 font-mono text-xs text-white outline-none focus:border-teal-300" />
                        <div className="flex items-center rounded-lg border border-teal-500/40 bg-teal-500/10 px-3 font-mono font-bold text-teal-200">{rowBalance.toLocaleString()}</div>
                        <input type="text" value={row.remarks} onChange={(e) => updateProcessRow(row.id, "remarks", e.target.value)} placeholder="Process remarks" className="w-full rounded-lg border border-teal-500/40 bg-black px-3 py-2 text-xs text-white outline-none focus:border-teal-300" />
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-4 border-t border-gray-800 pt-5">
                  <button type="button" onClick={handleCreateStatusEntry} className="rounded-full bg-teal-500 px-8 py-2.5 text-xs font-bold text-black hover:bg-teal-400">{editingEntryId ? "UPDATE" : "SAVE"}</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-xs font-bold text-gray-300 hover:text-white">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

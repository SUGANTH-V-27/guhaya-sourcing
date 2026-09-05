"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";
import { ModelStatusWidget } from "@/components/cards/ModelStatusWidget";
import { uploadModelFile } from "@/lib/storage";

interface TrimmingBOMRow {
  id: string;
  trimmingId: string;
  description: string;
  quantity: string;
  version: string;
  optionColour: string;
  referenceLayoutName?: string;
  referenceLayoutUrl?: string;
  actualLayoutName?: string;
  actualLayoutUrl?: string;
  referenceLayoutType?: string;
  actualLayoutType?: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
}

const createEmptyTrim = (index = 1): TrimmingBOMRow => ({
  id: `trim-${Date.now()}-${index}`,
  trimmingId: `TR-${String(index).padStart(3, "0")}`,
  description: "",
  quantity: "",
  version: "",
  optionColour: "",
  approvalStatus: "Pending",
});

export default function ModelTrimmingPage({
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

  // ── Trimming BOM State ─────────────────────────────────────────────────────
  const [trims, setTrims] = useState<TrimmingBOMRow[]>([]);

  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!modelId) return;
    ModelsApi.getTrimmingBoms(modelId)
      .then((records: any[]) => {
        const loaded = records.map((record: any, index) => {
          let details: any = {};
          try { details = record.notes ? JSON.parse(record.notes) : {}; } catch {}
          return {
            ...createEmptyTrim(index + 1),
            id: record.id,
            trimmingId: details.trimmingId || `TR-${String(index + 1).padStart(3, "0")}`,
            description: record.itemType || details.description || "",
            quantity: String(record.requiredQty ?? details.quantity ?? ""),
            version: record.specification || details.version || "",
            optionColour: record.color || details.optionColour || "",
            approvalStatus: record.approvalStatus || "Pending",
            referenceLayoutName: details.referenceLayoutName,
            referenceLayoutUrl: details.referenceLayoutUrl,
            referenceLayoutType: details.referenceLayoutType,
            actualLayoutName: details.actualLayoutName,
            actualLayoutUrl: details.actualLayoutUrl,
            actualLayoutType: details.actualLayoutType,
          } as TrimmingBOMRow;
        });
        setTrims(loaded.length ? loaded : [createEmptyTrim()]);
      })
      .catch((error: any) => setSaveError(error?.message || "Failed to load trimming BOM."));
  }, [modelId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleCreateTrim() {
    const nextNum = trims.length + 1;
    const newTrim = createEmptyTrim(nextNum);
    setTrims([...trims, newTrim]);
  }

  async function handleDeleteTrim(id: string) {
    if (!id.startsWith("trim-")) {
      try {
        await ModelsApi.deleteTrimmingBom(modelId, id);
      } catch (error: any) {
        setSaveError(error?.message || "Failed to delete trimming record.");
        return;
      }
    }
    setTrims((current) => {
      const remaining = current.filter((t) => t.id !== id);
      return remaining.length ? remaining : [createEmptyTrim()];
    });
  }

  function handleUpdateTrim(id: string, field: keyof TrimmingBOMRow, value: any) {
    setTrims((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  async function handleFileUpload(
    id: string,
    field: "referenceLayout" | "actualLayout",
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadKey = `${id}-${field}`;
    setUploads((current) => ({ ...current, [uploadKey]: 0 }));
    let url: string | undefined;
    try {
      url = await uploadModelFile(modelId, file, (progress) => {
        setUploads((current) => ({ ...current, [uploadKey]: progress }));
      });
    } catch (error: any) {
      alert(error?.message || "Failed to upload layout proof.");
      return;
    } finally {
      setUploads((current) => {
        const next = { ...current };
        delete next[uploadKey];
        return next;
      });
      e.target.value = "";
    }
    if (field === "referenceLayout") {
      handleUpdateTrim(id, "referenceLayoutName", file.name);
      handleUpdateTrim(id, "referenceLayoutUrl", url);
      handleUpdateTrim(id, "referenceLayoutType", file.type);
    } else {
      handleUpdateTrim(id, "actualLayoutName", file.name);
      handleUpdateTrim(id, "actualLayoutUrl", url);
      handleUpdateTrim(id, "actualLayoutType", file.type);
    }
  }

  async function handleSave() {
    setSaveError(null);
    try {
      await Promise.all(
        trims.map((trim) =>
          ModelsApi.saveTrimmingBom({
            id: trim.id,
            modelId,
            itemType: trim.description || trim.trimmingId,
            specification: trim.version,
            color: trim.optionColour,
            requiredQty: Number(trim.quantity) || 0,
            approvalStatus: trim.approvalStatus,
            proofImageUrl: trim.actualLayoutUrl || trim.referenceLayoutUrl,
            notes: JSON.stringify({
              trimmingId: trim.trimmingId,
              description: trim.description,
              quantity: trim.quantity,
              version: trim.version,
              optionColour: trim.optionColour,
              referenceLayoutName: trim.referenceLayoutName,
              referenceLayoutUrl: trim.referenceLayoutUrl,
              referenceLayoutType: trim.referenceLayoutType,
              actualLayoutName: trim.actualLayoutName,
              actualLayoutUrl: trim.actualLayoutUrl,
              actualLayoutType: trim.actualLayoutType,
            }),
          })
        )
      );
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error: any) {
      setSaveError(error?.message || "Failed to save trimming BOM.");
    }
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-20">

        {/* Save Confirmation Toast */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ Trimming BOM details, layout proofs, and approvals saved!</span>
            <button onClick={() => setIsSaved(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}
        {saveError && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
            {saveError}
          </div>
        )}

        {/* Main 2-Column Section: Trimming BOM Card (Left) + Model Image (Right) */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
          {/* Trimming BOM Card */}
          <div className="min-w-0 rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-xl sm:p-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Box size={20} />
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight font-serif">
                  TRIMMING FILE — BOM
                </h1>
              </div>
              <div className="w-full h-[1.5px] bg-teal-500/30 rounded" />
            </div>

            {/* Trimming BOM Table */}
            <div className="overflow-hidden rounded-xl border border-gray-800/90 bg-black/40 shadow-inner">
              <table className="w-full table-fixed text-left text-[11px] text-gray-300">
                <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold text-gray-400">
                  <tr>
                    <th className="w-[10%] px-2 py-3">Trimming ID</th>
                    <th className="w-[20%] px-2 py-3">Description</th>
                    <th className="w-[8%] px-2 py-3">Quantity</th>
                    <th className="w-[8%] px-2 py-3">Version</th>
                    <th className="w-[12%] px-2 py-3">Option / Colour</th>
                    <th className="w-[15%] px-2 py-3 text-center">Reference Layout</th>
                    <th className="w-[15%] px-2 py-3 text-center">Actual Layout</th>
                    <th className="w-[9%] px-2 py-3 text-center">Approval</th>
                    <th className="w-[3%] px-2 py-3 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-sans">
                  {trims.map((trim) => (
                    <tr key={trim.id} className="hover:bg-gray-800/20 transition">
                      {/* Trimming ID */}
                      <td className="px-2 py-2.5">
                        <input
                          type="text"
                          value={trim.trimmingId}
                          onChange={(e) =>
                            handleUpdateTrim(trim.id, "trimmingId", e.target.value)
                          }
                          className="w-full min-w-0 rounded-lg border border-gray-800 bg-[#0d1414] px-2 py-1.5 font-mono text-[11px] text-white outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Description */}
                      <td className="px-2 py-2.5">
                        <input
                          type="text"
                          value={trim.description}
                          placeholder="e.g. Main Label"
                          onChange={(e) =>
                            handleUpdateTrim(trim.id, "description", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="px-2 py-2.5">
                        <input
                          type="text"
                          value={trim.quantity}
                          placeholder="100"
                          onChange={(e) =>
                            handleUpdateTrim(trim.id, "quantity", e.target.value)
                          }
                          className="w-full min-w-0 rounded-lg border border-gray-800 bg-[#0d1414] px-2 py-1.5 font-mono text-[11px] text-white outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Version */}
                      <td className="px-2 py-2.5">
                        <input
                          type="text"
                          value={trim.version}
                          placeholder="v1"
                          onChange={(e) =>
                            handleUpdateTrim(trim.id, "version", e.target.value)
                          }
                          className="w-full min-w-0 rounded-lg border border-gray-800 bg-[#0d1414] px-2 py-1.5 font-mono text-[11px] text-white outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Option / Colour */}
                      <td className="px-2 py-2.5">
                        <input
                          type="text"
                          value={trim.optionColour}
                          placeholder="e.g. Black"
                          onChange={(e) =>
                            handleUpdateTrim(trim.id, "optionColour", e.target.value)
                          }
                          className="w-full min-w-0 rounded-lg border border-gray-800 bg-[#0d1414] px-2 py-1.5 text-[11px] text-white outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Reference Layout Upload / View */}
                      <td className="px-2 py-2.5 text-center">
                        {trim.referenceLayoutName ? (
                          <div className="flex min-w-0 items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: trim.referenceLayoutUrl || "/placeholder.png",
                                  name: trim.referenceLayoutName || "Reference Layout",
                                })
                              }
                              className="flex min-w-0 items-center gap-1 rounded bg-teal-500/10 px-2 py-1 text-[11px] font-mono text-teal-300 border border-teal-500/30 truncate hover:underline"
                              title={trim.referenceLayoutName}
                            >
                              {trim.referenceLayoutType?.startsWith("image/") && trim.referenceLayoutUrl ? (
                                <img src={trim.referenceLayoutUrl} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
                              ) : <FileText size={14} className="shrink-0" />}
                              {trim.referenceLayoutName}
                            </button>
                            <label className="cursor-pointer text-gray-500 hover:text-teal-400">
                              <Upload size={13} />
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(trim.id, "referenceLayout", e)}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 text-[11px] font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition">
                            <Upload size={12} /> Upload
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(trim.id, "referenceLayout", e)}
                            />
                          </label>
                        )}
                        {uploads[`${trim.id}-referenceLayout`] !== undefined && (
                          <div className="mx-auto mt-1 w-24" aria-live="polite">
                            <div className="flex justify-between text-[9px] text-teal-300"><span>Uploading</span><span>{uploads[`${trim.id}-referenceLayout`]}%</span></div>
                            <div className="h-1 overflow-hidden rounded-full bg-gray-800"><div className="h-full bg-teal-400 transition-all" style={{ width: `${uploads[`${trim.id}-referenceLayout`]}%` }} /></div>
                          </div>
                        )}
                      </td>

                      {/* Actual Layout Upload / View */}
                      <td className="px-2 py-2.5 text-center">
                        {trim.actualLayoutName ? (
                          <div className="flex min-w-0 items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: trim.actualLayoutUrl || "/placeholder.png",
                                  name: trim.actualLayoutName || "Actual Layout",
                                })
                              }
                              className="flex min-w-0 items-center gap-1 rounded bg-teal-500/10 px-2 py-1 text-[11px] font-mono text-teal-300 border border-teal-500/30 truncate hover:underline"
                              title={trim.actualLayoutName}
                            >
                              {trim.actualLayoutType?.startsWith("image/") && trim.actualLayoutUrl ? (
                                <img src={trim.actualLayoutUrl} alt="" className="h-6 w-6 shrink-0 rounded object-cover" />
                              ) : <FileText size={14} className="shrink-0" />}
                              {trim.actualLayoutName}
                            </button>
                            <label className="cursor-pointer text-gray-500 hover:text-teal-400">
                              <Upload size={13} />
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(trim.id, "actualLayout", e)}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 text-[11px] font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition">
                            <Upload size={12} /> Upload
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(trim.id, "actualLayout", e)}
                            />
                          </label>
                        )}
                        {uploads[`${trim.id}-actualLayout`] !== undefined && (
                          <div className="mx-auto mt-1 w-24" aria-live="polite">
                            <div className="flex justify-between text-[9px] text-teal-300"><span>Uploading</span><span>{uploads[`${trim.id}-actualLayout`]}%</span></div>
                            <div className="h-1 overflow-hidden rounded-full bg-gray-800"><div className="h-full bg-teal-400 transition-all" style={{ width: `${uploads[`${trim.id}-actualLayout`]}%` }} /></div>
                          </div>
                        )}
                      </td>

                      {/* Approval Status Select */}
                      <td className="px-2 py-2.5 text-center">
                        <div className="relative inline-block">
                          <select
                            value={trim.approvalStatus}
                            onChange={(e) =>
                              handleUpdateTrim(
                                trim.id,
                                "approvalStatus",
                                e.target.value as "Pending" | "Approved" | "Rejected"
                              )
                            }
                            className={`appearance-none rounded-lg px-3 py-1 text-[11px] font-bold outline-none cursor-pointer pr-6 ${
                              trim.approvalStatus === "Approved"
                                ? "bg-emerald-950/70 border border-emerald-800 text-emerald-300"
                                : trim.approvalStatus === "Rejected"
                                ? "bg-red-950/70 border border-red-800 text-red-300"
                                : "bg-amber-950/70 border border-amber-800 text-amber-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </td>

                      {/* Delete Action */}
                      <td className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteTrim(trim.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                          title="Delete Trim Row"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Create Trim Button */}
            <div>
              <button
                type="button"
                onClick={handleCreateTrim}
                className="rounded-lg border border-teal-500/40 bg-teal-500/10 px-4 py-2 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition"
              >
                CREATE TRIM
              </button>
            </div>
          </div>

          {/* Model Preview Card (Right Column) */}
          <div className="w-full rounded-2xl border border-teal-900/40 bg-[#0d1414] p-5 shadow-xl lg:sticky lg:top-6">
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

        {/* Modal: Image / Layout Preview Lightbox */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-2xl max-h-[85vh] rounded-2xl border border-gray-800 bg-[#0d1414] p-4 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-3">
                <span className="text-xs font-bold text-white truncate max-w-md">
                  {previewImage.name}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center justify-center max-h-[65vh] overflow-hidden bg-black/60 rounded-xl p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

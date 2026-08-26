"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowLeft,
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
  approvalStatus: "Pending" | "Approved" | "Rejected";
}

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
  const [trims, setTrims] = useState<TrimmingBOMRow[]>([
    {
      id: "trim-1",
      trimmingId: "TR-001",
      description: "Main Label",
      quantity: "5,760",
      version: "v1",
      optionColour: "Black",
      referenceLayoutName: "Main_Label_Artwork_V1.pdf",
      approvalStatus: "Pending",
    },
    {
      id: "trim-2",
      trimmingId: "TR-002",
      description: "Care Label",
      quantity: "5,760",
      version: "v1",
      optionColour: "White / Black Print",
      approvalStatus: "Approved",
    },
    {
      id: "trim-3",
      trimmingId: "TR-003",
      description: "Hang Tag with Cotton Cord",
      quantity: "5,760",
      version: "v2",
      optionColour: "Kraft Brown",
      approvalStatus: "Pending",
    },
  ]);

  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleCreateTrim() {
    const nextNum = trims.length + 1;
    const newTrim: TrimmingBOMRow = {
      id: `trim-${Date.now()}`,
      trimmingId: `TR-${String(nextNum).padStart(3, "0")}`,
      description: "",
      quantity: "100",
      version: "v1",
      optionColour: "Black",
      approvalStatus: "Pending",
    };
    setTrims([...trims, newTrim]);
  }

  function handleDeleteTrim(id: string) {
    if (trims.length <= 1) return;
    setTrims(trims.filter((t) => t.id !== id));
  }

  function handleUpdateTrim(id: string, field: keyof TrimmingBOMRow, value: any) {
    setTrims((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  function handleFileUpload(
    id: string,
    field: "referenceLayout" | "actualLayout",
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (field === "referenceLayout") {
      handleUpdateTrim(id, "referenceLayoutName", file.name);
      handleUpdateTrim(id, "referenceLayoutUrl", url);
    } else {
      handleUpdateTrim(id, "actualLayoutName", file.name);
      handleUpdateTrim(id, "actualLayoutUrl", url);
    }
  }

  function handleSave() {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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

        {/* Main 2-Column Section: Trimming BOM Card (Left) + Model Image (Right) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Trimming BOM Card */}
          <div className="flex-1 min-w-0 rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
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
            <div className="overflow-x-auto rounded-xl border border-gray-800/90 bg-black/40 shadow-inner">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold text-gray-400">
                  <tr>
                    <th className="py-3 px-3 min-w-[100px]">Trimming ID</th>
                    <th className="py-3 px-3 min-w-[150px]">Description</th>
                    <th className="py-3 px-3 min-w-[90px]">Quantity</th>
                    <th className="py-3 px-3 min-w-[80px]">Version</th>
                    <th className="py-3 px-3 min-w-[120px]">Option / Colour</th>
                    <th className="py-3 px-3 min-w-[120px] text-center">Reference Layout</th>
                    <th className="py-3 px-3 min-w-[120px] text-center">Actual Layout</th>
                    <th className="py-3 px-3 min-w-[110px] text-center">Approval Status</th>
                    <th className="py-3 px-2 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 font-sans">
                  {trims.map((trim) => (
                    <tr key={trim.id} className="hover:bg-gray-800/20 transition">
                      {/* Trimming ID */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={trim.trimmingId}
                          onChange={(e) =>
                            handleUpdateTrim(trim.id, "trimmingId", e.target.value)
                          }
                          className="w-24 rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Description */}
                      <td className="py-2.5 px-3">
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
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={trim.quantity}
                          placeholder="100"
                          onChange={(e) =>
                            handleUpdateTrim(trim.id, "quantity", e.target.value)
                          }
                          className="w-20 rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Version */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={trim.version}
                          placeholder="v1"
                          onChange={(e) =>
                            handleUpdateTrim(trim.id, "version", e.target.value)
                          }
                          className="w-16 rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Option / Colour */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={trim.optionColour}
                          placeholder="e.g. Black"
                          onChange={(e) =>
                            handleUpdateTrim(trim.id, "optionColour", e.target.value)
                          }
                          className="w-28 rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Reference Layout Upload / View */}
                      <td className="py-2.5 px-3 text-center">
                        {trim.referenceLayoutName ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: trim.referenceLayoutUrl || "/placeholder.png",
                                  name: trim.referenceLayoutName || "Reference Layout",
                                })
                              }
                              className="rounded bg-teal-500/10 px-2 py-1 text-[11px] font-mono text-teal-300 border border-teal-500/30 truncate max-w-[100px] hover:underline"
                              title={trim.referenceLayoutName}
                            >
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
                      </td>

                      {/* Actual Layout Upload / View */}
                      <td className="py-2.5 px-3 text-center">
                        {trim.actualLayoutName ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: trim.actualLayoutUrl || "/placeholder.png",
                                  name: trim.actualLayoutName || "Actual Layout",
                                })
                              }
                              className="rounded bg-teal-500/10 px-2 py-1 text-[11px] font-mono text-teal-300 border border-teal-500/30 truncate max-w-[100px] hover:underline"
                              title={trim.actualLayoutName}
                            >
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
                      </td>

                      {/* Approval Status Select */}
                      <td className="py-2.5 px-3 text-center">
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
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteTrim(trim.id)}
                          className="p-1 text-gray-600 hover:text-red-400 transition"
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

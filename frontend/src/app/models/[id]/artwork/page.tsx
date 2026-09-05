"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  FileText,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";
import { uploadModelFile } from "@/lib/storage";
import { ModelStatusWidget } from "@/components/cards/ModelStatusWidget";

interface ArtworkRow {
  id: string;
  description: string;
  receivedDate: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  fileType?: string;
}

const createEmptyArtworkRow = (): ArtworkRow => ({
  id: `art-${Date.now()}`,
  description: "",
  receivedDate: "",
});

function AiIcon() {
  return (
    <div className="w-8 h-8 rounded-lg bg-[#300] border border-[#FF9A00]/40 flex items-center justify-center shrink-0 shadow-inner">
      <span className="font-serif font-black text-sm text-[#FF9A00]">Ai</span>
    </div>
  );
}

export default function ModelArtworkPage({
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

  const [rows, setRows] = useState<ArtworkRow[]>([createEmptyArtworkRow()]);

  const [isSaved, setIsSaved] = useState(false);
  const [uploads, setUploads] = useState<Record<string, number>>({});

  useEffect(() => {
    ModelsApi.getQcInspections(modelId, "artwork")
      .then((records) => {
        const saved = records[0] as any;
        if (!saved?.remarks) {
          setRows([createEmptyArtworkRow()]);
          return;
        }
        try {
          const data = JSON.parse(saved.remarks);
          if (Array.isArray(data.rows)) setRows(data.rows.length ? data.rows : [createEmptyArtworkRow()]);
        } catch {}
      })
      .catch(() => {});
  }, [modelId]);

  function handleAddRow() {
    const newRow: ArtworkRow = createEmptyArtworkRow();
    setRows([...rows, newRow]);
  }

  function handleDeleteRow(id: string) {
    setRows((current) => {
      const remaining = current.filter((r) => r.id !== id);
      return remaining.length ? remaining : [createEmptyArtworkRow()];
    });
  }

  function handleUpdateRow(id: string, field: keyof ArtworkRow, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  async function handleFileUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    let fileUrl: string | undefined;
    setUploads((current) => ({ ...current, [id]: 0 }));
    try {
      fileUrl = (await uploadModelFile(modelId, file, (progress) => {
        setUploads((current) => ({ ...current, [id]: progress }));
      })) || undefined;
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                fileName: file.name,
                fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                fileUrl,
                fileType: file.type,
              }
            : r
        )
      );
    } catch (error: any) {
      alert(error?.message || "Failed to upload artwork file.");
    } finally {
      setUploads((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      e.target.value = "";
    }
  }

  async function handleSave() {
    try {
      await ModelsApi.saveQcInspection({
        id: `artwork-${modelId}`,
        modelId,
        inspectionType: "artwork",
        inspectionDate: new Date().toISOString(),
        result: "Pending",
        remarks: JSON.stringify({ rows }),
      });
    } catch (error: any) {
      alert(error?.message || "Failed to save artwork records.");
      return;
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-16">
        {/* Save Confirmation Toast */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ Artwork vector files and descriptions saved successfully!</span>
            <button onClick={() => setIsSaved(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Main 2-Column Section: Artwork Card (Left) + Model Image (Right) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Artwork Card */}
          <div className="flex-1 min-w-0 rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AiIcon />
                <h1 className="text-xl font-bold text-white tracking-tight font-serif">
                  ARTWORK
                </h1>
              </div>
              <div className="w-full h-[1.5px] bg-teal-500/30 rounded" />
            </div>

            {/* Artwork Rows */}
            <div className="space-y-3">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-end gap-3 rounded-xl bg-black/40 p-3.5 border border-gray-800/80"
                >
                  {/* Description Input */}
                  <div className="flex-1 min-w-[220px]">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={row.description}
                      placeholder="e.g. Front Chest Print - Vector Graphic"
                      onChange={(e) => handleUpdateRow(row.id, "description", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Received Date Picker */}
                  <div className="w-44">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Received Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={row.receivedDate}
                        onChange={(e) => handleUpdateRow(row.id, "receivedDate", e.target.value)}
                        className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  {/* Upload Action */}
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-3.5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-md">
                      ADD <Upload size={13} />
                      <input
                        type="file"
                        accept=".ai,.pdf,.eps,.svg,.psd,.png,.jpg"
                        className="hidden"
                        onChange={(e) => handleFileUpload(row.id, e)}
                      />
                    </label>
                    {uploads[row.id] !== undefined && (
                      <div className="mt-1 w-28" aria-live="polite">
                        <div className="mb-1 flex justify-between text-[10px] text-teal-300">
                          <span>Uploading</span><span>{uploads[row.id]}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                          <div className="h-full bg-teal-400 transition-all" style={{ width: `${uploads[row.id]}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delete Action */}
                  <div className="pb-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition"
                      title="Delete Artwork Row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Uploaded File Info Chip */}
                  {row.fileName && (
                    <a href={row.fileUrl} target="_blank" rel="noreferrer" className="w-full pt-1 text-[11px] text-teal-400 flex items-center gap-1.5 font-mono hover:text-white">
                      {row.fileType?.startsWith("image/") && row.fileUrl ? (
                        <img src={row.fileUrl} alt={row.fileName} className="h-8 w-8 rounded object-cover" />
                      ) : <FileText size={16} />}
                      <span className="truncate">{row.fileName}</span>
                      {row.fileSize && <span className="text-gray-500">({row.fileSize})</span>}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Add Artwork Button */}
            <div>
              <button
                type="button"
                onClick={handleAddRow}
                className="rounded-lg border border-teal-500/40 bg-teal-500/10 px-4 py-2 text-xs font-bold text-teal-300 hover:bg-teal-500 hover:text-black transition"
              >
                ADD ARTWORK
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
      </div>
    </SourcingShell>
  );
}

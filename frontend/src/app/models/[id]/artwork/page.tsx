"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ChevronRight,
  FileText,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { models } from "@/lib/mock-data";

interface ArtworkRow {
  id: string;
  description: string;
  receivedDate: string;
  fileName?: string;
  fileSize?: string;
}

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
  const currentModel = models.find((m) => m.id === modelId || m.code === modelId);

  const [rows, setRows] = useState<ArtworkRow[]>([
    {
      id: "art-1",
      description: "Front Chest Graphic - CHAOS Gradient Print",
      receivedDate: "2026-08-20",
      fileName: "CHAOS_Tote_Vector_V2.ai",
      fileSize: "14.2 MB",
    },
    {
      id: "art-2",
      description: "Care Label & Hangtag Artwork Vector",
      receivedDate: "2026-08-21",
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  function handleAddRow() {
    const newRow: ArtworkRow = {
      id: `art-${Date.now()}`,
      description: "",
      receivedDate: "",
    };
    setRows([...rows, newRow]);
  }

  function handleDeleteRow(id: string) {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  }

  function handleUpdateRow(id: string, field: keyof ArtworkRow, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function handleFileUpload(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              fileName: file.name,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            }
          : r
      )
    );
  }

  function handleSave() {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-16">
        {/* Top Back Link */}
        <div>
          <Link
            href={`/models/${modelId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-teal-400 transition"
          >
            <ArrowLeft size={14} /> Back to Model
          </Link>
        </div>

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
                    <div className="w-full pt-1 text-[11px] text-teal-400 flex items-center gap-1.5 font-mono">
                      <FileText size={12} />
                      <span>{row.fileName}</span>
                      {row.fileSize && <span className="text-gray-500">({row.fileSize})</span>}
                    </div>
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
      </div>
    </SourcingShell>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  FileText,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";
import { uploadModelFile } from "@/lib/storage";
import { ModelStatusWidget } from "@/components/cards/ModelStatusWidget";

interface TechPackRow {
  id: string;
  originalTechPack: string;
  receivedDate: string;
  remarks: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
}

interface ModelCommentRow {
  id: string;
  sample: string;
  submission: string;
  sentDate: string;
  commentsDate: string;
  commentsFileName?: string;
  commentsFileUrl?: string;
  commentsFileType?: string;
  designerStatus: "PENDING" | "APPROVED" | "REJECTED" | "AMENDED";
  graphicStatus: "PENDING" | "APPROVED" | "REJECTED" | "AMENDED";
  technologistStatus: "PENDING" | "APPROVED" | "REJECTED" | "AMENDED";
  remarks: string;
}

type OverallStatus =
  | "PENDING"
  | "APPROVED"
  | "CONDITIONAL APPROVED"
  | "REJECTED"
  | "ALREADY ACCEPTED";

export default function ModelDocumentationPage({
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

  // ── Tech Pack Rows ─────────────────────────────────────────────────────────
  const [techPacks, setTechPacks] = useState<TechPackRow[]>([{
    id: "tp-initial",
    originalTechPack: "1st Tech Pack",
    receivedDate: "",
    remarks: "",
  }]);

  // ── Model Comments Rows ────────────────────────────────────────────────────
  const [comments, setComments] = useState<ModelCommentRow[]>([{
    id: "com-initial",
    sample: "",
    submission: "",
    sentDate: "",
    commentsDate: "",
    designerStatus: "PENDING",
    graphicStatus: "PENDING",
    technologistStatus: "PENDING",
    remarks: "",
  }]);

  // ── Overall Approval Status ────────────────────────────────────────────────
  const [overallStatus, setOverallStatus] = useState<OverallStatus>("PENDING");
  const [isSaved, setIsSaved] = useState(false);
  const [techPackUploads, setTechPackUploads] = useState<Record<string, number>>({});
  const [commentUploads, setCommentUploads] = useState<Record<string, number>>({});

  const createEmptyTechPack = (): TechPackRow => ({
    id: `tp-${Date.now()}`,
    originalTechPack: "",
    receivedDate: "",
    remarks: "",
  });

  const createEmptyComment = (): ModelCommentRow => ({
    id: `com-${Date.now()}`,
    sample: "",
    submission: "",
    sentDate: "",
    commentsDate: "",
    designerStatus: "PENDING",
    graphicStatus: "PENDING",
    technologistStatus: "PENDING",
    remarks: "",
  });

  useEffect(() => {
    ModelsApi.getQcInspections(modelId, "documentation")
      .then((records) => {
        const saved = records[0] as any;
        if (!saved?.remarks) {
          setTechPacks([createEmptyTechPack()]);
          setComments([createEmptyComment()]);
          return;
        }
        try {
          const data = JSON.parse(saved.remarks);
          if (Array.isArray(data.techPacks)) setTechPacks(data.techPacks.length ? data.techPacks : [createEmptyTechPack()]);
          if (Array.isArray(data.comments)) setComments(data.comments.length ? data.comments : [createEmptyComment()]);
          if (data.overallStatus || saved.result) setOverallStatus(data.overallStatus || saved.result);
        } catch {}
      })
      .catch(() => {});
  }, [modelId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleAddTechPack() {
    const newTp: TechPackRow = {
      id: `tp-${Date.now()}`,
      originalTechPack: `${techPacks.length + 1}th Tech Pack`,
      receivedDate: "",
      remarks: "",
    };
    setTechPacks([...techPacks, newTp]);
  }

  function handleDeleteTechPack(id: string) {
    setTechPacks((current) => {
      const remaining = current.filter((tp) => tp.id !== id);
      return remaining.length ? remaining : [createEmptyTechPack()];
    });
  }

  function handleUpdateTechPack(id: string, field: keyof TechPackRow, value: string) {
    setTechPacks((prev) =>
      prev.map((tp) => (tp.id === id ? { ...tp, [field]: value } : tp))
    );
  }

  async function handleTechPackFileUpload(id: string, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setTechPackUploads((current) => ({ ...current, [id]: 0 }));
    try {
      const fileUrl = await uploadModelFile(modelId, file, (progress) => {
        setTechPackUploads((current) => ({ ...current, [id]: progress }));
      });
      setTechPacks((prev) => prev.map((pack) => pack.id === id
        ? { ...pack, fileName: file.name, fileUrl: fileUrl || undefined, fileType: file.type }
        : pack));
    } catch (error: any) {
      alert(error?.message || "Failed to upload tech pack.");
    } finally {
      setTechPackUploads((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      event.target.value = "";
    }
  }

  function handleAddComment() {
    const newCom: ModelCommentRow = {
      id: `com-${Date.now()}`,
      sample: "",
      submission: "",
      sentDate: "",
      commentsDate: "",
      designerStatus: "PENDING",
      graphicStatus: "PENDING",
      technologistStatus: "PENDING",
      remarks: "",
    };
    setComments([...comments, newCom]);
  }

  function handleDeleteComment(id: string) {
    setComments((current) => {
      const remaining = current.filter((comment) => comment.id !== id);
      return remaining.length ? remaining : [createEmptyComment()];
    });
  }

  function handleUpdateComment(id: string, field: keyof ModelCommentRow, value: any) {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }

  async function handleCommentsFileUpload(id: string, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCommentUploads((current) => ({ ...current, [id]: 0 }));
    try {
      const fileUrl = await uploadModelFile(modelId, file, (progress) => {
        setCommentUploads((current) => ({ ...current, [id]: progress }));
      });
      setComments((prev) => prev.map((comment) => comment.id === id
        ? { ...comment, commentsFileName: file.name, commentsFileUrl: fileUrl || undefined, commentsFileType: file.type }
        : comment));
    } catch (error: any) {
      alert(error?.message || "Failed to upload comments file.");
    } finally {
      setCommentUploads((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      event.target.value = "";
    }
  }

  async function handleSave() {
    try {
      await ModelsApi.saveQcInspection({
        id: `documentation-${modelId}`,
        modelId,
        inspectionType: "documentation",
        inspectionDate: new Date().toISOString(),
        result: overallStatus,
        remarks: JSON.stringify({ techPacks, comments, overallStatus }),
      });
    } catch (error: any) {
      alert(error?.message || "Failed to save documentation.");
      return;
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  }

  return (
    <SourcingShell>
      <div className="space-y-8 text-gray-200 pb-20">
        {/* Save Confirmation Toast */}
        {isSaved && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ Sample submission &amp; approval documentation saved!</span>
            <button onClick={() => setIsSaved(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Top Section: Tech Pack Card (Left) + Model Preview Card (Right) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Tech Pack Card */}
          <div className="flex-1 min-w-0 rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <FileText size={20} />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight font-serif">
                SAMPLE SUBMISSION &amp; APPROVAL
              </h1>
            </div>

            {/* Tech Pack Rows */}
            <div className="space-y-3">
              {techPacks.map((tp) => (
                <div
                  key={tp.id}
                  className="flex flex-wrap items-end gap-3 rounded-xl bg-black/40 p-3.5 border border-gray-800/80"
                >
                  <div className="w-40">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Original Tech Pack
                    </label>
                    <input
                      type="text"
                      value={tp.originalTechPack}
                      placeholder="1st Tech Pack"
                      onChange={(e) => handleUpdateTechPack(tp.id, "originalTechPack", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="w-40">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Received Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={tp.receivedDate}
                        onChange={(e) => handleUpdateTechPack(tp.id, "receivedDate", e.target.value)}
                        className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Remarks
                    </label>
                    <input
                      type="text"
                      value={tp.remarks}
                      placeholder="Tech pack notes, revision comments..."
                      onChange={(e) => handleUpdateTechPack(tp.id, "remarks", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Upload Tech Pack File */}
                  <label className="cursor-pointer rounded-lg bg-teal-500 p-2 text-black hover:bg-teal-400 transition" title="Upload Tech Pack File">
                    <Upload size={15} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        void handleTechPackFileUpload(tp.id, e);
                      }}
                    />
                  </label>
                  {techPackUploads[tp.id] !== undefined && (
                    <div className="w-28" aria-live="polite">
                      <div className="mb-1 flex justify-between text-[10px] text-teal-300">
                        <span>Uploading</span><span>{techPackUploads[tp.id]}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                        <div className="h-full bg-teal-400 transition-all" style={{ width: `${techPackUploads[tp.id]}%` }} />
                      </div>
                    </div>
                  )}
                  {tp.fileUrl && (
                    <a href={tp.fileUrl} target="_blank" rel="noreferrer" className="flex max-w-32 items-center gap-1.5 text-[10px] text-teal-300 hover:text-white" title={tp.fileName}>
                      {tp.fileType?.startsWith("image/") ? (
                        <img src={tp.fileUrl} alt={tp.fileName || "Tech pack"} className="h-8 w-8 rounded object-cover" />
                      ) : <FileText size={18} />}
                      <span className="truncate">{tp.fileName}</span>
                    </a>
                  )}

                  {/* Delete Row */}
                  <button
                    type="button"
                    onClick={() => handleDeleteTechPack(tp.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <button
                type="button"
                onClick={handleAddTechPack}
                className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-black hover:bg-teal-400 transition"
              >
                ADD TECH PACK
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

        {/* ── Section: MODEL COMMENTS ────────────────────────────────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <h2 className="text-xl font-bold text-white tracking-tight font-serif">
            MODEL COMMENTS
          </h2>

          <div className="space-y-4">
            {comments.map((com) => (
              <div
                key={com.id}
                className="rounded-2xl border border-gray-800 bg-[#0d1414] p-5 shadow-lg space-y-3"
              >
                {/* Row 1: Sample, Submission, Dates, Roles */}
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-36">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Sample
                    </label>
                    <input
                      type="text"
                      value={com.sample}
                      placeholder="e.g. Fit Sample"
                      onChange={(e) => handleUpdateComment(com.id, "sample", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="w-36">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Submission
                    </label>
                    <input
                      type="text"
                      value={com.submission}
                      placeholder="e.g. 1st Submission"
                      onChange={(e) => handleUpdateComment(com.id, "submission", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="w-36">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Sent Date
                    </label>
                    <input
                      type="date"
                      value={com.sentDate}
                      onChange={(e) => handleUpdateComment(com.id, "sentDate", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-black px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="w-36">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Comments Date
                    </label>
                    <input
                      type="date"
                      value={com.commentsDate}
                      onChange={(e) => handleUpdateComment(com.id, "commentsDate", e.target.value)}
                      className="w-full rounded-lg border border-gray-800 bg-black px-2.5 py-1.5 font-mono text-xs text-white outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Comments File Upload */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                      Comments File
                    </label>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-teal-400 transition">
                      ADD <Upload size={13} />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          void handleCommentsFileUpload(com.id, e);
                        }}
                      />
                    </label>
                    {commentUploads[com.id] !== undefined && (
                      <div className="mt-1 w-28" aria-live="polite">
                        <div className="mb-1 flex justify-between text-[10px] text-teal-300">
                          <span>Uploading</span><span>{commentUploads[com.id]}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                          <div className="h-full bg-teal-400 transition-all" style={{ width: `${commentUploads[com.id]}%` }} />
                        </div>
                      </div>
                    )}
                    {com.commentsFileUrl && (
                      <a href={com.commentsFileUrl} target="_blank" rel="noreferrer" className="mt-1 flex max-w-32 items-center gap-1.5 text-[10px] text-teal-300 hover:text-white" title={com.commentsFileName}>
                        {com.commentsFileType?.startsWith("image/") ? (
                          <img src={com.commentsFileUrl} alt={com.commentsFileName || "Comments file"} className="h-8 w-8 rounded object-cover" />
                        ) : <FileText size={18} />}
                        <span className="truncate">{com.commentsFileName}</span>
                      </a>
                    )}
                  </div>

                  {/* Role Status Dropdown: DESIGNER */}
                  <div className="w-36">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">
                      Designer
                    </label>
                    <div className="relative">
                      <select
                        value={com.designerStatus}
                        onChange={(e) => handleUpdateComment(com.id, "designerStatus", e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-800 bg-black pl-6 pr-6 py-1.5 text-xs font-semibold text-white outline-none focus:border-teal-400"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="AMENDED">AMENDED</option>
                      </select>
                      <span
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                          com.designerStatus === "APPROVED"
                            ? "bg-emerald-400"
                            : com.designerStatus === "REJECTED"
                            ? "bg-rose-400"
                            : "bg-amber-400"
                        }`}
                      />
                      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Role Status Dropdown: GRAPHIC */}
                  <div className="w-36">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">
                      Graphic
                    </label>
                    <div className="relative">
                      <select
                        value={com.graphicStatus}
                        onChange={(e) => handleUpdateComment(com.id, "graphicStatus", e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-800 bg-black pl-6 pr-6 py-1.5 text-xs font-semibold text-white outline-none focus:border-teal-400"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="AMENDED">AMENDED</option>
                      </select>
                      <span
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                          com.graphicStatus === "APPROVED"
                            ? "bg-emerald-400"
                            : com.graphicStatus === "REJECTED"
                            ? "bg-rose-400"
                            : "bg-amber-400"
                        }`}
                      />
                      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Role Status Dropdown: TECHNOLOGIST */}
                  <div className="w-36">
                    <label className="text-[11px] font-semibold text-gray-400 block mb-1 uppercase">
                      Technologist
                    </label>
                    <div className="relative">
                      <select
                        value={com.technologistStatus}
                        onChange={(e) => handleUpdateComment(com.id, "technologistStatus", e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-800 bg-black pl-6 pr-6 py-1.5 text-xs font-semibold text-white outline-none focus:border-teal-400"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="AMENDED">AMENDED</option>
                      </select>
                      <span
                        className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                          com.technologistStatus === "APPROVED"
                            ? "bg-emerald-400"
                            : com.technologistStatus === "REJECTED"
                            ? "bg-rose-400"
                            : "bg-amber-400"
                        }`}
                      />
                      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {/* Delete Comment */}
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(com.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Row 2: Multiline Remarks */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={com.remarks}
                    placeholder="Enter fitting comments, construction notes, revision details..."
                    onChange={(e) => handleUpdateComment(com.id, "remarks", e.target.value)}
                    className="w-full rounded-xl border border-gray-800 bg-black px-3.5 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddComment}
              className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-black hover:bg-teal-400 transition"
            >
              ADD COMMENT
            </button>
          </div>
        </div>

        {/* ── Bottom Status Selector & Save Button ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-800">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                "PENDING",
                "APPROVED",
                "CONDITIONAL APPROVED",
                "REJECTED",
                "ALREADY ACCEPTED",
              ] as OverallStatus[]
            ).map((stat) => {
              const isSelected = overallStatus === stat;
              return (
                <button
                  key={stat}
                  type="button"
                  onClick={() => setOverallStatus(stat)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition shadow-sm ${
                    stat === "PENDING"
                      ? isSelected
                        ? "border-2 border-teal-400 bg-teal-500/20 text-teal-300"
                        : "border border-gray-800 bg-[#0d1414] text-teal-400 hover:border-teal-400/40"
                      : stat === "APPROVED"
                      ? isSelected
                        ? "bg-emerald-600 text-white font-extrabold ring-2 ring-emerald-400"
                        : "bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900"
                      : stat === "CONDITIONAL APPROVED"
                      ? isSelected
                        ? "bg-amber-600 text-white font-extrabold ring-2 ring-amber-400"
                        : "bg-amber-950/70 border border-amber-800/60 text-amber-300 hover:bg-amber-900"
                      : stat === "REJECTED"
                      ? isSelected
                        ? "bg-red-600 text-white font-extrabold ring-2 ring-red-400"
                        : "bg-red-950/70 border border-red-800/60 text-red-300 hover:bg-red-900"
                      : isSelected
                      ? "bg-gray-600 text-white font-extrabold ring-2 ring-gray-400"
                      : "bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {stat}
                </button>
              );
            })}
          </div>

          {/* Save Action */}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-8 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl self-end sm:self-auto"
          >
            <Save size={15} /> SAVE
          </button>
        </div>
      </div>
    </SourcingShell>
  );
}

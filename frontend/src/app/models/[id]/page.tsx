"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  Box,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileCheck,
  FileText,
  Folder,
  Layers,
  Palette,
  Ruler,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { brands, models } from "@/lib/mock-data";

interface CategoryItem {
  key: string;
  title: string;
  icon: React.ElementType;
  route?: string;
  isModal?: boolean;
  subtitle?: string;
  fileCount: number;
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
}

export default function ModelFolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();

  // Find model & brand
  const model = models.find((m) => m.id === id || m.code === id) || {
    id: id || "5906482949644",
    code: id && id.length > 5 ? id : "5906482949644",
    name: "Tote Bag",
    brandId: "tera",
    category: "Home Textiles",
    daysToHandover: -3,
    image: "",
  };

  const brand = brands.find((b) => b.id === model.brandId) || {
    id: "soxo",
    name: "SOXO",
  };

  // ── Daily Production Report Files State ────────────────────────────────────
  const [productionFiles, setProductionFiles] = useState<UploadedFile[]>([]);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);

  // 9 Categories matching live site
  const categories: CategoryItem[] = [
    {
      key: "purchase_orders",
      title: "PURCHASE ORDERS",
      icon: ClipboardCheck,
      route: `/models/${id}/purchase-order`,
      subtitle: "Last Saved on 22-08-2026",
      fileCount: 1,
    },
    {
      key: "tna",
      title: "TNA (TIME & ACTION)",
      icon: CalendarClock,
      route: `/models/${id}/tna`,
      fileCount: 0,
    },
    {
      key: "sample_submission",
      title: "SAMPLE SUBMISSION & APPROVAL",
      icon: FileCheck,
      route: `/models/${id}/documentation`,
      fileCount: 0,
    },
    {
      key: "artwork",
      title: "ARTWORK",
      icon: Palette,
      route: `/models/${id}/artwork`,
      fileCount: 0,
    },
    {
      key: "measurements_pattern",
      title: "MEASUREMENTS & PATTERN",
      icon: Ruler,
      route: `/models/${id}/measurements`,
      fileCount: 0,
    },
    {
      key: "trimming_files",
      title: "TRIMMING FILES & LAYOUTS",
      icon: Box,
      route: `/models/${id}/trimming`,
      fileCount: 0,
    },
    {
      key: "fabric_status",
      title: "FABRIC STATUS",
      icon: Layers,
      route: `/models/${id}/fabric-status`,
      fileCount: 0,
    },
    {
      key: "daily_production_report",
      title: "DAILY PRODUCTION REPORT",
      icon: BarChart2,
      isModal: true,
      fileCount: productionFiles.length,
    },
    {
      key: "quality_check_reports",
      title: "QUALITY CHECK REPORTS",
      icon: ClipboardList,
      route: `/models/${id}/quality-check`,
      fileCount: 0,
    },
  ];

  const isOverdue = model.daysToHandover <= 0;
  const overdueDays = Math.abs(model.daysToHandover || 3);

  function handleCategoryClick(cat: CategoryItem) {
    if (cat.isModal) {
      setIsProductionModalOpen(true);
    } else if (cat.route) {
      router.push(cat.route);
    }
  }

  function handleProductionFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles: UploadedFile[] = Array.from(files).map((f) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      fileName: f.name,
      fileSize: `${(f.size / 1024).toFixed(1)} KB`,
      uploadDate: new Date().toISOString().split("T")[0],
    }));
    setProductionFiles([...productionFiles, ...newFiles]);
  }

  function handleDeleteProductionFile(fileId: string) {
    setProductionFiles(productionFiles.filter((f) => f.id !== fileId));
  }

  return (
    <SourcingShell>
      <div className="space-y-5 text-gray-200">

        {/* Main 3x3 Grid + Right Preview Card */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left 3-Column Grid of 9 Categories */}
          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className="w-full text-left bg-[#0d1414] rounded-2xl border border-teal-900/40 p-5 hover:border-teal-500/50 hover:bg-[#101b1b] hover:shadow-lg transition-all group cursor-pointer flex flex-col justify-between"
                  style={{ minHeight: "135px" }}
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-11 h-11 rounded-full border-2 border-teal-500/40 flex items-center justify-center shrink-0 text-teal-400 group-hover:border-teal-400 group-hover:bg-teal-500/10 transition-colors">
                      <Icon size={20} strokeWidth={1.7} />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider leading-snug">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="w-full h-[1.5px] bg-teal-500/30 rounded mb-3" />

                  <p className="text-xs text-gray-400 font-medium">
                    {cat.subtitle ?? `No. Of Files: ${String(cat.fileCount).padStart(2, "0")}`}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Model Preview Card */}
          <div className="w-full lg:w-72 shrink-0 rounded-2xl border border-teal-900/40 bg-[#0d1414] p-5 flex flex-col items-center justify-between shadow-xl">
            {/* Model Number / Code */}
            <div className="w-full border-b border-teal-900/40 pb-3 text-center">
              <h2 className="text-lg font-bold font-mono text-white tracking-widest">
                {model.code}
              </h2>
            </div>

            {/* Model Image Frame */}
            <div className="my-5 w-full h-64 rounded-2xl bg-white p-3 flex items-center justify-center overflow-hidden shadow-inner">
              {model.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={model.image}
                  alt={model.code}
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

            {/* Overdue / Handover Badge */}
            <div
              className={`w-full flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold ${
                isOverdue
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                  : "bg-teal-500/10 border border-teal-500/30 text-teal-400"
              }`}
            >
              <AlertTriangle size={14} className={isOverdue ? "text-amber-400" : "text-teal-400"} />
              <span>{isOverdue ? `${overdueDays} Days overdue!` : `${model.daysToHandover} Days to handover!`}</span>
            </div>
          </div>
        </div>

        {/* ── Modal: Daily Production Report ─────────────────────────────────── */}
        {isProductionModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
            onClick={() => setIsProductionModalOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0d1414] shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-900/50">
                <h2 className="text-base font-bold text-white">Daily Production Report</h2>
                <button
                  type="button"
                  onClick={() => setIsProductionModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {productionFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-black/60 border border-gray-800 flex items-center justify-center text-gray-400 shadow-inner">
                      <Folder size={26} className="text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">No files yet</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Upload files for daily production report
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {productionFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-xl border border-gray-800 bg-black/40 p-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText size={16} className="text-teal-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate max-w-[200px]">{file.fileName}</p>
                            <p className="text-[10px] text-gray-500">{file.fileSize} • {file.uploadDate}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteProductionFile(file.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <label className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-full bg-[#00BFA5] px-6 py-3 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl">
                    <Upload size={15} /> Upload Files
                    <input
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.png,.jpg"
                      className="hidden"
                      onChange={handleProductionFileUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

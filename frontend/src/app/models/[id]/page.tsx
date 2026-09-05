"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
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
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";
import { BrandsApi, BrandEntity } from "@/lib/api/brands-api";
import { uploadFile } from "@/lib/storage";
import { ModelStatusWidget } from "@/components/cards/ModelStatusWidget";

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
  fileUrl?: string;
}

export default function ModelFolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();

  const [model, setModel] = useState<ModelEntity>({
    id: id || "",
    code: id || "",
    name: "",
    brandId: "",
    category: "",
    daysToHandover: 0,
    image: "",
    status: "Pending",
  });

  const [brand, setBrand] = useState<BrandEntity | null>(null);
  const [latestPurchaseOrder, setLatestPurchaseOrder] = useState<any | null>(null);
  const [tnaItemsCount, setTnaItemsCount] = useState(0);
  const [documentationCount, setDocumentationCount] = useState(0);
  const [artworkCount, setArtworkCount] = useState(0);
  const [measurementCount, setMeasurementCount] = useState(0);
  const [trimmingCount, setTrimmingCount] = useState(0);
  const [fabricStatusCount, setFabricStatusCount] = useState(0);
  const [qualityCheckCount, setQualityCheckCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const data = await ModelsApi.getById(id);
        if (data) {
          setModel(data);
          if (data.brandId) {
            const brandData = await BrandsApi.getById(data.brandId);
            setBrand(brandData);
          }
          const [purchaseOrders, tnaPlans, documentationRecords, artworkRecords, measurementRecords, trimmingRecords, fabricStatusRecords, qcRecords] = await Promise.all([
            ModelsApi.getPurchaseOrders(id),
            ModelsApi.getTnaPlans(id),
            ModelsApi.getQcInspections(id, "documentation"),
            ModelsApi.getQcInspections(id, "artwork"),
            ModelsApi.getQcInspections(id, "measurements"),
            ModelsApi.getTrimmingBoms(id),
            ModelsApi.getQcInspections(id, "fabric-status"),
            ModelsApi.getQcInspections(id),
          ]);
          setLatestPurchaseOrder(purchaseOrders[0] || null);
          setTnaItemsCount(Array.isArray(tnaPlans) ? tnaPlans.length : 0);
          setDocumentationCount(Array.isArray(documentationRecords) ? documentationRecords.length : 0);
          setArtworkCount(Array.isArray(artworkRecords) ? artworkRecords.length : 0);
          setMeasurementCount(Array.isArray(measurementRecords) ? measurementRecords.length : 0);
          setTrimmingCount(Array.isArray(trimmingRecords) ? trimmingRecords.length : 0);
          setFabricStatusCount(Array.isArray(fabricStatusRecords) ? fabricStatusRecords.length : 0);
          setQualityCheckCount(Array.isArray(qcRecords) ? qcRecords.length : 0);
        }
      } catch (err) {
        console.warn("Failed to load model details:", err);
      }
    }
    loadData();
  }, [id]);

  // ── Daily Production Report Files State ────────────────────────────────────
  const [productionFiles, setProductionFiles] = useState<UploadedFile[]>([]);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    ModelsApi.getQcInspections(id, "daily-production-report")
      .then((records) => {
        const latest = records[0] as any;
        if (!latest?.remarks) return;
        try {
          const savedFiles = JSON.parse(latest.remarks);
          if (Array.isArray(savedFiles)) setProductionFiles(savedFiles);
        } catch {
          setProductionFiles([]);
        }
      })
      .catch(() => setProductionFiles([]));
  }, [id]);

  const purchaseOrderDateLabel = latestPurchaseOrder?.updatedAt || latestPurchaseOrder?.createdAt
    ? new Date(latestPurchaseOrder.updatedAt || latestPurchaseOrder.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, "-")
    : "Not saved yet";

  // 9 Categories matching live site
  const categories: CategoryItem[] = [
    {
      key: "purchase_orders",
      title: "PURCHASE ORDERS",
      icon: ClipboardCheck,
      route: `/models/${id}/purchase-order`,
      subtitle: latestPurchaseOrder ? `Last Saved on ${purchaseOrderDateLabel}` : "Last Saved on --",
      fileCount: latestPurchaseOrder ? 1 : 0,
    },
    {
      key: "tna",
      title: "TNA (TIME & ACTION)",
      icon: CalendarClock,
      route: `/models/${id}/tna`,
      fileCount: tnaItemsCount,
    },
    {
      key: "sample_submission",
      title: "SAMPLE SUBMISSION & APPROVAL",
      icon: FileCheck,
      route: `/models/${id}/documentation`,
      fileCount: documentationCount,
    },
    {
      key: "artwork",
      title: "ARTWORK",
      icon: Palette,
      route: `/models/${id}/artwork`,
      fileCount: artworkCount,
    },
    {
      key: "measurements_pattern",
      title: "MEASUREMENTS & PATTERN",
      icon: Ruler,
      route: `/models/${id}/measurements`,
      fileCount: measurementCount,
    },
    {
      key: "trimming_files",
      title: "TRIMMING FILES & LAYOUTS",
      icon: Box,
      route: `/models/${id}/trimming`,
      fileCount: trimmingCount,
    },
    {
      key: "fabric_status",
      title: "FABRIC STATUS",
      icon: Layers,
      route: `/models/${id}/fabric-status`,
      fileCount: fabricStatusCount,
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
      fileCount: qualityCheckCount,
    },
  ];

  function handleCategoryClick(cat: CategoryItem) {
    if (cat.isModal) {
      setIsProductionModalOpen(true);
    } else if (cat.route) {
      router.push(cat.route);
    }
  }

  async function handleProductionFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newFiles = await Promise.all(
        Array.from(files).map(async (file): Promise<UploadedFile> => ({
          id: `file-${Date.now()}-${Math.random()}`,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          uploadDate: new Date().toISOString().split("T")[0],
          fileUrl: await uploadFile("daily-production", id, file),
        }))
      );
      const allFiles = [...productionFiles, ...newFiles];
      setProductionFiles(allFiles);
      await ModelsApi.saveQcInspection({
        id: `daily-production-${id}`,
        modelId: id,
        inspectionType: "daily-production-report",
        inspectionDate: new Date().toISOString(),
        result: "Pending",
        remarks: JSON.stringify(allFiles),
      });
    } catch (error: any) {
      alert(error?.message || "Failed to upload production file.");
    }
  }

  async function handleDeleteProductionFile(fileId: string) {
    const remainingFiles = productionFiles.filter((f) => f.id !== fileId);
    setProductionFiles(remainingFiles);
    try {
      await ModelsApi.saveQcInspection({
        id: `daily-production-${id}`,
        modelId: id,
        inspectionType: "daily-production-report",
        inspectionDate: new Date().toISOString(),
        result: "Pending",
        remarks: JSON.stringify(remainingFiles),
      });
    } catch (error: any) {
      setProductionFiles(productionFiles);
      alert(error?.message || "Failed to delete production file record.");
    }
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
            <div className="my-5 flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-black p-3">
              {model.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={model.image}
                  alt={model.code}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl border border-gray-800 text-xs uppercase tracking-widest text-gray-500">
                  No image
                </div>
              )}
            </div>

            <ModelStatusWidget model={model} />
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

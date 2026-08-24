"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  FileText,
  Save,
  Upload,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import {
  addCertification,
  loadCertifications,
  type CertificationRecord,
} from "@/lib/audit/certifications-data";
import { getFactoryList } from "@/lib/finance/factory-ledger-data";

const DEFAULT_FACTORIES = [
  "KRK Creationss",
  "Shri Subam Tex",
  "Apex Apparels Ltd",
  "Guhaya Textiles",
  "Velan Knits",
];

export default function CreateCertificationPage() {
  const router = useRouter();

  const [factoryName, setFactoryName] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const factoryList = useMemo(() => {
    try {
      const list = getFactoryList();
      const merged = Array.from(new Set([...DEFAULT_FACTORIES, ...list]));
      return merged;
    } catch {
      return DEFAULT_FACTORIES;
    }
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfFileName(file.name);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!factoryName.trim()) {
      showToast("Please select a factory name");
      return;
    }
    if (!certificateName.trim()) {
      showToast("Please enter a certificate name");
      return;
    }

    addCertification({
      factoryName,
      certificationType: certificateName,
      certificateNumber: pdfFileName || `CERT-${Date.now().toString().slice(-6)}`,
      issuingBody: "Certification Body",
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      scope: "Garment Manufacturing",
      notes: remarks || "-",
      pdfUrl: pdfFileName || undefined,
    } as any);

    router.push("/audit/certifications");
  }

  return (
    <SourcingShell>
      <div className="max-w-3xl mx-auto pb-24 text-gray-200 space-y-4">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-teal-500 px-4 py-2.5 text-xs font-bold text-black shadow-xl">
            {toastMsg}
          </div>
        )}

        {/* Main Card */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-gray-800 bg-[#0d1414] p-8 shadow-2xl space-y-6"
        >
          <h1 className="text-base font-bold text-white tracking-tight">Add Certification</h1>

          {/* Factory Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-300 font-semibold block">Factory Name</label>
            <div className="relative">
              <select
                value={factoryName}
                onChange={(e) => setFactoryName(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-800 bg-black/70 px-4 py-3 text-xs text-white outline-none focus:border-teal-400"
              >
                <option value="">Select factory</option>
                {factoryList.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Certificate Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-300 font-semibold block">Certificate Name</label>
            <input
              type="text"
              value={certificateName}
              placeholder="e.g. ISO 9001, GOTS, OEKO-TEX"
              onChange={(e) => setCertificateName(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-black/70 px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
            />
          </div>

          {/* Issue Date & Expiry Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-300 font-semibold block">Issue Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={issueDate}
                  placeholder="dd-mm-yyyy"
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-black/70 px-4 py-3 text-xs text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-gray-300 font-semibold block">Expiry Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={expiryDate}
                  placeholder="dd-mm-yyyy"
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-800 bg-black/70 px-4 py-3 text-xs text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Certificate PDF Dropzone */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-300 font-semibold block">Certificate PDF</label>
            {pdfFileName ? (
              <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-black/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-950/60 border border-teal-800/50 text-teal-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">{pdfFileName}</span>
                    <span className="text-[10px] text-teal-400">Ready to upload</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPdfFileName(null)}
                  className="p-1 text-gray-400 hover:text-red-400 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-black/40 py-8 px-4 cursor-pointer hover:border-teal-500/50 hover:bg-black/60 transition group">
                <div className="p-3 rounded-full bg-gray-900/80 text-gray-400 group-hover:text-teal-400 group-hover:scale-110 transition mb-2">
                  <Upload size={22} />
                </div>
                <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition">
                  Click to upload certificate PDF
                </span>
                <span className="text-[10px] text-gray-500 mt-1">PDF only, max 10 MB</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-300 font-semibold block">Remarks</label>
            <textarea
              rows={4}
              value={remarks}
              placeholder="Any additional notes about this certification..."
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-black/70 px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400 resize-y"
            />
          </div>

          {/* Bottom Right Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg"
            >
              <Save size={14} />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </SourcingShell>
  );
}

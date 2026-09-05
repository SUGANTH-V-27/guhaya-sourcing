"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Save,
  Upload,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { saveOrUpdateTechnicalAudit, type TechnicalAudit } from "@/lib/audit/technical-audit-data";
import { uploadFile } from "@/lib/storage";

// Document structure for all sections in Technical Audit checklist
export type TechDocItem = {
  id: string;
  name: string;
  available: "N/A" | "Yes" | "No";
  rating: string;
  remarks: string;
  proofUrl?: string | null;
};

export type TechDocSection = {
  id: string;
  title: string;
  items: TechDocItem[];
};

const ALL_TECHNICAL_SECTIONS: TechDocSection[] = [
  {
    id: "qms",
    title: "Quality Management System",
    items: [
      { id: "qms-1", name: "Quality Manual", available: "N/A", rating: "-", remarks: "" },
      { id: "qms-2", name: "Quality Policy & Objectives", available: "N/A", rating: "-", remarks: "" },
      { id: "qms-3", name: "Quality Org Chart", available: "N/A", rating: "-", remarks: "" },
      { id: "qms-4", name: "SOP / Procedures", available: "N/A", rating: "-", remarks: "" },
      { id: "qms-5", name: "Process Flow Chart", available: "N/A", rating: "-", remarks: "" },
      { id: "qms-6", name: "Internal Audit Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "qms-7", name: "Management Review Records", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "incoming",
    title: "Incoming Material",
    items: [
      { id: "inc-1", name: "Fabric Inspection Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "inc-2", name: "Fabric Test Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "inc-3", name: "Trim Inspection Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "inc-4", name: "Approved Swatches / Shade Bands", available: "N/A", rating: "-", remarks: "" },
      { id: "inc-5", name: "Supplier Approval Records", available: "N/A", rating: "-", remarks: "" },
      { id: "inc-6", name: "Material Rejection Records", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "pre-prod",
    title: "Pre-Production",
    items: [
      { id: "pp-1", name: "Tech Pack", available: "N/A", rating: "-", remarks: "" },
      { id: "pp-2", name: "Approved Samples", available: "N/A", rating: "-", remarks: "" },
      { id: "pp-3", name: "BOM", available: "N/A", rating: "-", remarks: "" },
      { id: "pp-4", name: "Size Chart Approval", available: "N/A", rating: "-", remarks: "" },
      { id: "pp-5", name: "Construction Details", available: "N/A", rating: "-", remarks: "" },
      { id: "pp-6", name: "Risk Analysis", available: "N/A", rating: "-", remarks: "" },
      { id: "pp-7", name: "Pilot Run Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "pp-8", name: "PP Meeting Records", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "inline",
    title: "In-Line Quality",
    items: [
      { id: "il-1", name: "In-Line Inspection Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "il-2", name: "First Piece Inspection", available: "N/A", rating: "-", remarks: "" },
      { id: "il-3", name: "Defect Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "il-4", name: "Operator Check Records", available: "N/A", rating: "-", remarks: "" },
      { id: "il-5", name: "Machine Calibration", available: "N/A", rating: "-", remarks: "" },
      { id: "il-6", name: "Needle Control Log", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "final",
    title: "Final Inspection",
    items: [
      { id: "fi-1", name: "Final Random Inspection", available: "N/A", rating: "-", remarks: "" },
      { id: "fi-2", name: "AQL Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "fi-3", name: "Measurement Audit", available: "N/A", rating: "-", remarks: "" },
      { id: "fi-4", name: "Visual Inspection", available: "N/A", rating: "-", remarks: "" },
      { id: "fi-5", name: "Metal Detection", available: "N/A", rating: "-", remarks: "" },
      { id: "fi-6", name: "Packing Accuracy", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "testing",
    title: "Testing",
    items: [
      { id: "t-1", name: "Lab Test Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "t-2", name: "RSL Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "t-3", name: "Color Fastness", available: "N/A", rating: "-", remarks: "" },
      { id: "t-4", name: "Compliance Certificates", available: "N/A", rating: "-", remarks: "" },
      { id: "t-5", name: "Wash Test Results", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "traceability",
    title: "Traceability",
    items: [
      { id: "tr-1", name: "Production Tracking", available: "N/A", rating: "-", remarks: "" },
      { id: "tr-2", name: "Lot Tracking", available: "N/A", rating: "-", remarks: "" },
      { id: "tr-3", name: "Cutting Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "tr-4", name: "Sewing Output", available: "N/A", rating: "-", remarks: "" },
      { id: "tr-5", name: "Finishing Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "tr-6", name: "Packing Verification", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "capa",
    title: "CAPA",
    items: [
      { id: "ca-1", name: "Corrective Action Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "ca-2", name: "Customer Complaints", available: "N/A", rating: "-", remarks: "" },
      { id: "ca-3", name: "Root Cause Analysis", available: "N/A", rating: "-", remarks: "" },
      { id: "ca-4", name: "Preventive Action Records", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance",
    items: [
      { id: "mt-1", name: "Machine Maintenance", available: "N/A", rating: "-", remarks: "" },
      { id: "mt-2", name: "Calibration Certificates", available: "N/A", rating: "-", remarks: "" },
      { id: "mt-3", name: "Preventive Maintenance Plan", available: "N/A", rating: "-", remarks: "" },
      { id: "mt-4", name: "Breakdown Records", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "training",
    title: "Training",
    items: [
      { id: "trg-1", name: "QC Training Records", available: "N/A", rating: "-", remarks: "" },
      { id: "trg-2", name: "Skill Matrix", available: "N/A", rating: "-", remarks: "" },
      { id: "trg-3", name: "Operator Training", available: "N/A", rating: "-", remarks: "" },
      { id: "trg-4", name: "Needle/Safety Training", available: "N/A", rating: "-", remarks: "" },
      { id: "trg-5", name: "Quality Training Logs", available: "N/A", rating: "-", remarks: "" },
    ],
  },
  {
    id: "zero-tolerance",
    title: "Zero Tolerance",
    items: [
      { id: "zt-1", name: "Moisture Meter In Place", available: "N/A", rating: "-", remarks: "" },
      { id: "zt-2", name: "Metal Detector in Place", available: "N/A", rating: "-", remarks: "" },
      { id: "zt-3", name: "Metal Free Zone Space", available: "N/A", rating: "-", remarks: "" },
      { id: "zt-4", name: "Pull Test Reports", available: "N/A", rating: "-", remarks: "" },
      { id: "zt-5", name: "Pest Control Activities", available: "N/A", rating: "-", remarks: "" },
      { id: "zt-6", name: "Insects Control", available: "N/A", rating: "-", remarks: "" },
      { id: "zt-7", name: "Curtains and Screens in Doors and Windows", available: "N/A", rating: "-", remarks: "" },
    ],
  },
];

const BRANDS = ["Sinsay", "Reserved", "Mohito", "Cropp", "House", "SOXO"];
const RATING_OPTIONS = ["-", "Good", "Acceptable", "Needs Improvement", "Poor", "N/A"];
const AVAILABLE_OPTIONS = ["N/A", "Yes", "No"];

export default function CreateTechnicalAuditPage() {
  const router = useRouter();

  // Basic Information
  const [brand, setBrand] = useState("");
  const [factoryName, setFactoryName] = useState("");
  const [factoryAddress, setFactoryAddress] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [auditorName, setAuditorName] = useState("");

  // Factory Contact Details
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // Checklist Sections state (all 11 sections, 64 items)
  const [sections, setSections] = useState<TechDocSection[]>(ALL_TECHNICAL_SECTIONS);
  const [overallRemarks, setOverallRemarks] = useState("");

  // Update item field
  function updateItem(
    secIndex: number,
    itemIndex: number,
    field: keyof TechDocItem,
    value: any
  ) {
    setSections((prev) => {
      const next = [...prev];
      const section = { ...next[secIndex] };
      const items = [...section.items];
      items[itemIndex] = { ...items[itemIndex], [field]: value };
      section.items = items;
      next[secIndex] = section;
      return next;
    });
  }

  async function handleProofUpload(secIndex: number, itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const proofUrl = await uploadFile("technical-audits", factoryName || "unassigned", file);
      updateItem(secIndex, itemIndex, "proofUrl", proofUrl);
    } catch (error: any) {
      alert(error?.message || "Failed to upload proof file.");
    }
  }

  // Calculate totals
  const stats = useMemo(() => {
    let totalItems = 0;
    let availableCount = 0;
    let missingCount = 0;

    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        totalItems++;
        if (item.available === "Yes") availableCount++;
        else if (item.available === "No") missingCount++;
      });
    });

    return { totalItems, availableCount, missingCount };
  }, [sections]);

  async function handleSave() {
    const audit: TechnicalAudit = {
      id: `ta-${Date.now()}`,
      factoryName: factoryName || "Unnamed Factory",
      brand: brand || "Sinsay",
      auditDate: assessmentDate,
      auditorName: auditorName || "Lead Technical Auditor",
      location: factoryAddress || "",
      contact: contactPerson,
      workforceCount: 350,
      dailyCapacityPcs: 15000,
      productCategories: ["Knitted Garments"],
      overallScorePercent: stats.totalItems > 0 ? Math.round((stats.availableCount / stats.totalItems) * 100) : 0,
      grade: "Grade B (Approved)",
      status: "Approved",
      modules: [],
      findings: [],
      available: stats.availableCount,
      missing: stats.missingCount,
      total: stats.totalItems,
      conclusion: overallRemarks,
      sectionsData: sections,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    } as any;

    try {
      await saveOrUpdateTechnicalAudit(audit);
      router.push("/audit/technical-audit");
    } catch (error: any) {
      alert(error?.message || "Failed to save technical audit.");
    }
  }

  return (
    <SourcingShell>
      <div className="max-w-6xl mx-auto pb-24 text-gray-200 space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">New Technical Audit</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-black/60 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition"
            >
              <Download size={13} /> Export PDF
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-4 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
            >
              <Save size={13} /> Save Audit
            </button>
          </div>
        </div>

        {/* Basic Information Card */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Brand Name</label>
              <div className="relative">
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                >
                  <option value="">Select brand</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Factory Name</label>
              <input
                type="text"
                value={factoryName}
                placeholder="Factory name"
                onChange={(e) => setFactoryName(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Factory Address</label>
              <input
                type="text"
                value={factoryAddress}
                placeholder="Auto-filled"
                onChange={(e) => setFactoryAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Assessment Date</label>
              <input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Auditor Name</label>
              <input
                type="text"
                value={auditorName}
                placeholder="Auditor name"
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
              />
            </div>
          </div>
        </div>

        {/* Factory Contact Details Card */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white">Factory Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                placeholder="Name"
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Email</label>
              <input
                type="email"
                value={contactEmail}
                placeholder="example@factory.com"
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400"
              />
            </div>
          </div>
        </div>

        {/* 11 Checklist Sections (64 items) */}
        {sections.map((sec, secIndex) => (
          <div
            key={sec.id}
            className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-4"
          >
            <h2 className="text-sm font-bold text-white">{sec.title}</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800/80 text-[11px] font-bold text-gray-400">
                    <th className="py-2.5 px-3 min-w-[200px]">Document Name</th>
                    <th className="py-2.5 px-3 w-28">Available</th>
                    <th className="py-2.5 px-3 w-44">Ratings</th>
                    <th className="py-2.5 px-3 min-w-[260px]">Remarks</th>
                    <th className="py-2.5 px-3 text-center w-24">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {sec.items.map((item, itemIndex) => (
                    <tr key={item.id} className="hover:bg-gray-800/10 transition">
                      <td className="py-2.5 px-3 text-gray-200 font-medium">{item.name}</td>
                      
                      {/* Available Dropdown */}
                      <td className="py-2.5 px-3">
                        <div className="relative">
                          <select
                            value={item.available}
                            onChange={(e) => updateItem(secIndex, itemIndex, "available", e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                          >
                            {AVAILABLE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </td>

                      {/* Ratings Dropdown */}
                      <td className="py-2.5 px-3">
                        <div className="relative">
                          <select
                            value={item.rating}
                            onChange={(e) => updateItem(secIndex, itemIndex, "rating", e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-800 bg-black pl-3 pr-7 py-1.5 text-xs text-white outline-none focus:border-teal-400"
                          >
                            {RATING_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </td>

                      {/* Remarks Input */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.remarks}
                          placeholder="Remarks"
                          onChange={(e) => updateItem(secIndex, itemIndex, "remarks", e.target.value)}
                          className="w-full rounded-lg border border-gray-800 bg-black px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-teal-400"
                        />
                      </td>

                      {/* Proof */}
                      <td className="py-2.5 px-3 text-center">
                        {item.proofUrl ? (
                          <div className="inline-flex items-center gap-1 text-[11px] text-teal-400">
                            <span className="truncate max-w-[70px]">{item.proofUrl}</span>
                            <button
                              type="button"
                              onClick={() => updateItem(secIndex, itemIndex, "proofUrl", null)}
                              className="text-gray-500 hover:text-red-400"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer text-gray-500 hover:text-teal-400 transition inline-flex items-center justify-center">
                            <Upload size={14} />
                            <input
                              type="file"
                              className="sr-only"
                              onChange={(e) => handleProofUpload(secIndex, itemIndex, e)}
                            />
                          </label>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Overall Remarks Card */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] p-6 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white">Overall Remarks</h2>
          <textarea
            rows={5}
            value={overallRemarks}
            onChange={(e) => setOverallRemarks(e.target.value)}
            placeholder="Enter overall remarks for this technical audit..."
            className="w-full rounded-lg border border-gray-800 bg-black/60 px-4 py-3 text-xs text-white placeholder-gray-600 outline-none focus:border-teal-400 resize-y"
          />
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/audit/technical-audit")}
            className="rounded-lg border border-gray-700 bg-black/40 px-5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00BFA5] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
          >
            <Save size={14} /> Save Audit
          </button>
        </div>
      </div>
    </SourcingShell>
  );
}

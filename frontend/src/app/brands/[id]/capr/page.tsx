"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileCheck,
  Filter,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { BrandNavTabs } from "@/components/brand/BrandNavTabs";
import { BrandsApi, BrandEntity } from "@/lib/api/brands-api";
import {
  type CAPRRecord,
  INITIAL_CAPR_RECORDS,
} from "@/lib/brand/brand-subpages-data";

export default function BrandCAPRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = React.use(params);
  const [brand, setBrand] = useState<BrandEntity | null>(null);
  const [caprList, setCaprList] = useState<CAPRRecord[]>(INITIAL_CAPR_RECORDS);

  useEffect(() => {
    async function loadData() {
      if (!brandId) return;
      try {
        const [brandData, caprData] = await Promise.all([
          BrandsApi.getById(brandId),
          BrandsApi.getCaprIssues(brandId),
        ]);
        if (brandData) setBrand(brandData);
        if (caprData && caprData.length > 0) setCaprList(caprData);
      } catch (err) {
        console.warn("Failed to load CAPR data:", err);
      }
    }
    loadData();
  }, [brandId]);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCapr, setSelectedCapr] = useState<CAPRRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formReportNo, setFormReportNo] = useState(`CAPR-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [formStyleNo, setFormStyleNo] = useState("006GS");
  const [formFactory, setFormFactory] = useState("Apex Apparels Ltd");
  const [formDept, setFormDept] = useState<CAPRRecord["department"]>("Sewing");
  const [formSeverity, setFormSeverity] = useState<CAPRRecord["severity"]>("Major");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formRootCause, setFormRootCause] = useState("");
  const [formAction, setFormAction] = useState("");
  const [formAuditor, setFormAuditor] = useState("Senior Quality Controller");
  const [formTargetDate, setFormTargetDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );

  const filteredCapr = caprList.filter((c) => {
    const matchSev = severityFilter === "all" || c.severity === severityFilter;
    const matchStat = statusFilter === "all" || c.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.reportNo.toLowerCase().includes(q) ||
      c.styleNo.toLowerCase().includes(q) ||
      c.defectTitle.toLowerCase().includes(q) ||
      c.factoryName.toLowerCase().includes(q);
    return matchSev && matchStat && matchSearch;
  });

  function handleCreateCapr() {
    if (!formTitle.trim() || !formDesc.trim()) return;
    const newRecord: CAPRRecord = {
      id: `capr-${Date.now()}`,
      brandId,
      reportNo: formReportNo,
      styleNo: formStyleNo,
      factoryName: formFactory,
      issueDate: new Date().toISOString().split("T")[0],
      department: formDept,
      defectTitle: formTitle.trim(),
      defectDescription: formDesc.trim(),
      severity: formSeverity,
      rootCause: formRootCause.trim() || "Under investigation by factory QC supervisor.",
      preventiveAction: formAction.trim() || "Process calibration and re-training of sewing operators.",
      targetDate: formTargetDate,
      status: "Open",
      assignedAuditor: formAuditor,
    };
    setCaprList([newRecord, ...caprList]);
    setIsModalOpen(false);
    setFormTitle("");
    setFormDesc("");
  }

  function handleCloseCapr(id: string) {
    setCaprList((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Closed",
              closureDate: new Date().toISOString().split("T")[0],
            }
          : c
      )
    );
    if (selectedCapr?.id === id) {
      setSelectedCapr((prev) => (prev ? { ...prev, status: "Closed", closureDate: new Date().toISOString().split("T")[0] } : null));
    }
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/brands" className="transition-colors hover:text-teal-400">
            Brands
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">{brand?.name || "Brand"}</span>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">CAPR Issue Management</span>
        </>
      }
    >
      <BrandNavTabs brandId={brandId} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Corrective &amp; Preventive Action Reports (CAPR)
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Defect logging, root-cause 5-Why analysis, factory corrective responses &amp; verification closure for {brand?.name}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400 transition"
          >
            <Plus size={16} /> Issue New CAPR
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search CAPR #, style, defect, factory..."
                className="w-full rounded-lg border border-gray-700 bg-black pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Severity:
              </span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-white outline-none focus:border-teal-400"
              >
                <option value="all">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-white outline-none focus:border-teal-400"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Factory Responded">Factory Responded</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* CAPR Records Grid */}
        <div className="space-y-4">
          {filteredCapr.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-gray-800 bg-gray-900/90 p-5 shadow-lg space-y-4 hover:border-gray-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-teal-300 text-sm">
                    {c.reportNo}
                  </span>
                  <span className="rounded bg-black/60 px-2 py-0.5 text-xs text-gray-300">
                    Style: <strong>{c.styleNo}</strong>
                  </span>
                  <span className="rounded-md bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-400 border border-teal-500/20">
                    {c.department}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      c.severity === "Critical"
                        ? "bg-red-500/20 text-red-300"
                        : c.severity === "Major"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-teal-500/20 text-teal-300"
                    }`}
                  >
                    {c.severity} Severity
                  </span>

                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                      c.status === "Closed"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : c.status === "Factory Responded"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{c.defectTitle}</h3>
                <p className="text-xs text-gray-300 mt-1">{c.defectDescription}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-lg bg-black/40 p-3.5 text-xs text-gray-300">
                <div>
                  <span className="text-gray-500 font-semibold uppercase">Root Cause Identified:</span>
                  <p className="mt-0.5 text-gray-200">{c.rootCause}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold uppercase">
                    Preventive Action Plan:
                  </span>
                  <p className="mt-0.5 text-teal-300">{c.preventiveAction}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs text-gray-400">
                <div>
                  Factory: <strong className="text-white">{c.factoryName}</strong> • Auditor: {c.assignedAuditor} • Target: <span className="font-mono text-amber-300">{c.targetDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  {c.status !== "Closed" && (
                    <button
                      onClick={() => handleCloseCapr(c.id)}
                      className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black transition"
                    >
                      Verify &amp; Close CAPR
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedCapr(c)}
                    className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-1 text-xs font-semibold text-gray-300 hover:text-white"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: New CAPR */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-800/40">
                <h2 className="text-lg font-bold text-white">Raise Corrective Action Report (CAPR)</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Report #</label>
                    <input
                      value={formReportNo}
                      onChange={(e) => setFormReportNo(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Style #</label>
                    <input
                      value={formStyleNo}
                      onChange={(e) => setFormStyleNo(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Factory</label>
                    <input
                      value={formFactory}
                      onChange={(e) => setFormFactory(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Department</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    >
                      <option value="Knitting / Fabric">Knitting / Fabric</option>
                      <option value="Cutting">Cutting</option>
                      <option value="Sewing">Sewing</option>
                      <option value="Dyeing / Printing">Dyeing / Printing</option>
                      <option value="Finishing & Packing">Finishing &amp; Packing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Severity</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    >
                      <option value="Critical">Critical</option>
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Target Closure Date</label>
                    <input
                      type="date"
                      value={formTargetDate}
                      onChange={(e) => setFormTargetDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold">Defect Summary / Title *</label>
                    <input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Wavy neckband topstitch on rib collar"
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold">Defect Description &amp; Findings *</label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows={2}
                      placeholder="Detail inspection observations, frequency of defects, pieces affected..."
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold">Immediate Root Cause</label>
                    <textarea
                      value={formRootCause}
                      onChange={(e) => setFormRootCause(e.target.value)}
                      rows={2}
                      placeholder="Why did the defect occur?"
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold">Corrective &amp; Preventive Action</label>
                    <textarea
                      value={formAction}
                      onChange={(e) => setFormAction(e.target.value)}
                      rows={2}
                      placeholder="Actions mandated to prevent recurrence..."
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-800 px-6 py-4 bg-gray-800/40">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCapr}
                  className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-white hover:bg-teal-400"
                >
                  Issue CAPR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: View Details */}
        {selectedCapr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-800/40">
                <h2 className="text-lg font-bold text-white">{selectedCapr.reportNo} Details</h2>
                <button
                  onClick={() => setSelectedCapr(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4 text-sm text-gray-200 overflow-y-auto">
                <div>
                  <span className="text-xs text-gray-400 uppercase">Defect Title</span>
                  <h4 className="font-bold text-white text-base">{selectedCapr.defectTitle}</h4>
                </div>
                <div className="p-3 bg-black/50 rounded-lg border border-gray-800 text-xs">
                  <span className="text-gray-400">Description:</span>
                  <p className="text-gray-200 mt-1">{selectedCapr.defectDescription}</p>
                </div>
                <div className="p-3 bg-black/50 rounded-lg border border-gray-800 text-xs">
                  <span className="text-gray-400">Root Cause:</span>
                  <p className="text-gray-200 mt-1">{selectedCapr.rootCause}</p>
                </div>
                <div className="p-3 bg-black/50 rounded-lg border border-gray-800 text-xs">
                  <span className="text-gray-400">Preventive Action Plan:</span>
                  <p className="text-teal-300 mt-1 font-medium">{selectedCapr.preventiveAction}</p>
                </div>
              </div>
              <div className="flex justify-end p-4 border-t border-gray-800 bg-gray-800/40">
                <button
                  onClick={() => setSelectedCapr(null)}
                  className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

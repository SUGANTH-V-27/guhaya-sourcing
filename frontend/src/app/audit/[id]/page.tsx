"use client";

import Link from "next/link";
import React from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Edit,
  Factory,
  FileCheck,
  Printer,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";

export default function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: auditId } = React.use(params);

  const auditData = {
    id: auditId,
    title: "Comprehensive Social & Technical Factory Audit",
    factory: "Apex Apparels Ltd (Main Unit #1)",
    location: "Tirupur, Tamil Nadu, India",
    auditDate: "2026-08-15",
    validUntil: "2027-08-14",
    leadAuditor: "S. Murugan (IRCA Lead Auditor)",
    overallScore: 89.4,
    grade: "Grade A (Excellent)",
    categories: [
      { name: "Child Labor & Young Workers", score: 100, status: "Pass" },
      { name: "Forced Labor & Disciplinary Practices", score: 100, status: "Pass" },
      { name: "Freedom of Association", score: 92, status: "Pass" },
      { name: "Wages & Social Benefits", score: 88, status: "Pass" },
      { name: "Working Hours & Overtime Limits", score: 82, status: "Pass" },
      { name: "Health, Safety & Environment (HSE)", score: 86, status: "Pass" },
      { name: "Chemical Management & ETP", score: 90, status: "Pass" },
      { name: "Quality Management System (QMS)", score: 91, status: "Pass" },
    ],
    criticalFindings: [
      { area: "Emergency Exit Lighting", issue: "Battery backup indicator faulty on 1 secondary exit sign in cutting floor.", severity: "Minor", status: "Rectified" },
      { area: "Ear Protection in Embroidery", issue: "2 machine operators not wearing issued earplugs during shift.", severity: "Minor", status: "Rectified" },
    ],
  };

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/audit" className="transition-colors hover:text-teal-400">
            Audit Suite
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">Audit Detail ({auditId})</span>
        </>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Factory Compliance Audit Report
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Comprehensive evaluation report &amp; corrective action tracking for {auditData.factory}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/audit/${auditId}/edit`}
              className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
            >
              <Edit size={14} /> Edit Audit
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        {/* Overview Banner */}
        <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/30 via-gray-900 to-black p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 font-mono font-bold text-xl">
                {auditData.overallScore}%
              </div>
              <div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                  {auditData.grade}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{auditData.factory}</h2>
                <p className="text-xs text-gray-400">{auditData.location}</p>
              </div>
            </div>

            <div className="text-xs text-gray-300 space-y-1">
              <div>Auditor: <strong className="text-white">{auditData.leadAuditor}</strong></div>
              <div>Audit Date: <span className="font-mono text-teal-300">{auditData.auditDate}</span></div>
              <div>Valid Until: <span className="font-mono text-gray-300">{auditData.validUntil}</span></div>
            </div>
          </div>
        </div>

        {/* Category Scores Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {auditData.categories.map((cat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-800 bg-gray-900/90 p-4 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white truncate max-w-[170px]">{cat.name}</span>
                <span className="font-mono font-bold text-teal-300">{cat.score}%</span>
              </div>

              <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    cat.score >= 90 ? "bg-emerald-400" : cat.score >= 80 ? "bg-teal-400" : "bg-amber-400"
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Critical Findings */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            Identified Corrective Action Items
          </h3>

          <div className="space-y-3">
            {auditData.criticalFindings.map((cf, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-800 bg-black/40 p-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{cf.area}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{cf.issue}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    {cf.severity}
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    {cf.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SourcingShell>
  );
}

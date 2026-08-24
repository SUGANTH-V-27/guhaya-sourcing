"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Award, FileSearch, ShieldCheck } from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";

export function AuditHubPage() {
  return (
    <SourcingShell>
      <div className="max-w-5xl mx-auto space-y-6 pb-10 text-gray-200">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit</h1>
          <p className="text-xs text-gray-400">Inspections, reports &amp; compliance audits</p>
        </div>

        {/* 3 Cards Row */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/audit/social-compliance"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-800 bg-[#0d1414] px-8 py-7 min-w-[130px] hover:border-teal-500/50 transition group shadow-lg"
          >
            <ShieldCheck size={32} className="text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider text-center">
              Social Compliance
            </span>
          </Link>

          <Link
            href="/audit/technical-audit"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-800 bg-[#0d1414] px-8 py-7 min-w-[130px] hover:border-teal-500/50 transition group shadow-lg"
          >
            <FileSearch size={32} className="text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider text-center">
              Technical Audit
            </span>
          </Link>

          <Link
            href="/audit/certifications"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-800 bg-[#0d1414] px-8 py-7 min-w-[130px] hover:border-teal-500/50 transition group shadow-lg"
          >
            <Award size={32} className="text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider text-center">
              Certifications
            </span>
          </Link>
        </div>
      </div>
    </SourcingShell>
  );
}

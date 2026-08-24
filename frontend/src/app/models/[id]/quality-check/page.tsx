"use client";

import Link from "next/link";
import React from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Eye,
  FileCheck,
  FileText,
  Layers,
  Ruler,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";

interface QCModule {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  href: string;
}

export default function QualityCheckHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);

  // 8 Inspection cards matching live site screenshot
  const modules: QCModule[] = [
    {
      id: "sample-evaluation",
      label: "SAMPLE EVALUATION",
      icon: Ruler,
      description: "Evaluate sample measurements against spec with AI extraction",
      href: `/models/${modelId}/quality-check/sample-evaluation`,
    },
    {
      id: "test-report",
      label: "TEST REPORT",
      icon: FileText,
      description: "Upload and manage test reports for this model",
      href: `/models/${modelId}/quality-check/test-report`,
    },
    {
      id: "fabric-inspection",
      label: "FABRIC INSPECTION",
      icon: Layers,
      description: "Inspect fabric quality, GSM, and composition",
      href: `/models/${modelId}/quality-check/fabric-inspection`,
    },
    {
      id: "pre-production",
      label: "PRE-PRODUCTION MEETING",
      icon: Users,
      description: "Pre production review and approvals",
      href: `/models/${modelId}/quality-check/pre-production`,
    },
    {
      id: "first-garment",
      label: "FIRST GARMENT OUTPUT",
      icon: FileCheck,
      description: "First bulk review report for garment output quality",
      href: `/models/${modelId}/quality-check/first-garment`,
    },
    {
      id: "inline-inspection",
      label: "IN-LINE INSPECTION",
      icon: Activity,
      description: "In process quality checks during production",
      href: `/models/${modelId}/quality-check/inline-inspection`,
    },
    {
      id: "midline-inspection",
      label: "MID-LINE INSPECTION",
      icon: Eye,
      description: "Mid-production quality assessment with packing checklist",
      href: `/models/${modelId}/quality-check/midline-inspection`,
    },
    {
      id: "final-inspection",
      label: "FINAL INSPECTION",
      icon: CheckCircle2,
      description: "Final quality check before shipment",
      href: `/models/${modelId}/quality-check/final-inspection`,
    },
  ];

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-20 max-w-7xl mx-auto">

        {/* Header with Clipboard Check Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <ClipboardCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
              QUALITY CHECK REPORTS
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Select an inspection type to create or view reports for model{" "}
              <span className="font-mono text-white font-semibold">{modelId || "5906482949644"}</span>
            </p>
          </div>
        </div>

        {/* 8 Inspection Cards (3 Columns Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.id}
                href={m.href}
                className="w-full text-left bg-[#0d1414] rounded-2xl border border-teal-900/40 p-5 hover:border-teal-500/50 hover:bg-[#101b1b] hover:shadow-lg transition-all group flex flex-col justify-between"
                style={{ minHeight: "140px" }}
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="w-11 h-11 rounded-full border-2 border-teal-500/40 flex items-center justify-center shrink-0 text-teal-400 group-hover:border-teal-400 group-hover:bg-teal-500/10 transition-colors">
                      <Icon size={20} strokeWidth={1.7} />
                    </div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider leading-snug">
                      {m.label}
                    </h3>
                  </div>

                  <div className="w-full h-[1.5px] bg-teal-500/30 rounded mb-3" />

                  <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </SourcingShell>
  );
}

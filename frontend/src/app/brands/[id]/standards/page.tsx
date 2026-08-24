"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { BrandNavTabs } from "@/components/brand/BrandNavTabs";
import { brands } from "@/lib/mock-data";
import { INITIAL_BRAND_STANDARDS } from "@/lib/brand/brand-subpages-data";

export default function BrandStandardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = React.use(params);
  const brand = brands.find((b) => b.id === brandId) || brands[0];
  const standards = INITIAL_BRAND_STANDARDS[brandId] || INITIAL_BRAND_STANDARDS["1"];
  const [activeTab, setActiveTab] = useState<"fabric" | "garment" | "colorFastness">("fabric");

  function handlePrintStandards() {
    window.print();
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
          <span className="font-medium text-teal-400">Testing Standards</span>
        </>
      }
    >
      <BrandNavTabs brandId={brandId} />

      <div className="space-y-6">
        {/* Header with Export */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Quality &amp; Testing Specifications
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Standard laboratory testing parameters, ISO/ASTM test methods &amp; acceptance criteria for {brand?.name}
            </p>
          </div>

          <button
            onClick={handlePrintStandards}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
          >
            <Printer size={15} /> Print / Export Spec Sheet
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-800 space-x-2">
          <button
            onClick={() => setActiveTab("fabric")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === "fabric"
                ? "border-teal-400 text-teal-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            1. Fabric Physical &amp; Dimensional Tests ({standards.fabricTests.length})
          </button>
          <button
            onClick={() => setActiveTab("garment")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === "garment"
                ? "border-teal-400 text-teal-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            2. Garment Construction &amp; Chemical Safety ({standards.garmentTests.length})
          </button>
          <button
            onClick={() => setActiveTab("colorFastness")}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 ${
              activeTab === "colorFastness"
                ? "border-teal-400 text-teal-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            3. Color Fastness Matrix ({standards.colorFastness.length})
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/90 shadow-xl">
          {activeTab === "fabric" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-black/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4">Test Parameter</th>
                    <th className="py-3.5 px-4">Official Test Method</th>
                    <th className="py-3.5 px-4">Acceptance Requirement</th>
                    <th className="py-3.5 px-4 text-center">Permissible Tolerance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {standards.fabricTests.map((t, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">{t.parameter}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-teal-300">{t.testMethod}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-200">{t.requirement}</td>
                      <td className="py-3.5 px-4 text-xs font-mono text-center text-amber-300">
                        {t.tolerance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "garment" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-black/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4">Test Parameter</th>
                    <th className="py-3.5 px-4">Test Method</th>
                    <th className="py-3.5 px-4">Requirement &amp; Regulatory Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {standards.garmentTests.map((t, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">{t.parameter}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-teal-300">{t.testMethod}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-200">{t.requirement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "colorFastness" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-black/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4">Fastness Type</th>
                    <th className="py-3.5 px-4 text-center">Dry Staining / Change</th>
                    <th className="py-3.5 px-4 text-center">Wet Staining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {standards.colorFastness.map((t, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4 font-semibold text-white">{t.type}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-center text-emerald-300">
                        {t.dryGrading}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-center text-emerald-300">
                        {t.wetGrading}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SourcingShell>
  );
}

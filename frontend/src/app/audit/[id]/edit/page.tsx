"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ChevronRight, Save, X } from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";

export default function EditAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: auditId } = React.use(params);
  const router = useRouter();

  const [factoryName, setFactoryName] = useState("Apex Apparels Ltd (Main Unit #1)");
  const [leadAuditor, setLeadAuditor] = useState("S. Murugan (IRCA Lead Auditor)");
  const [auditDate, setAuditDate] = useState("2026-08-15");
  const [validUntil, setValidUntil] = useState("2027-08-14");
  const [overallScore, setOverallScore] = useState(89.4);
  const [findingsNote, setFindingsNote] = useState(
    "All major non-compliances resolved. Emergency exit lighting rectified during on-site visit."
  );

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/audit/${auditId}`);
  }

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
          <Link href={`/audit/${auditId}`} className="transition-colors hover:text-teal-400">
            {auditId}
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">Edit Audit</span>
        </>
      }
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Edit Audit Record</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Update assessment metrics, validity dates &amp; corrective actions for audit {auditId}
          </p>
        </div>

        <form onSubmit={handleSave} className="rounded-2xl border border-gray-800 bg-gray-900/90 p-6 shadow-xl space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                Factory Unit Name *
              </label>
              <input
                type="text"
                value={factoryName}
                onChange={(e) => setFactoryName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-teal-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                  Lead Auditor *
                </label>
                <input
                  type="text"
                  value={leadAuditor}
                  onChange={(e) => setLeadAuditor(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                  Overall Score (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={overallScore}
                  onChange={(e) => setOverallScore(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                  Audit Date
                </label>
                <input
                  type="date"
                  value={auditDate}
                  onChange={(e) => setAuditDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                  Validity Expiry
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 font-mono text-sm text-white outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                Audit Summary &amp; Corrective Action Progress
              </label>
              <textarea
                value={findingsNote}
                onChange={(e) => setFindingsNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <Link
              href={`/audit/${auditId}`}
              className="rounded-xl border border-gray-700 bg-gray-800/80 px-5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-teal-400 transition shadow-lg"
            >
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </SourcingShell>
  );
}

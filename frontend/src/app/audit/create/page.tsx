"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Factory,
  Save,
  Shield,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";

export default function CreateAuditPage() {
  const router = useRouter();

  const [auditType, setAuditType] = useState<"social-compliance" | "technical-audit" | "certification">(
    "social-compliance"
  );
  const [factoryName, setFactoryName] = useState("");
  const [factoryLocation, setFactoryLocation] = useState("");
  const [auditorName, setAuditorName] = useState("");
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [scope, setScope] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (auditType === "social-compliance") {
      router.push("/audit/social-compliance");
    } else if (auditType === "technical-audit") {
      router.push("/audit/technical-audit");
    } else {
      router.push("/audit/certifications");
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
          <Link href="/audit" className="transition-colors hover:text-teal-400">
            Audit Suite
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">New Factory Audit</span>
        </>
      }
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Initiate New Factory Audit</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Create assessment scope, assign lead auditor &amp; schedule verification visit
          </p>
        </div>

        <form onSubmit={handleCreate} className="rounded-2xl border border-gray-800 bg-gray-900/90 p-6 shadow-xl space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                Audit Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setAuditType("social-compliance")}
                  className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition ${
                    auditType === "social-compliance"
                      ? "border-teal-400 bg-teal-500/10 text-teal-300"
                      : "border-gray-800 bg-black/40 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <div className="text-white font-bold text-sm">Social Compliance</div>
                  <div className="text-[11px] text-gray-500 mt-1">11 BSCI / SMETA Areas</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditType("technical-audit")}
                  className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition ${
                    auditType === "technical-audit"
                      ? "border-teal-400 bg-teal-500/10 text-teal-300"
                      : "border-gray-800 bg-black/40 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <div className="text-white font-bold text-sm">Technical Audit</div>
                  <div className="text-[11px] text-gray-500 mt-1">QMS &amp; Machinery Audit</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditType("certification")}
                  className={`rounded-xl border p-3.5 text-left text-xs font-semibold transition ${
                    auditType === "certification"
                      ? "border-teal-400 bg-teal-500/10 text-teal-300"
                      : "border-gray-800 bg-black/40 text-gray-400 hover:border-gray-700"
                  }`}
                >
                  <div className="text-white font-bold text-sm">Certifications</div>
                  <div className="text-[11px] text-gray-500 mt-1">GOTS, OEKO-TEX, SEDEX</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                  Factory Name *
                </label>
                <input
                  type="text"
                  value={factoryName}
                  onChange={(e) => setFactoryName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                  Factory Location
                </label>
                <input
                  type="text"
                  value={factoryLocation}
                  onChange={(e) => setFactoryLocation(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                  Lead Auditor *
                </label>
                <input
                  type="text"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
                />
              </div>

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
                  Valid Until
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
                Audit Scope &amp; Special Directives
              </label>
              <textarea
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <Link
              href="/audit"
              className="rounded-xl border border-gray-700 bg-gray-800/80 px-5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-teal-400 transition shadow-lg"
            >
              <Save size={15} /> Start Assessment
            </button>
          </div>
        </form>
      </div>
    </SourcingShell>
  );
}

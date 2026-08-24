"use client";

import Link from "next/link";
import React from "react";
import { ChevronRight, FileText, Upload } from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { INITIAL_PATTERN_FILES } from "@/lib/model/model-subpages-data";

export default function PatternPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: modelId } = React.use(params);
  const patterns = INITIAL_PATTERN_FILES;

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/models" className="transition-colors hover:text-teal-400">Models</Link>
          <ChevronRight size={14} />
          <Link href={`/models/${modelId}`} className="transition-colors hover:text-teal-400">{modelId}</Link>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">Pattern Files</span>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Pattern Files &amp; Grading</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Base patterns, graded nests, marker layouts &amp; pattern amendments
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400 transition">
            <Upload size={16} /> Upload Pattern File
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/90 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">File Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Uploaded By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Marker Efficiency</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {patterns.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-800/30 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-teal-300 font-bold flex items-center gap-2">
                      <FileText size={14} className="text-gray-500" /> {p.fileName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-400 border border-teal-500/20">{p.fileType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-400">{p.version}</td>
                    <td className="py-3.5 px-4 text-xs text-gray-300">{p.uploadedBy}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-400">{p.uploadDate}</td>
                    <td className="py-3.5 px-4 text-center">
                      {p.markerEfficiency ? (
                        <span className="font-mono font-bold text-emerald-300">{p.markerEfficiency}%</span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-semibold ${
                        p.status === "Approved" ? "bg-emerald-500/20 text-emerald-300" :
                        p.status === "Draft" ? "bg-amber-500/20 text-amber-300" :
                        "bg-gray-800 text-gray-400"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500 space-y-1">
            {patterns.filter((p) => p.remarks).map((p) => (
              <div key={p.id}><span className="font-mono text-teal-400">{p.fileName}:</span> {p.remarks}</div>
            ))}
          </div>
        </div>
      </div>
    </SourcingShell>
  );
}

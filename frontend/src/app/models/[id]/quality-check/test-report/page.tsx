"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldCheck,
  TestTube,
  XCircle,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi } from "@/lib/api/models-api";
import type { LabTestReport } from "@/lib/model/quality-check-data";

const emptyReport = (modelId: string): LabTestReport => ({
  id: `test-report-${modelId}`,
  modelId,
  labName: "",
  reportNumber: "",
  testDate: "",
  sampleDescription: "",
  tests: [],
  overallResult: "Pass",
});

const emptyTest = () => ({
  id: `test-param-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  parameter: "",
  method: "",
  requirement: "",
  result: "",
  pass: true,
});

export default function LabTestReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);
  const [reports, setReports] = useState<LabTestReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LabTestReport | null>(null);
  const [draft, setDraft] = useState<LabTestReport>(() => emptyReport(modelId));
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  React.useEffect(() => {
    ModelsApi.getQcInspections(modelId, "test-report").then((records) => {
      const loaded = records.flatMap((record: any) => {
        try {
          const parsed = JSON.parse(record.remarks || "{}");
          if (!parsed.id) return [];
          return [{
            ...parsed,
            tests: Array.isArray(parsed.tests)
              ? parsed.tests.map((test: any, idx: number) => ({
                  id: test.id || `test-param-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  parameter: test.parameter || "",
                  method: test.method || "",
                  requirement: test.requirement || "",
                  result: test.result || "",
                  pass: Boolean(test.pass !== false),
                }))
              : [],
          } as LabTestReport];
        } catch {
          return [];
        }
      });
      setReports(loaded);
      if (loaded[0]) setSelectedReport(loaded[0]);
    }).catch(() => setSaveMessage("Unable to load laboratory reports."));
  }, [modelId]);

  function updateDraft(field: keyof LabTestReport, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function updateTest(testId: string, field: keyof LabTestReport["tests"][number], value: string | boolean) {
    setDraft((current) => ({
      ...current,
      tests: current.tests.map((test) => test.id === testId ? { ...test, [field]: value } : test),
    }));
  }

  async function saveReport() {
    try {
      const report = { ...draft, id: `test-report-${modelId}` };
      await ModelsApi.saveQcInspection({
        id: report.id,
        modelId,
        inspectionType: "test-report",
        inspectionDate: report.testDate || new Date().toISOString(),
        result: report.overallResult,
        remarks: JSON.stringify(report),
      });
      setReports([report]);
      setSelectedReport(report);
      setDraft(report);
      setIsEditing(false);
      setSaveMessage("Laboratory report saved.");
    } catch (error: any) {
      setSaveMessage(error?.message || "Failed to save laboratory report.");
    }
  }

  async function deleteReport() {
    try {
      await ModelsApi.deleteQcInspection(modelId, draft.id);
      setReports([]);
      setSelectedReport(null);
      setDraft(emptyReport(modelId));
      setIsEditing(false);
      setSaveMessage("Laboratory report deleted.");
    } catch (error: any) {
      setSaveMessage(error?.message || "Failed to delete laboratory report.");
    }
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/models" className="transition-colors hover:text-teal-400">
            Models
          </Link>
          <ChevronRight size={14} />
          <Link href={`/models/${modelId}`} className="transition-colors hover:text-teal-400">
            {modelId}
          </Link>
          <ChevronRight size={14} />
          <Link href={`/models/${modelId}/quality-check`} className="transition-colors hover:text-teal-400">
            Quality Check
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">Lab Test Reports</span>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Third-Party Laboratory Test Reports
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Accredited laboratory certificates (SGS, Bureau Veritas, Intertek) for chemical &amp; physical testing
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
          >
            <Printer size={15} /> Print Certificate
          </button>
        </div>

        {saveMessage && <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs text-teal-200">{saveMessage}</div>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => { setDraft(selectedReport || emptyReport(modelId)); setIsEditing(true); }} className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-black">
            {selectedReport ? "UPDATE REPORT" : "ADD REPORT"}
          </button>
          {selectedReport && <button type="button" onClick={deleteReport} className="rounded-lg bg-red-500/80 px-4 py-2 text-xs font-bold text-white">DELETE REPORT</button>}
        </div>

        {isEditing && (
          <div className="space-y-4 rounded-2xl border border-teal-500/40 bg-[#0d1414] p-6">
            <h2 className="text-lg font-bold text-white">Laboratory Test Report</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {(["labName", "reportNumber", "testDate", "sampleDescription"] as const).map((field) => (
                <input key={field} type={field === "testDate" ? "date" : "text"} value={draft[field]} placeholder={field} onChange={(e) => updateDraft(field, e.target.value)} className="rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs text-white outline-none focus:border-teal-400" />
              ))}
              <select value={draft.overallResult} onChange={(e) => updateDraft("overallResult", e.target.value)} className="rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs text-white">
                <option value="Pass">Pass</option><option value="Fail">Fail</option><option value="Conditional">Conditional</option>
              </select>
            </div>
            <div className="space-y-2">
              {draft.tests.map((test) => (
                <div key={test.id} className="grid grid-cols-1 gap-2 md:grid-cols-[1.2fr_1fr_1.2fr_1fr_90px]">
                  {(["parameter", "method", "requirement", "result"] as const).map((field) => (
                    <input
                      key={`${test.id}-${field}`}
                      value={test[field] ?? ""}
                      placeholder={field}
                      onChange={(e) => updateTest(test.id || "", field, e.target.value)}
                      className="rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs text-white outline-none focus:border-teal-400"
                    />
                  ))}
                  <select value={test.pass ? "Pass" : "Fail"} onChange={(e) => updateTest(test.id || "", "pass", e.target.value === "Pass")} className="rounded-lg border border-gray-800 bg-black px-3 py-2 text-xs text-white"><option>Pass</option><option>Fail</option></select>
                </div>
              ))}
              <button type="button" onClick={() => setDraft((current) => ({ ...current, tests: [...current.tests, emptyTest()] }))} className="rounded-lg border border-teal-500/40 px-3 py-2 text-xs font-bold text-teal-300">ADD PARAMETER</button>
            </div>
            <div className="flex gap-2"><button type="button" onClick={saveReport} className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-black">SAVE</button><button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs text-gray-300">Cancel</button></div>
          </div>
        )}

        {/* Reports Selection Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {reports.map((rep) => {
            const isSelected = selectedReport?.id === rep.id;
            return (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                  isSelected
                    ? "border-teal-400 bg-teal-500/10 shadow-lg"
                    : "border-gray-800 bg-gray-900/80 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-teal-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-teal-300 border border-teal-500/20">
                    {rep.reportNumber}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      rep.overallResult === "Pass"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {rep.overallResult}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-2">{rep.labName}</h3>
                <p className="text-xs text-gray-400 mt-1">{rep.sampleDescription}</p>

                <div className="text-[11px] text-gray-500 mt-3 pt-2 border-t border-gray-800 flex items-center justify-between">
                  <span>Tested on: <strong className="text-gray-300 font-mono">{rep.testDate}</strong></span>
                  <span>{rep.tests.length} Parameters Evaluated</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Test Details Table */}
        {selectedReport && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/90 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {selectedReport.labName} — {selectedReport.reportNumber}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sample: {selectedReport.sampleDescription} • Date: {selectedReport.testDate}
                </p>
              </div>

              <span
                className={`rounded-full px-4 py-1 text-xs font-bold ${
                  selectedReport.overallResult === "Pass"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                Overall Result: {selectedReport.overallResult}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-800 bg-black/40">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-black/80 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Test Parameter</th>
                    <th className="py-3 px-4">Standard Method</th>
                    <th className="py-3 px-4">Acceptance Requirement</th>
                    <th className="py-3 px-4">Laboratory Result</th>
                    <th className="py-3 px-4 text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {selectedReport.tests.map((t, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white text-xs">{t.parameter}</td>
                      <td className="py-3 px-4 font-mono text-xs text-teal-300">{t.method}</td>
                      <td className="py-3 px-4 text-xs text-gray-400">{t.requirement}</td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-gray-200">
                        {t.result}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {t.pass ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <CheckCircle2 size={13} /> Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
                            <XCircle size={13} /> Fail
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

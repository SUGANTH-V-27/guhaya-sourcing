"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import {
  deleteSocialAudit,
  loadSocialAudits,
  saveOrUpdateSocialAudit,
  buildDefaultSectionScores,
  calcComplianceGrade,
  type SocialComplianceAudit,
  type SectionScore,
} from "@/lib/audit/social-compliance-data";
import { db } from "@/lib/db/db-client";

// Grade color helpers
function gradeColor(grade: string) {
  if (grade === "A") return "bg-emerald-500 text-white";
  if (grade === "B") return "bg-green-600 text-white";
  if (grade === "C") return "bg-amber-500 text-white";
  if (grade === "Orange") return "bg-orange-500 text-white";
  if (grade === "Red") return "bg-red-500 text-white";
  return "bg-gray-700 text-gray-200";
}

const DEFAULT_AUDITS: SocialComplianceAudit[] = [];

export function SocialCompliancePage() {
  const [audits, setAudits] = useState<SocialComplianceAudit[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form fields
  const [formBrand, setFormBrand] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formFactory, setFormFactory] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formAuditor, setFormAuditor] = useState("");
  const [formScore, setFormScore] = useState("");
  const [formGrade, setFormGrade] = useState("");
  const [formCritical, setFormCritical] = useState("");
  const [formTotal, setFormTotal] = useState("");

  useEffect(() => {
    async function fetchAudits() {
      try {
        const data = await db.socialComplianceAudits.getAll();
        setAudits(data);
      } catch {
        setAudits(loadSocialAudits());
      }
    }
    fetchAudits();
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function openCreate() {
    setEditingId(null);
    setFormBrand("Sinsay");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormFactory("");
    setFormAddress("");
    setFormAuditor("Lead Quality Auditor");
    setFormScore("90");
    setFormGrade("A");
    setFormCritical("0");
    setFormTotal("17");
    setShowModal(true);
  }

  function openEdit(a: SocialComplianceAudit) {
    setEditingId(a.id);
    setFormBrand(a.brand || "Sinsay");
    setFormDate(a.auditDate || "");
    setFormFactory(a.factoryName || "");
    setFormAddress(a.address || "");
    setFormAuditor(a.auditorName || "");
    setFormScore(String(a.overallScorePercent ?? "90"));
    setFormGrade(a.grade || "A");
    setFormCritical(String(a.capFindings?.filter((f) => f.severity === "Critical").length ?? 0));
    setFormTotal("17");
    setShowModal(true);
  }

  function handleSave() {
    const critical = Number(formCritical) || 0;
    const total = Number(formTotal) || 17;
    const findings: any[] = Array.from({ length: critical }, (_, i) => ({
      id: `f-${i}-${Date.now()}`,
      category: "Critical",
      description: `Critical finding ${i + 1}`,
      severity: "Critical",
      status: "Open",
    }));

    const audit: SocialComplianceAudit = {
      id: editingId || `sa-${Date.now()}`,
      brand: formBrand,
      auditDate: formDate,
      factoryName: formFactory,
      address: formAddress,
      auditorName: formAuditor,
      auditType: "Periodic Audit",
      grade: formGrade as any,
      overallScorePercent: parseFloat(formScore) || 0,
      sectionScores: buildDefaultSectionScores(),
      capFindings: findings,
      remarks: "",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      contact: "",
      email: "",
    };

    saveOrUpdateSocialAudit(audit);

    if (editingId) {
      setAudits((prev) => prev.map((a) => (a.id === editingId ? audit : a)));
    } else {
      setAudits((prev) => [audit, ...prev]);
    }
    setShowModal(false);
    showToast(editingId ? "Audit updated" : "Audit created");
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this audit?")) return;
    deleteSocialAudit(id);
    setAudits((prev) => prev.filter((a) => a.id !== id));
    showToast("Audit deleted");
  }

  return (
    <SourcingShell>
      <div className="max-w-5xl mx-auto space-y-5 pb-16 text-gray-200">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-teal-500 px-4 py-2.5 text-xs font-bold text-black shadow-xl">
            {toastMsg}
          </div>
        )}

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Social Compliance Audit</h1>
          <p className="text-xs text-gray-400">Manage social compliance audits</p>
        </div>

        {/* New Audit Button */}
        <div className="flex justify-end">
          <Link
            href="/audit/social-compliance/create"
            className="inline-flex items-center gap-1 rounded-lg bg-[#00BFA5] px-4 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
          >
            <Plus size={14} /> New Audit
          </Link>
        </div>

        {/* Audit Cards List */}
        <div className="space-y-3">
          {audits.map((a) => {
            const criticalCount = a.capFindings?.filter((f) => f.severity === "Critical").length ?? 0;
            const totalFindings = 17;

            return (
              <div
                key={a.id}
                className="rounded-2xl border border-gray-800 bg-[#0d1414] px-6 py-4 shadow-lg hover:border-gray-700 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Row 1: brand | date | grade badge | score */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-white">{a.brand || "Sinsay"}</span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar size={11} />
                        <span className="font-mono">{a.auditDate}</span>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${gradeColor(a.grade)}`}>
                        {a.grade}
                      </span>
                      <span className="text-gray-300 font-semibold">
                        {String.fromCharCode(65 + (["A","B","C","D","E"].indexOf(a.grade) >= 0 ? ["A","B","C","D","E"].indexOf(a.grade) : 0))} – {a.overallScorePercent}%
                      </span>
                    </div>

                    {/* Row 2: factory | address */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                      <div className="flex items-center gap-1">
                        <Building2 size={11} />
                        <span>{a.factoryName}</span>
                      </div>
                      {a.address && (
                        <div className="flex items-center gap-1">
                          <MapPin size={11} />
                          <span className="truncate max-w-xs">{a.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Row 3: Critical count badge */}
                    <div>
                      <span className="inline-flex items-center rounded-md border border-gray-700 bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
                        Critical: {criticalCount}/{totalFindings}
                      </span>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => openEdit(a)}
                      className="p-1.5 text-gray-400 hover:text-teal-400 transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {audits.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-800 bg-[#0d1414] p-12 text-center text-gray-500 text-xs">
              No audits yet. Click <span className="text-teal-400 font-bold">+ New Audit</span> to add one.
            </div>
          )}
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#0d1414] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-6 py-4">
              <h2 className="text-base font-bold text-white">
                {editingId ? "Edit Audit" : "New Social Compliance Audit"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Brand</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Audit Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Factory Name</label>
                <input
                  type="text"
                  value={formFactory}
                  placeholder="e.g. KRK Creations"
                  onChange={(e) => setFormFactory(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Address</label>
                <input
                  type="text"
                  value={formAddress}
                  placeholder="Factory address"
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Overall Score (%)</label>
                  <input
                    type="number"
                    value={formScore}
                    onChange={(e) => setFormScore(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 font-mono text-white outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Grade</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  >
                    {["A", "B", "C", "Orange", "Red"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Critical Findings</label>
                  <input
                    type="number"
                    value={formCritical}
                    onChange={(e) => setFormCritical(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 font-mono text-white outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Total Criteria</label>
                  <input
                    type="number"
                    value={formTotal}
                    onChange={(e) => setFormTotal(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 font-mono text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-[#00BFA5] px-6 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
                >
                  {editingId ? "Update Audit" : "Create Audit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SourcingShell>
  );
}

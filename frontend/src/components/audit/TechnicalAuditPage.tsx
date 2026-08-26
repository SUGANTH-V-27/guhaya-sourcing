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
  deleteTechnicalAudit,
  loadTechnicalAudits,
  saveOrUpdateTechnicalAudit,
  DEFAULT_TECHNICAL_MODULES,
  type TechnicalAudit,
} from "@/lib/audit/technical-audit-data";

const DEFAULT_AUDITS: TechnicalAudit[] = [
  {
    id: "ta-1",
    factoryName: "Shri Subam Tex",
    brand: "Sinsay",
    auditDate: "2026-04-17",
    auditorName: "Senior QA Auditor",
    location: "S.F No540/2, Opp. Anbu Illam, Ring Road, Thirumurugan Poondi, Tirupur – 641 652",
    contact: "",
    workforce: 350,
    capacity: 15000,
    categories: "Knitted T-Shirts, Polos, Hoodies",
    modules: DEFAULT_TECHNICAL_MODULES,
    findings: [],
    conclusion: "",
    grade: "Good",
    overallScorePercent: 85,
    available: 40,
    missing: 23,
    total: 64,
    createdAt: "2026-04-17",
    updatedAt: "2026-04-17",
  },
];

export function TechnicalAuditPage() {
  const [audits, setAudits] = useState<TechnicalAudit[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form
  const [formFactory, setFormFactory] = useState("");
  const [formBrand, setFormBrand] = useState("Sinsay");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formLocation, setFormLocation] = useState("");
  const [formAuditor, setFormAuditor] = useState("Senior QA Auditor");
  const [formAvailable, setFormAvailable] = useState("40");
  const [formMissing, setFormMissing] = useState("0");
  const [formTotal, setFormTotal] = useState("64");

  useEffect(() => {
    const loaded = loadTechnicalAudits();
    setAudits(loaded.length > 0 ? loaded : DEFAULT_AUDITS);
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function openCreate() {
    setEditingId(null);
    setFormFactory("");
    setFormBrand("Sinsay");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormLocation("");
    setFormAuditor("Senior QA Auditor");
    setFormAvailable("40");
    setFormMissing("0");
    setFormTotal("64");
    setShowModal(true);
  }

  function openEdit(a: TechnicalAudit) {
    setEditingId(a.id);
    setFormFactory(a.factoryName || "");
    setFormBrand(a.brand || "Sinsay");
    setFormDate(a.auditDate || "");
    setFormLocation(a.location || "");
    setFormAuditor(a.auditorName || "");
    setFormAvailable(String((a as any).available ?? 40));
    setFormMissing(String((a as any).missing ?? 0));
    setFormTotal(String((a as any).total ?? 64));
    setShowModal(true);
  }

  function handleSave() {
    const audit: TechnicalAudit = {
      id: editingId || `ta-${Date.now()}`,
      factoryName: formFactory,
      brand: formBrand,
      auditDate: formDate,
      auditorName: formAuditor,
      location: formLocation,
      contact: "",
      workforce: 350,
      capacity: 15000,
      categories: "",
      status: "Approved",
      modules: DEFAULT_TECHNICAL_MODULES,
      findings: [],
      conclusion: "",
      grade: "Good",
      overallScorePercent: 85,
      available: Number(formAvailable) || 0,
      missing: Number(formMissing) || 0,
      total: Number(formTotal) || 64,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    } as TechnicalAudit;

    saveOrUpdateTechnicalAudit(audit);

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
    deleteTechnicalAudit(id);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Technical Audit</h1>
          <p className="text-xs text-gray-400">Quality management &amp; technical audit checklist</p>
        </div>

        {/* New Audit Button */}
        <div className="flex justify-end">
          <Link
            href="/audit/technical-audit/create"
            className="inline-flex items-center gap-1 rounded-lg bg-[#00BFA5] px-4 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
          >
            <Plus size={14} /> New Audit
          </Link>
        </div>

        {/* Audit Cards */}
        <div className="space-y-3">
          {audits.map((a) => {
            const available = (a as any).available ?? 40;
            const missing = (a as any).missing ?? 0;
            const total = (a as any).total ?? 64;

            return (
              <div
                key={a.id}
                className="rounded-2xl border border-gray-800 bg-[#0d1414] px-6 py-4 shadow-lg hover:border-gray-700 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Row 1: Factory Name + Brand pill */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">{a.factoryName}</span>
                      {a.brand && (
                        <span className="rounded-md border border-gray-700 bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-gray-300">
                          {a.brand}
                        </span>
                      )}
                    </div>

                    {/* Row 2: date + address */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span className="font-mono">
                          {new Date(a.auditDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {a.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={11} />
                          <span className="truncate max-w-md">{a.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Row 3: available / missing / total */}
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-gray-300">
                        <span className="font-bold text-white">{available}</span> available
                      </span>
                      <span className="text-red-400">
                        <span className="font-bold">{missing}</span> missing
                      </span>
                      <span className="text-gray-400">
                        <span className="font-bold text-gray-300">{total}</span> total items
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
              No technical audits yet. Click <span className="text-teal-400 font-bold">+ New Audit</span> to add one.
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
                {editingId ? "Edit Technical Audit" : "New Technical Audit"}
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
                  <label className="text-gray-400 font-semibold block mb-1">Factory Name</label>
                  <input
                    type="text"
                    value={formFactory}
                    placeholder="e.g. Shri Subam Tex"
                    onChange={(e) => setFormFactory(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Brand</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Audit Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Auditor</label>
                  <input
                    type="text"
                    value={formAuditor}
                    onChange={(e) => setFormAuditor(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Location / Address</label>
                <input
                  type="text"
                  value={formLocation}
                  placeholder="Factory full address"
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Available Items</label>
                  <input
                    type="number"
                    value={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 font-mono text-white outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Missing Items</label>
                  <input
                    type="number"
                    value={formMissing}
                    onChange={(e) => setFormMissing(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 font-mono text-red-400 outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Total Items</label>
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

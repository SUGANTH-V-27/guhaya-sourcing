"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import {
  addCertification,
  CERTIFICATION_BODIES,
  deleteCertification,
  getExpiryStatus,
  loadCertifications,
  STANDARD_CERTIFICATION_TYPES,
  updateCertification,
  type CertificationRecord,
} from "@/lib/audit/certifications-data";
import { getFactoryList } from "@/lib/finance/factory-ledger-data";

const DEFAULT_CERTS: CertificationRecord[] = [
  {
    id: "cert-1",
    factoryName: "KRK Creationss",
    certificationType: "SEDEX",
    certificateNumber: "ZAA600153074",
    issuingBody: "SEDEX",
    issueDate: "2025-08-28",
    expiryDate: "2026-08-28",
    scope: "Garment Manufacturing",
    auditGrade: "Approved",
    notes: "-",
    pdfUrl: "KRK SEDEX SMETA_ZAA600153074.pdf",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function daysLeftBadge(expiryDate: string) {
  const exp = new Date(expiryDate);
  const now = new Date();
  const diff = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[11px] font-bold text-red-400">Expired</span>;
  }
  if (diff <= 30) {
    return <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 text-[11px] font-bold text-red-400">{diff}d left</span>;
  }
  if (diff <= 90) {
    return <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">{diff}d left</span>;
  }
  return <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">Valid</span>;
}

function formatDate(d: string) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function CertificationsPage() {
  const [certifications, setCertifications] = useState<CertificationRecord[]>([]);
  const [factoryFilter, setFactoryFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationRecord | null>(null);

  const factoryList = useMemo(() => getFactoryList(), []);

  // Form fields
  const [formFactory, setFormFactory] = useState("");
  const [formType, setFormType] = useState(STANDARD_CERTIFICATION_TYPES[0]);
  const [formCertNo, setFormCertNo] = useState("");
  const [formBody, setFormBody] = useState(CERTIFICATION_BODIES[0]);
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [formExpiryDate, setFormExpiryDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formNotes, setFormNotes] = useState("");
  const [formPdfName, setFormPdfName] = useState("");

  useEffect(() => {
    const loaded = loadCertifications();
    setCertifications(loaded.length > 0 ? loaded : DEFAULT_CERTS);
  }, []);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  const factoryOptions = useMemo(() => {
    return [...new Set(certifications.map((c) => c.factoryName).filter(Boolean))].sort();
  }, [certifications]);

  const filtered = useMemo(() => {
    if (factoryFilter === "all") return certifications;
    return certifications.filter((c) => c.factoryName === factoryFilter);
  }, [certifications, factoryFilter]);

  function openCreate() {
    setEditingCert(null);
    setFormFactory(factoryList[0] || "");
    setFormType(STANDARD_CERTIFICATION_TYPES[0]);
    setFormCertNo("");
    setFormBody(CERTIFICATION_BODIES[0]);
    setFormIssueDate(new Date().toISOString().split("T")[0]);
    setFormExpiryDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
    setFormNotes("");
    setFormPdfName("");
    setIsModalOpen(true);
  }

  function openEdit(cert: CertificationRecord) {
    setEditingCert(cert);
    setFormFactory(cert.factoryName);
    setFormType(cert.certificationType);
    setFormCertNo(cert.certificateNumber);
    setFormBody(cert.issuingBody);
    setFormIssueDate(cert.issueDate);
    setFormExpiryDate(cert.expiryDate);
    setFormNotes(cert.notes || "");
    setFormPdfName(cert.pdfUrl || "");
    setIsModalOpen(true);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this certificate?")) return;
    deleteCertification(id);
    setCertifications((prev) => prev.filter((c) => c.id !== id));
    showToast("Certificate deleted");
  }

  function handleSave() {
    if (!formFactory.trim()) { showToast("Select a factory"); return; }

    if (editingCert) {
      updateCertification(editingCert.id, {
        factoryName: formFactory,
        certificationType: formType,
        certificateNumber: formCertNo,
        issuingBody: formBody,
        issueDate: formIssueDate,
        expiryDate: formExpiryDate,
        scope: "Garment Manufacturing",
        notes: formNotes,
        pdfUrl: formPdfName,
      } as any);
      setCertifications(loadCertifications());
      showToast("Certificate updated");
    } else {
      addCertification({
        factoryName: formFactory,
        certificationType: formType,
        certificateNumber: formCertNo,
        issuingBody: formBody,
        issueDate: formIssueDate,
        expiryDate: formExpiryDate,
        scope: "Garment Manufacturing",
        notes: formNotes,
        pdfUrl: formPdfName,
      } as any);
      setCertifications(loadCertifications());
      showToast("Certificate added");
    }
    setIsModalOpen(false);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Certifications &amp; Expiry</h1>
          <p className="text-xs text-gray-400">Manage certifications and track expiry dates</p>
        </div>

        {/* Filters + Add button row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Factory filter dropdown */}
          <div className="relative">
            <select
              value={factoryFilter}
              onChange={(e) => setFactoryFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-800 bg-[#0d1414] pl-3.5 pr-8 py-2 text-xs text-white outline-none focus:border-teal-400 shadow"
            >
              <option value="all">All Factories</option>
              {factoryOptions.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <Link
            href="/audit/certifications/create"
            className="inline-flex items-center gap-1 rounded-lg bg-[#00BFA5] px-4 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
          >
            <Plus size={14} /> Add Certification
          </Link>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-black/60 text-[11px] font-bold text-gray-400">
                  <th className="py-3 px-5 min-w-[150px]">Factory</th>
                  <th className="py-3 px-4 min-w-[130px]">Certificate Name</th>
                  <th className="py-3 px-4 min-w-[220px]">PDF</th>
                  <th className="py-3 px-4 text-center min-w-[110px]">Issue Date</th>
                  <th className="py-3 px-4 text-center min-w-[110px]">Expiry Date</th>
                  <th className="py-3 px-4 text-center min-w-[90px]">Status</th>
                  <th className="py-3 px-4 text-center min-w-[80px]">Remarks</th>
                  <th className="py-3 px-4 text-right min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-sans">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-800/20 transition">
                    <td className="py-3 px-5 font-bold text-white">{c.factoryName}</td>
                    <td className="py-3 px-4 font-semibold text-gray-200">{c.certificationType}</td>
                    <td className="py-3 px-4">
                      {c.pdfUrl ? (
                        <a
                          href={c.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 text-[11px] font-medium"
                        >
                          <ExternalLink size={11} />
                          <span className="truncate max-w-[180px]">{c.pdfUrl}</span>
                        </a>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-gray-400 text-[11px]">
                      {formatDate(c.issueDate)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-gray-400 text-[11px]">
                      {formatDate(c.expiryDate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {daysLeftBadge(c.expiryDate)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500">
                      {c.notes || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="p-1 text-gray-400 hover:text-teal-400 transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-14 text-center text-gray-500 text-xs">
              No certificates found. Click <span className="text-teal-400 font-bold">+ Add Certification</span> to add one.
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-[#0d1414] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-6 py-4">
              <h2 className="text-base font-bold text-white">
                {editingCert ? "Edit Certificate" : "Add Certification"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Factory</label>
                  <input
                    type="text"
                    value={formFactory}
                    placeholder="Factory name"
                    onChange={(e) => setFormFactory(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Certificate Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  >
                    {STANDARD_CERTIFICATION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Certificate Number</label>
                  <input
                    type="text"
                    value={formCertNo}
                    placeholder="e.g. ZAA600153074"
                    onChange={(e) => setFormCertNo(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Issuing Body</label>
                  <select
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  >
                    {CERTIFICATION_BODIES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">PDF File Name / URL</label>
                <input
                  type="text"
                  value={formPdfName}
                  placeholder="e.g. KRK SEDEX SMETA_ZAA600153074.pdf"
                  onChange={(e) => setFormPdfName(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-gray-400 font-semibold block mb-1">Remarks</label>
                <input
                  type="text"
                  value={formNotes}
                  placeholder="Optional remarks"
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-white outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-[#00BFA5] px-6 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow"
                >
                  {editingCert ? "Update" : "Add Certificate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SourcingShell>
  );
}

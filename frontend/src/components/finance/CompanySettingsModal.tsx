"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import {
  DEFAULT_COMPANY_SETTINGS,
  loadCompanySettings,
  saveCompanySettings,
  type CompanySettings,
} from "@/lib/finance/company-settings-storage";
import financeService from "@/../services/finance.service";

const inputClass =
  "w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400/60";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CompanySettingsModal({ open, onClose }: Props) {
  const [draft, setDraft] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);

  useEffect(() => {
    if (!open) return;
    setDraft(loadCompanySettings());
    financeService.getCompanySettings()
      .then((settings) => {
        if (settings) setDraft((current) => ({ ...current, ...settings }));
      })
      .catch(() => {
        // Local defaults remain available when the backend is unavailable.
      });
  }, [open]);

  if (!open) return null;

  async function handleSave() {
    if (!draft.companyName.trim() || !draft.gstin.trim()) return;
    try {
      await financeService.saveCompanySettings(draft);
      saveCompanySettings(draft);
      onClose();
    } catch {
      saveCompanySettings(draft);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-gray-700 bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Company &amp; Bank Details</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Company Name *</label>
            <input
              value={draft.companyName}
              onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Address</label>
            <textarea
              value={draft.address}
              onChange={(e) => setDraft((p) => ({ ...p, address: e.target.value }))}
              rows={3}
              placeholder="Full company address"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">GSTIN *</label>
            <input
              value={draft.gstin}
              onChange={(e) => setDraft((p) => ({ ...p, gstin: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Phone</label>
            <input
              value={draft.phone}
              onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-gray-400">State</label>
              <input
                value={draft.state}
                onChange={(e) => setDraft((p) => ({ ...p, state: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Code</label>
              <input
                value={draft.code}
                onChange={(e) => setDraft((p) => ({ ...p, code: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <h4 className="pt-2 text-sm font-semibold text-gray-300">Bank Details</h4>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Bank Name</label>
            <input
              value={draft.bankName}
              onChange={(e) => setDraft((p) => ({ ...p, bankName: e.target.value }))}
              placeholder="State Bank of India"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Account Number</label>
            <input
              value={draft.accountNumber}
              onChange={(e) => setDraft((p) => ({ ...p, accountNumber: e.target.value }))}
              placeholder="1234567890"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">IFSC Code</label>
              <input
                value={draft.ifscCode}
                onChange={(e) => setDraft((p) => ({ ...p, ifscCode: e.target.value }))}
                placeholder="SBIN0001234"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Branch</label>
              <input
                value={draft.branch}
                onChange={(e) => setDraft((p) => ({ ...p, branch: e.target.value }))}
                placeholder="Main Branch"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-700 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-outline">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="btn gap-1.5">
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

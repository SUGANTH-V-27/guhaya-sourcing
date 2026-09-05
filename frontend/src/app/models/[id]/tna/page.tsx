"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi } from "@/lib/api/models-api";

interface TNARow {
  id: string;
  activity: string;
  plannedDate: string;
  actualDate: string;
  remarks: string;
}

const DEFAULT_TNA_ACTIVITY_NAMES = [
  "PO Received Date",
  "Sales Confirmation Date",
  "TO & WCL Date",
  "Trim Layout Approval Date",
  "1st Sample Submission Date",
  "Approval Date",
  "Revised Submission Date",
  "Approval Date (Revised)",
  "Revised Submission 2 Date",
  "Approval Date (Revised 2)",
  "Sewing Trims Inhouse Date",
  "Bulk Yarn Approval Date",
  "Knitting Start Date",
  "Dyeing Start Date",
  "Rotary Print Start Date",
  "Fabric In-House Start Date",
  "Size Set Submission Date",
  "Pre-Production Meeting Date",
  "Shipment Sample Submission Date",
  "Packing Trims Inhouse Date",
  "Cutting Start Date",
  "Cutting End Date",
  "Printing / Embroidery Start Date",
  "Printing / Embroidery End Date",
  "Sewing Start Date",
  "Sewing End Date",
  "Checking Start Date",
  "Checking End Date",
  "Ironing Start Date",
  "Ironing End Date",
  "Packing Start Date",
  "Packing End Date",
  "1st Delivery Inspection Offer Date",
  "1st Hand Over Date",
  "2nd Delivery Inspection Offer Date",
  "2nd Hand Over Date",
  "3rd Delivery Inspection Offer Date",
  "3rd Hand Over Date",
];

const DEFAULT_TNA_ACTIVITIES: TNARow[] = DEFAULT_TNA_ACTIVITY_NAMES.map((activity, index) => ({
  id: `tna-default-${index + 1}`,
  activity,
  plannedDate: "",
  actualDate: "",
  remarks: "",
}));

export default function ModelTNAPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);
  const [rows, setRows] = useState<TNARow[]>(DEFAULT_TNA_ACTIVITIES);
  const [poExFactoryDate, setPoExFactoryDate] = useState("");
  const [poSailingDate, setPoSailingDate] = useState("");
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) return;
    Promise.all([ModelsApi.getPurchaseOrders(modelId), ModelsApi.getTnaPlans(modelId)])
      .then(([purchaseOrders, savedRows]) => {
        const latestOrder = purchaseOrders[0];
        let details: any = {};
        try {
          details = latestOrder?.specialInstructions ? JSON.parse(latestOrder.specialInstructions) : {};
        } catch {
          details = {};
        }
        const firstRow = Array.isArray(details.quantityRows) ? details.quantityRows[0] : null;
        const exFactoryDate = firstRow?.exFactory ? String(firstRow.exFactory).slice(0, 10) : "";
        setPoExFactoryDate(exFactoryDate);
        setPoSailingDate(firstRow?.sailing ? String(firstRow.sailing).slice(0, 10) : "");
        const normalizedRows = (savedRows as TNARow[]).map((row) => ({
          id: row.id,
          activity: row.activity || "",
          plannedDate: row.plannedDate ? String(row.plannedDate).slice(0, 10) : "",
          actualDate: row.actualDate ? String(row.actualDate).slice(0, 10) : "",
          remarks: row.remarks || "",
        }));
        setRows(normalizedRows.length ? normalizedRows : DEFAULT_TNA_ACTIVITIES);
      })
      .catch((error: any) => setSaveError(error?.message || "Failed to load T&A plan."));
  }, [modelId]);

  const sailingDueStatus = poSailingDate
    ? (() => {
        const sailing = new Date(`${poSailingDate}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = Math.floor((today.getTime() - sailing.getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 ? `ETD ${days} days overdue` : days === 0 ? "ETD is due today" : `ETD in ${Math.abs(days)} days`;
      })()
    : "ETD not set";

  function calculateStatus(planned: string, actual: string) {
    if (!planned || !actual) return null;
    const pDate = new Date(planned);
    const aDate = new Date(actual);
    if (isNaN(pDate.getTime()) || isNaN(aDate.getTime())) return null;

    const diffTime = aDate.getTime() - pDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return { status: "delayed", text: `${diffDays}d Late`, days: diffDays };
    } else if (diffDays < 0) {
      return { status: "early", text: `${Math.abs(diffDays)}d Early`, days: Math.abs(diffDays) };
    } else {
      return { status: "on_time", text: "On Time", days: 0 };
    }
  }

  function handleAddRow() {
    const newRow: TNARow = {
      id: `tna-${Date.now()}`,
      activity: "",
      plannedDate: "",
      actualDate: "",
      remarks: "",
    };
    setRows([...rows, newRow]);
  }

  async function handleDeleteRow(id: string) {
    if (rows.length <= 1) return;
    if (!id.startsWith("tna-default-")) {
      try {
        await ModelsApi.deleteTnaPlan(modelId, id);
      } catch (error: any) {
        setSaveError(error?.message || "Failed to delete T&A row.");
        return;
      }
    }
    setRows(rows.filter((r) => r.id !== id));
  }

  function handleUpdate(id: string, field: keyof TNARow, value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  async function handleSave() {
    setSaveError(null);
    try {
      await Promise.all(
        rows.map((row) =>
          ModelsApi.saveTnaPlan({
            id: row.id,
            modelId,
            poNumber: "",
            orderQty: 0,
            activity: row.activity,
            plannedDate: row.plannedDate,
            actualDate: row.actualDate,
            remarks: row.remarks,
            exFactoryDate: row.plannedDate || undefined,
            totalStages: 1,
            completedStages: row.actualDate ? 1 : 0,
            status: row.actualDate ? "Completed" : "Pending",
          })
        )
      );
      setIsSavedAlert(true);
      setTimeout(() => setIsSavedAlert(false), 3000);
    } catch (error: any) {
      setSaveError(error?.message || "Failed to save T&A plan.");
    }
  }

  return (
    <SourcingShell>
      <div className="space-y-6 text-gray-200 pb-16">

        {/* Page Title & Save Button Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
              PRODUCTION PLANNING / TNA (TIME &amp; ACTION)
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Model: <span className="font-mono text-white font-semibold">{modelId || "5906482949644"}</span>
            </p>
            <p className="mt-2 text-xs text-gray-400">
              PO Ex-Factory: <span className="font-mono text-white">{poExFactoryDate || "Not set"}</span>
              <span className="mx-2 text-gray-700">|</span>
              ETD / Sailing: <span className="font-mono text-white">{poSailingDate || "Not set"}</span>
              <span className="mx-2 text-gray-700">|</span>
              <span className="font-mono text-teal-300">{sailingDueStatus}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-5 py-2 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-lg self-start sm:self-auto"
          >
            <Save size={15} /> Save
          </button>
        </div>

        {/* Alert Notification on Save */}
        {isSavedAlert && (
          <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-xs font-semibold text-teal-300 flex items-center justify-between">
            <span>✓ Production Planning / TNA timeline saved successfully!</span>
            <button onClick={() => setIsSavedAlert(false)} className="text-teal-400 hover:text-white">
              ✕
            </button>
          </div>
        )}
        {saveError && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
            {saveError}
          </div>
        )}

        {/* Card Container with Teal Header Banner */}
        <div className="rounded-2xl border border-gray-800 bg-[#0d1414] overflow-hidden shadow-2xl">
          {/* Teal Header Banner */}
          <div className="bg-[#00BFA5] px-5 py-3 text-black">
            <h2 className="text-xs font-extrabold uppercase tracking-wider">
              PRODUCTION PLANNING / TNA (TIME &amp; ACTION)
            </h2>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-gray-800 bg-black/80 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-3 px-2 w-8 text-center"></th>
                  <th className="py-3 px-3 w-10 text-center">#</th>
                  <th className="py-3 px-4 min-w-[280px]">ITEM / ACTIVITY</th>
                  <th className="py-3 px-4 min-w-[150px]">PLAN DATE</th>
                  <th className="py-3 px-4 min-w-[150px]">ACTUAL DATE</th>
                  <th className="py-3 px-4 min-w-[120px] text-center">EARLY / DELAY</th>
                  <th className="py-3 px-4 min-w-[200px]">REMARKS</th>
                  <th className="py-3 px-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {rows.map((row, idx) => {
                  const statusInfo = calculateStatus(row.plannedDate, row.actualDate);
                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-800/20 transition group"
                    >
                      {/* Drag Handle */}
                      <td className="py-2.5 px-2 text-center text-gray-600 group-hover:text-gray-400 cursor-grab">
                        <GripVertical size={14} className="mx-auto" />
                      </td>

                      {/* Row Index */}
                      <td className="py-2.5 px-3 text-center font-mono text-xs font-semibold text-gray-400">
                        {idx + 1}
                      </td>

                      {/* Activity Name Input */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={row.activity}
                          placeholder="Activity name"
                          onChange={(e) => handleUpdate(row.id, "activity", e.target.value)}
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-xs text-white placeholder-gray-600 outline-none hover:border-gray-800 focus:border-teal-400 focus:bg-black"
                        />
                      </td>

                      {/* Plan Date Picker */}
                      <td className="py-2.5 px-4">
                        <div className="relative">
                          <input
                            type="date"
                            value={row.plannedDate}
                            onChange={(e) => handleUpdate(row.id, "plannedDate", e.target.value)}
                            className="w-full rounded border border-gray-800/80 bg-black/60 px-2.5 py-1 font-mono text-xs text-white outline-none focus:border-teal-400"
                          />
                        </div>
                      </td>

                      {/* Actual Date Picker */}
                      <td className="py-2.5 px-4">
                        <div className="relative">
                          <input
                            type="date"
                            value={row.actualDate}
                            onChange={(e) => handleUpdate(row.id, "actualDate", e.target.value)}
                            className="w-full rounded border border-gray-800/80 bg-black/60 px-2.5 py-1 font-mono text-xs text-teal-300 outline-none focus:border-teal-400"
                          />
                        </div>
                      </td>

                      {/* Early / Delay Status Badge */}
                      <td className="py-2.5 px-4 text-center">
                        {statusInfo ? (
                          <span
                            className={`inline-block rounded px-2.5 py-0.5 text-[11px] font-bold ${
                              statusInfo.status === "delayed"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : statusInfo.status === "early"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                            }`}
                          >
                            {statusInfo.text}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs font-mono">—</span>
                        )}
                      </td>

                      {/* Remarks Input */}
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={row.remarks}
                          placeholder="Remarks"
                          onChange={(e) => handleUpdate(row.id, "remarks", e.target.value)}
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-xs text-gray-300 placeholder-gray-600 outline-none hover:border-gray-800 focus:border-teal-400 focus:bg-black"
                        />
                      </td>

                      {/* Delete Action */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="text-gray-600 hover:text-red-400 transition"
                          title="Delete Row"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div className="p-4 border-t border-gray-800/80 bg-black/40">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900/90 px-4 py-2 text-xs font-bold text-gray-200 hover:border-teal-400 hover:text-white transition"
            >
              <Plus size={14} className="text-teal-400" /> Add Row
            </button>
          </div>
        </div>

        {/* Bottom Save TNA Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-[#00BFA5] px-6 py-2.5 text-xs font-bold text-black hover:bg-[#0cae9d] transition shadow-xl"
          >
            <Save size={15} /> Save TNA
          </button>
        </div>
      </div>
    </SourcingShell>
  );
}

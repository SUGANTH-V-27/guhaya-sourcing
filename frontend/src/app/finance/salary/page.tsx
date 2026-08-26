"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Printer,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";

interface StaffSalaryRecord {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: "Merchandising" | "Quality Control" | "Sourcing / CAD" | "Finance & Admin" | "Logistics";
  basicSalary: number;
  hra: number;
  conveyance: number;
  overtimeHours: number;
  overtimePay: number;
  advanceDeduction: number;
  pfDeduction: number;
  netPay: number;
  paymentStatus: "Paid" | "Pending" | "Hold";
  month: string;
}

const INITIAL_STAFF: StaffSalaryRecord[] = [];

export default function SalaryManagementPage() {
  const [records, setRecords] = useState<StaffSalaryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("August 2026");
  const [selectedSlip, setSelectedSlip] = useState<StaffSalaryRecord | null>(null);

  const filteredRecords = records.filter(
    (r) =>
      r.month === selectedMonth &&
      (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.designation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPayroll = filteredRecords.reduce((s, r) => s + r.netPay, 0);
  const totalPaid = filteredRecords.filter((r) => r.paymentStatus === "Paid").reduce((s, r) => s + r.netPay, 0);
  const totalPending = filteredRecords.filter((r) => r.paymentStatus === "Pending").reduce((s, r) => s + r.netPay, 0);

  function handleMarkPaid(id: string) {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, paymentStatus: "Paid" as const } : r))
    );
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/finance" className="transition-colors hover:text-teal-400">
            Finance
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">Salary Management</span>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Staff Salary &amp; Payroll Management
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Monthly salary calculations, attendance OT additions, advance deductions &amp; pay slip generation
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
          >
            <Printer size={15} /> Print Monthly Payroll
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <span className="text-xs font-semibold uppercase text-gray-400">Total Net Payroll</span>
            <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
              ₹{totalPayroll.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">For {filteredRecords.length} staff members</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <span className="text-xs font-semibold uppercase text-gray-400">Total Disbursed (Paid)</span>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
              ₹{totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Bank transfer processed</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <span className="text-xs font-semibold uppercase text-gray-400">Pending Payouts</span>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
              ₹{totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff name, ID..."
                className="w-full rounded-lg border border-gray-700 bg-black pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-gray-400">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-white outline-none focus:border-teal-400"
              >
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="June 2026">June 2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/90 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-right">Basic + Allowances</th>
                  <th className="py-3.5 px-4 text-right">OT Pay</th>
                  <th className="py-3.5 px-4 text-right">Deductions (Adv/PF)</th>
                  <th className="py-3.5 px-4 text-right">Net Payable</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredRecords.map((r) => {
                  const totalAllow = r.basicSalary + r.hra + r.conveyance;
                  const totalDeduct = r.advanceDeduction + r.pfDeduction;
                  return (
                    <tr key={r.id} className="hover:bg-gray-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{r.name}</div>
                        <div className="font-mono text-[11px] text-teal-300">{r.employeeId} • {r.designation}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-300">{r.department}</td>
                      <td className="py-3.5 px-4 font-mono text-right text-xs text-gray-300">
                        ₹{totalAllow.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-xs text-teal-300">
                        +₹{r.overtimePay.toLocaleString()} ({r.overtimeHours}h)
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-xs text-rose-300">
                        -₹{totalDeduct.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-right text-xs font-bold text-white">
                        ₹{r.netPay.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block rounded px-2.5 py-0.5 text-xs font-semibold ${
                            r.paymentStatus === "Paid"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {r.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedSlip(r)}
                            className="rounded border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-gray-300 hover:text-white"
                          >
                            Pay Slip
                          </button>
                          {r.paymentStatus === "Pending" && (
                            <button
                              onClick={() => handleMarkPaid(r.id)}
                              className="rounded bg-teal-500/20 px-2 py-1 text-xs font-semibold text-teal-300 border border-teal-500/30 hover:bg-teal-500 hover:text-black transition"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Pay Slip */}
        {selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-800/40">
                <div>
                  <h2 className="text-base font-bold text-white">Salary Pay Slip</h2>
                  <p className="text-xs text-teal-400">{selectedSlip.month}</p>
                </div>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div>Name: <strong className="text-white">{selectedSlip.name}</strong></div>
                  <div>Emp ID: <strong className="font-mono text-teal-300">{selectedSlip.employeeId}</strong></div>
                  <div>Designation: <strong className="text-white">{selectedSlip.designation}</strong></div>
                  <div>Department: <strong className="text-white">{selectedSlip.department}</strong></div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-gray-800/60">
                    <span>Basic Salary:</span>
                    <span className="font-mono text-white">₹{selectedSlip.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800/60">
                    <span>House Rent Allowance (HRA):</span>
                    <span className="font-mono text-white">₹{selectedSlip.hra.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800/60">
                    <span>Conveyance Allowance:</span>
                    <span className="font-mono text-white">₹{selectedSlip.conveyance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800/60">
                    <span>Overtime Pay ({selectedSlip.overtimeHours} hrs):</span>
                    <span className="font-mono text-teal-300">+₹{selectedSlip.overtimePay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800/60">
                    <span>Advance Recovery / Deduction:</span>
                    <span className="font-mono text-rose-300">-₹{selectedSlip.advanceDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800/60">
                    <span>Provident Fund (PF):</span>
                    <span className="font-mono text-rose-300">-₹{selectedSlip.pfDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-700 text-sm font-bold">
                    <span className="text-white">Net Take Home Pay:</span>
                    <span className="font-mono text-teal-300">₹{selectedSlip.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-800 px-6 py-4 bg-gray-800/40">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white"
                >
                  Print Slip
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-white hover:bg-teal-400"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

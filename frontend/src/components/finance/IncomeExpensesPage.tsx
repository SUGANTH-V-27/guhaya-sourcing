"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  PiggyBank,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import {
  addManualEntry,
  deleteManualEntry,
  getManualEntriesForMonth,
  type ManualEntry,
} from "@/lib/finance/income-expenses-storage";
import {
  formatInr,
  getInvoiceIncomeAmount,
  getPaidInvoicesForMonth,
  MONTH_OPTIONS,
  monthLabel,
} from "@/lib/finance/income-expenses-utils";
import { loadStaff, type StaffMember } from "@/lib/finance/staff-storage";

const inputClass =
  "w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400/60";

const sectionClass = "rounded-xl border border-gray-700 bg-gray-900 p-5 sm:p-6";

const tableHeadClass = "border-b border-gray-700 bg-gray-800/50 text-left text-xs text-gray-400";

type DraftEntry = {
  date: string;
  value: string;
  remarks: string;
};

const emptyDraft = (): DraftEntry => ({
  date: new Date().toISOString().slice(0, 10),
  value: "",
  remarks: "",
});

export function IncomeExpensesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [additionalIncome, setAdditionalIncome] = useState<ManualEntry[]>([]);
  const [additionalExpenses, setAdditionalExpenses] = useState<ManualEntry[]>([]);
  const [incomeDraft, setIncomeDraft] = useState<DraftEntry>(emptyDraft);
  const [expenseDraft, setExpenseDraft] = useState<DraftEntry>(emptyDraft);

  const refresh = useCallback(() => {
    setStaff(loadStaff());
    setAdditionalIncome(getManualEntriesForMonth(year, month, "income"));
    setAdditionalExpenses(getManualEntriesForMonth(year, month, "expense"));
  }, [year, month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  const paidInvoices = useMemo(
    () => getPaidInvoicesForMonth(year, month),
    [year, month],
  );

  const invoiceIncomeTotal = useMemo(
    () => paidInvoices.reduce((sum, inv) => sum + getInvoiceIncomeAmount(inv), 0),
    [paidInvoices],
  );

  const additionalIncomeTotal = useMemo(
    () => additionalIncome.reduce((sum, entry) => sum + entry.value, 0),
    [additionalIncome],
  );

  const salaryTotal = useMemo(
    () => staff.reduce((sum, member) => sum + member.fixedSalary, 0),
    [staff],
  );

  const additionalExpenseTotal = useMemo(
    () => additionalExpenses.reduce((sum, entry) => sum + entry.value, 0),
    [additionalExpenses],
  );

  const totalIncome = invoiceIncomeTotal + additionalIncomeTotal;
  const totalExpense = salaryTotal + additionalExpenseTotal;
  const netProfitLoss = totalIncome - totalExpense;

  function shiftMonth(delta: number) {
    let nextMonth = month + delta;
    let nextYear = year;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    } else if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    setMonth(nextMonth);
    setYear(nextYear);
  }

  function handleAddIncome() {
    const value = Number(incomeDraft.value);
    if (!incomeDraft.date || !value) return;
    addManualEntry({
      year,
      month,
      type: "income",
      date: incomeDraft.date,
      value,
      remarks: incomeDraft.remarks.trim(),
    });
    setIncomeDraft(emptyDraft());
    refresh();
  }

  function handleAddExpense() {
    const value = Number(expenseDraft.value);
    if (!expenseDraft.date || !value) return;
    addManualEntry({
      year,
      month,
      type: "expense",
      date: expenseDraft.date,
      value,
      remarks: expenseDraft.remarks.trim(),
    });
    setExpenseDraft(emptyDraft());
    refresh();
  }

  function handleDeleteEntry(id: string) {
    deleteManualEntry(id);
    refresh();
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">Dashboard</Link>
          <ChevronRight size={14} className="text-gray-600" />
          <Link href="/finance" className="transition-colors hover:text-teal-400">Finance</Link>
          <ChevronRight size={14} className="text-gray-600" />
          <span className="font-medium text-gray-200">Income &amp; Expenses</span>
        </>
      }
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Income &amp; Expenses</h1>
        <p className="mt-1 text-sm text-gray-400">
          Track income, expenses &amp; savings for each month.
        </p>
      </div>

      {/* Month / year selector */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => shiftMonth(-1)} className="btn-outline px-2.5 py-2">
          <ChevronLeft size={18} />
        </button>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className={`${inputClass} w-auto min-w-[140px]`}
        >
          {MONTH_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className={`${inputClass} w-auto min-w-[100px]`}
        >
          {[2024, 2025, 2026, 2027, 2028].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button type="button" onClick={() => shiftMonth(1)} className="btn-outline px-2.5 py-2">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Monthly Summary */}
      <section className={`${sectionClass} mb-6`}>
        <div className="mb-5 flex items-center gap-2">
          <FileText size={18} className="text-teal-400" />
          <h2 className="text-lg font-semibold text-white">
            Monthly Summary — {monthLabel(year, month)}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Total Income
              </p>
              <TrendingUp size={20} className="text-emerald-400/70" />
            </div>
            <p className="text-2xl font-bold text-emerald-300">{formatInr(totalIncome)}</p>
            <div className="mt-3 space-y-1 text-xs text-emerald-400/80">
              <p>Invoices: {formatInr(invoiceIncomeTotal)}</p>
              <p>Additional: {formatInr(additionalIncomeTotal)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                Total Expense
              </p>
              <TrendingDown size={20} className="text-red-400/70" />
            </div>
            <p className="text-2xl font-bold text-red-300">{formatInr(totalExpense)}</p>
            <div className="mt-3 space-y-1 text-xs text-red-400/80">
              <p>Salary: {formatInr(salaryTotal)}</p>
              <p>Additional: {formatInr(additionalExpenseTotal)}</p>
            </div>
          </div>

          <div
            className={[
              "rounded-xl border p-5",
              netProfitLoss >= 0
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-orange-500/30 bg-orange-500/10",
            ].join(" ")}
          >
            <div className="mb-3 flex items-center justify-between">
              <p
                className={[
                  "text-xs font-semibold uppercase tracking-wider",
                  netProfitLoss >= 0 ? "text-amber-400" : "text-orange-400",
                ].join(" ")}
              >
                {netProfitLoss >= 0 ? "Net Profit" : "Net Loss"}
              </p>
              <PiggyBank
                size={20}
                className={netProfitLoss >= 0 ? "text-amber-400/70" : "text-orange-400/70"}
              />
            </div>
            <p
              className={[
                "text-2xl font-bold",
                netProfitLoss >= 0 ? "text-amber-300" : "text-orange-300",
              ].join(" ")}
            >
              {netProfitLoss < 0 ? "− " : ""}
              {formatInr(Math.abs(netProfitLoss))}
            </p>
          </div>
        </div>
      </section>

      {/* Income */}
      <section className={`${sectionClass} mb-6`}>
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Income</h2>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <FileText size={15} className="text-gray-500" />
            <h3 className="text-sm font-medium text-gray-300">Paid Invoices (Auto)</h3>
          </div>
          {paidInvoices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 bg-black/30 px-4 py-8 text-center text-sm text-gray-500">
              No paid invoices this month. When invoices are marked as paid, they will automatically
              appear here.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className="px-4 py-2.5">Invoice No.</th>
                    <th className="px-4 py-2.5">Payment Date</th>
                    <th className="px-4 py-2.5">To</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paidInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-800 text-gray-300">
                      <td className="px-4 py-2.5 font-medium text-teal-300">{inv.invoiceNumber}</td>
                      <td className="px-4 py-2.5">{inv.paymentDate || inv.date}</td>
                      <td className="px-4 py-2.5">{inv.invoiceTo.company || "—"}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-300">
                        {formatInr(getInvoiceIncomeAmount(inv))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-500/5 font-semibold text-emerald-300">
                    <td className="px-4 py-2.5" colSpan={3}>
                      Total Invoices
                    </td>
                    <td className="px-4 py-2.5 text-right">{formatInr(invoiceIncomeTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-300">Additional Income</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="min-w-full text-sm">
              <thead>
                <tr className={tableHeadClass}>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Value</th>
                  <th className="px-4 py-2.5">Remarks</th>
                  <th className="px-4 py-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {additionalIncome.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-gray-600">
                      No additional income entries for this month.
                    </td>
                  </tr>
                ) : (
                  additionalIncome.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-800 text-gray-300">
                      <td className="px-4 py-2.5">{entry.date}</td>
                      <td className="px-4 py-2.5 text-right">{formatInr(entry.value)}</td>
                      <td className="px-4 py-2.5">{entry.remarks || "—"}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="delete-btn"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                <tr className="border-t border-gray-700 bg-black/40">
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={incomeDraft.date}
                      onChange={(e) => setIncomeDraft((p) => ({ ...p, date: e.target.value }))}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={incomeDraft.value}
                      onChange={(e) => setIncomeDraft((p) => ({ ...p, value: e.target.value }))}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={incomeDraft.remarks}
                      onChange={(e) => setIncomeDraft((p) => ({ ...p, remarks: e.target.value }))}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button type="button" onClick={handleAddIncome} className="btn gap-1">
                      <Plus size={13} /> Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Expenses */}
      <section className={sectionClass}>
        <div className="mb-5 flex items-center gap-2">
          <TrendingDown size={18} className="text-red-400" />
          <h2 className="text-lg font-semibold text-white">Expenses</h2>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Users size={15} className="text-gray-500" />
            <h3 className="text-sm font-medium text-gray-300">Salary Expense (Auto)</h3>
          </div>
          {staff.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 bg-black/30 px-4 py-8 text-center text-sm text-gray-500">
              No staff members found. Add staff in Attendance &amp; Salary to list salaries here.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={tableHeadClass}>
                    <th className="px-4 py-2.5">Staff Member</th>
                    <th className="px-4 py-2.5 text-right">Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id} className="border-b border-gray-800 text-gray-300">
                      <td className="px-4 py-2.5">
                        <span className="text-white">{member.name}</span>
                        <span className="ml-2 text-xs text-gray-500">{member.role}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">{formatInr(member.fixedSalary)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-red-500/10 font-semibold text-red-300">
                    <td className="px-4 py-2.5">Total Salary</td>
                    <td className="px-4 py-2.5 text-right">{formatInr(salaryTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-300">Additional Expenses</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="min-w-full text-sm">
              <thead>
                <tr className={tableHeadClass}>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Value</th>
                  <th className="px-4 py-2.5">Remarks</th>
                  <th className="px-4 py-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {additionalExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-xs text-gray-600">
                      No additional expense entries for this month.
                    </td>
                  </tr>
                ) : (
                  additionalExpenses.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-800 text-gray-300">
                      <td className="px-4 py-2.5">{entry.date}</td>
                      <td className="px-4 py-2.5 text-right">{formatInr(entry.value)}</td>
                      <td className="px-4 py-2.5">{entry.remarks || "—"}</td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="delete-btn"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                <tr className="border-t border-gray-700 bg-black/40">
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={expenseDraft.date}
                      onChange={(e) => setExpenseDraft((p) => ({ ...p, date: e.target.value }))}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={expenseDraft.value}
                      onChange={(e) => setExpenseDraft((p) => ({ ...p, value: e.target.value }))}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={expenseDraft.remarks}
                      onChange={(e) => setExpenseDraft((p) => ({ ...p, remarks: e.target.value }))}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button type="button" onClick={handleAddExpense} className="btn gap-1">
                      <Plus size={13} /> Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SourcingShell>
  );
}

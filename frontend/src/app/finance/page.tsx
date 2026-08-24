"use client";

import Link from "next/link";
import { BookOpen, Calendar, ChevronRight, FileText, Percent, TrendingUp } from "lucide-react";
import { DashboardSectionCard } from "@/components/cards/DashboardSectionCard";
import { SourcingShell } from "@/components/layout/SourcingShell";

export default function FinancePage() {
  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">Finance</span>
        </>
      }
    >
      <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/40 p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Finance</h1>
          <p className="mt-2 text-gray-400">
            Manage attendance, salaries, invoices, incomes &amp; factory ledgers.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            HR
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <DashboardSectionCard
              href="/finance/attendance"
              title="Attendance & Salary"
              description="Track attendance, manage salaries & pay slips"
              icon={Calendar}
              iconClassName="border-sky-400 text-sky-400"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Accounts
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardSectionCard
              href="/finance/invoices"
              title="Invoices"
              description="Create & manage invoices"
              icon={FileText}
              iconClassName="border-amber-400 text-amber-400"
            />
            <DashboardSectionCard
              href="/finance/income-expenses"
              title="Income & Expenses"
              description="Track income, expenses & savings"
              icon={TrendingUp}
              iconClassName="border-violet-400 text-violet-400"
            />
            <DashboardSectionCard
              href="/finance/commission"
              title="Commission"
              description="Track & manage PO commissions"
              icon={Percent}
              iconClassName="border-emerald-400 text-emerald-400"
            />
            <DashboardSectionCard
              href="/finance/ledger"
              title="Factory Ledger"
              description="Invoice & payment statement per factory"
              icon={BookOpen}
              iconClassName="border-teal-400 text-teal-400"
            />
          </div>
        </section>
      </div>
    </SourcingShell>
  );
}

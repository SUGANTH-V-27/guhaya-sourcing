"use client";

import { Calculator, ClipboardCheck, DollarSign, ShoppingBag } from "lucide-react";
import { DashboardSectionCard } from "@/components/cards/DashboardSectionCard";
import { SourcingShell } from "@/components/layout/SourcingShell";

export default function DashboardPage() {
  return (
    <SourcingShell breadcrumb={<span className="font-medium text-gray-200">Dashboard</span>}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">Select a section to get started</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardSectionCard
          href="/finance"
          title="Finance"
          description="Purchase orders, shipments & financial tracking"
          icon={DollarSign}
          iconClassName="border-emerald-400 text-emerald-400"
        />
        <DashboardSectionCard
          href="/brands"
          title="Merchandising & Quality"
          description="Brands, models, samples & quality control"
          icon={ShoppingBag}
          iconClassName="border-teal-400 text-teal-400"
        />
        <DashboardSectionCard
          href="/audit"
          title="Audit"
          description="Inspections, reports & compliance audits"
          icon={ClipboardCheck}
          iconClassName="border-violet-400 text-violet-400"
        />
        <DashboardSectionCard
          href="/costing"
          title="Costing"
          description="Cost sheets, pricing & margin analysis"
          icon={Calculator}
          iconClassName="border-amber-400 text-amber-400"
        />
      </div>
    </SourcingShell>
  );
}

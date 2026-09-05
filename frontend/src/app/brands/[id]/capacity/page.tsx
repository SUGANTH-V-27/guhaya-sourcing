"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Factory,
  Gauge,
  Layers,
  Plus,
  TrendingUp,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { BrandNavTabs } from "@/components/brand/BrandNavTabs";
import { BrandsApi, BrandEntity } from "@/lib/api/brands-api";
import {
  type BrandCapacityAllocation,
  INITIAL_BRAND_CAPACITY,
} from "@/lib/brand/brand-subpages-data";

export default function BrandCapacityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = React.use(params);
  const [brand, setBrand] = useState<BrandEntity | null>(null);
  const [capacities, setCapacities] = useState<BrandCapacityAllocation[]>(INITIAL_BRAND_CAPACITY);

  useEffect(() => {
    async function loadData() {
      if (!brandId) return;
      try {
        const [brandData, capacityData] = await Promise.all([
          BrandsApi.getById(brandId),
          BrandsApi.getFactoryCapacities(brandId),
        ]);
        if (brandData) setBrand(brandData);
        setCapacities(capacityData || []);
      } catch (err) {
        console.warn("Failed to load capacity data:", err);
      }
    }
    loadData();
  }, [brandId]);

  const totalAllocated = capacities.reduce((sum, c) => sum + c.allocatedPcs, 0);
  const totalMaxCapacity = capacities.reduce((sum, c) => sum + c.totalCapacityPcs, 0);
  const overallUtil = totalMaxCapacity > 0 ? Math.round((totalAllocated / totalMaxCapacity) * 100) : 0;

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/brands" className="transition-colors hover:text-teal-400">
            Brands
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">{brand?.name || "Brand"}</span>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">Factory Capacity Planning</span>
        </>
      }
    >
      <BrandNavTabs brandId={brandId} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Factory Capacity &amp; Line Allocation
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Monthly sewing line capacity commitment &amp; utilization tracking across partner factories
            </p>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <span className="text-xs font-semibold uppercase text-gray-400">Total Committed Allocation</span>
            <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
              {totalAllocated.toLocaleString()} pcs
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all monthly factory slots</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <span className="text-xs font-semibold uppercase text-gray-400">Total Factory Capacity</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {totalMaxCapacity.toLocaleString()} pcs
            </div>
            <p className="text-xs text-gray-500 mt-1">Combined monthly line throughput</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <span className="text-xs font-semibold uppercase text-gray-400">Overall Utilization</span>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
              {overallUtil}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Production line load status</p>
          </div>
        </div>

        {/* Capacity Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {capacities.map((cap) => {
            const util = Math.round((cap.allocatedPcs / cap.totalCapacityPcs) * 100);
            const remaining = cap.totalCapacityPcs - cap.allocatedPcs;

            return (
              <div
                key={cap.id}
                className="rounded-xl border border-gray-800 bg-gray-900/90 p-5 space-y-4 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      {cap.month}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{cap.factoryName}</h3>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      util >= 90
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }`}
                  >
                    {util}% Allocated
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Allocated: <strong className="text-white">{cap.allocatedPcs.toLocaleString()} pcs</strong></span>
                    <span>Remaining: <strong className="text-gray-300">{remaining.toLocaleString()} pcs</strong></span>
                  </div>
                  <div className="h-2 w-full bg-black rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        util >= 90 ? "bg-amber-400" : "bg-teal-400"
                      }`}
                      style={{ width: `${Math.min(100, util)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800 text-xs text-gray-400">
                  <div>
                    <span>Total Factory Capacity:</span>
                    <div className="font-mono font-semibold text-white mt-0.5">
                      {cap.totalCapacityPcs.toLocaleString()} pcs
                    </div>
                  </div>
                  <div>
                    <span>Confirmed Bookings:</span>
                    <div className="font-mono font-semibold text-emerald-300 mt-0.5">
                      {cap.confirmedPcs.toLocaleString()} pcs
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SourcingShell>
  );
}

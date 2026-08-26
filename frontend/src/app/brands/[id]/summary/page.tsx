"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Factory,
  Layers,
  Package,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { BrandNavTabs } from "@/components/brand/BrandNavTabs";
import { BrandsApi, BrandEntity } from "@/lib/api/brands-api";
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";
import {
  INITIAL_BRAND_BOOKINGS,
  INITIAL_BRAND_CAPACITY,
  INITIAL_CAPR_RECORDS,
  INITIAL_COURIER_SHIPMENTS,
  type BrandBookingItem,
  type BrandCapacityAllocation,
  type CAPRRecord,
  type CourierShipment,
} from "@/lib/brand/brand-subpages-data";

export default function BrandSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = React.use(params);
  const [brand, setBrand] = useState<BrandEntity | null>(null);
  const [brandModels, setBrandModels] = useState<ModelEntity[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!brandId) return;
      try {
        const [brandData, modelsData] = await Promise.all([
          BrandsApi.getById(brandId),
          ModelsApi.getAll(),
        ]);
        if (brandData) setBrand(brandData);
        if (modelsData) setBrandModels(modelsData.filter((m) => m.brandId === brandId));
      } catch (err) {
        console.warn("Failed to load brand summary data:", err);
      }
    }
    loadData();
  }, [brandId]);

  const totalBookedQty = INITIAL_BRAND_BOOKINGS.reduce((sum: number, b: BrandBookingItem) => sum + b.confirmedQty, 0);
  const totalProjectedQty = INITIAL_BRAND_BOOKINGS.reduce((sum: number, b: BrandBookingItem) => sum + b.projectedQty, 0);
  const openCaprCount = INITIAL_CAPR_RECORDS.filter((c: CAPRRecord) => c.status !== "Closed").length;
  const inTransitShipments = INITIAL_COURIER_SHIPMENTS.filter((s: CourierShipment) => s.status === "In Transit").length;

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
          <span className="font-medium text-teal-400">Summary</span>
        </>
      }
    >
      <BrandNavTabs brandId={brandId} />

      <div className="space-y-6">
        {/* Brand Banner Card */}
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900 via-black to-teal-950/40 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
                Active Brand Account
              </span>
              <h1 className="text-2xl font-bold text-white mt-2">{brand?.name}</h1>
              <p className="text-sm text-gray-400 mt-1">
                Seasonal performance overview, garment production pipelines &amp; factory allocations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/brands/${brandId}`}
                className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-white hover:bg-teal-400 transition"
              >
                View Models ({brandModels.length})
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase font-semibold">Active Models</span>
              <Layers size={16} className="text-teal-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{brandModels.length} Styles</div>
            <p className="text-xs text-gray-500 mt-1">In design / production pipeline</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase font-semibold">Confirmed Orders</span>
              <Package size={16} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-300">
              {totalBookedQty.toLocaleString()} pcs
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Projected: {totalProjectedQty.toLocaleString()} pcs
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase font-semibold">Open CAPR Defects</span>
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300">
              {openCaprCount} Issues
            </div>
            <p className="text-xs text-gray-500 mt-1">Quality action items pending</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs uppercase font-semibold">Sample Shipments</span>
              <Clock size={16} className="text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-300">
              {inTransitShipments} In Transit
            </div>
            <p className="text-xs text-gray-500 mt-1">Via DHL / FedEx courier</p>
          </div>
        </div>

        {/* 2-Column Summary Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Active Bookings Summary */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Season Booking Pipeline
              </h3>
              <Link
                href={`/brands/${brandId}/booking`}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                View All <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {INITIAL_BRAND_BOOKINGS.map((bk: BrandBookingItem) => (
                <div
                  key={bk.id}
                  className="rounded-lg border border-gray-800/80 bg-black/40 p-3.5 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-300">{bk.styleNo}</span>
                      <span className="text-xs text-gray-300 font-medium">{bk.styleName}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      {bk.factoryName} • Delivery: <span className="font-mono text-gray-300">{bk.targetDeliveryDate}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-white">
                      {bk.confirmedQty.toLocaleString()} pcs
                    </div>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold mt-1 ${
                        bk.status === "In Production"
                          ? "bg-teal-500/20 text-teal-300"
                          : bk.status === "Confirmed"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {bk.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Capacity Allocation */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Factory Capacity Allocation
              </h3>
              <Link
                href={`/brands/${brandId}/capacity`}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
              >
                Manage Capacity <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {INITIAL_BRAND_CAPACITY.map((cap: BrandCapacityAllocation) => {
                const utilPercent = Math.round((cap.allocatedPcs / cap.totalCapacityPcs) * 100);
                return (
                  <div
                    key={cap.id}
                    className="rounded-lg border border-gray-800/80 bg-black/40 p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-white">{cap.factoryName}</strong>
                        <span className="text-gray-500 ml-2">({cap.month})</span>
                      </div>
                      <span className="font-mono text-teal-300 font-bold">
                        {cap.allocatedPcs.toLocaleString()} / {cap.totalCapacityPcs.toLocaleString()} pcs ({utilPercent}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          utilPercent > 90
                            ? "bg-amber-400"
                            : utilPercent > 70
                            ? "bg-teal-400"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.min(100, utilPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SourcingShell>
  );
}

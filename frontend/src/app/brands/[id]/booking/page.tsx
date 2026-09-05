"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Filter,
  Package,
  Plus,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { BrandNavTabs } from "@/components/brand/BrandNavTabs";
import { BrandsApi, BrandEntity } from "@/lib/api/brands-api";
import {
  type BrandBookingItem,
  INITIAL_BRAND_BOOKINGS,
} from "@/lib/brand/brand-subpages-data";

export default function BrandBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = React.use(params);
  const [brand, setBrand] = useState<BrandEntity | null>(null);
  const [bookings, setBookings] = useState<BrandBookingItem[]>(INITIAL_BRAND_BOOKINGS);

  useEffect(() => {
    async function loadData() {
      if (!brandId) return;
      try {
        const [brandData, bookingData] = await Promise.all([
          BrandsApi.getById(brandId),
          BrandsApi.getBookingTrackers(brandId),
        ]);
        if (brandData) setBrand(brandData);
        setBookings(bookingData || []);
      } catch (err) {
        console.warn("Failed to load booking data:", err);
      }
    }
    loadData();
  }, [brandId]);
  const [searchQuery, setSearchQuery] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formSeason, setFormSeason] = useState("");
  const [formStyleNo, setFormStyleNo] = useState("");
  const [formStyleName, setFormStyleName] = useState("");
  const [formFabric, setFormFabric] = useState("");
  const [formProjQty, setFormProjQty] = useState(0);
  const [formConfQty, setFormConfQty] = useState(0);
  const [formFob, setFormFob] = useState(0);
  const [formDelivery, setFormDelivery] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formFactory, setFormFactory] = useState("");
  const [formStatus, setFormStatus] = useState<BrandBookingItem["status"]>("Projected");

  const seasons = [...new Set(bookings.map((b) => b.season))];

  const filteredBookings = bookings.filter((b) => {
    const matchSeason = seasonFilter === "all" || b.season === seasonFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      b.styleNo.toLowerCase().includes(q) ||
      b.styleName.toLowerCase().includes(q) ||
      b.factoryName.toLowerCase().includes(q);
    return matchSeason && matchSearch;
  });

  const totalConfirmed = filteredBookings.reduce((sum, b) => sum + b.confirmedQty, 0);
  const totalProjected = filteredBookings.reduce((sum, b) => sum + b.projectedQty, 0);

  async function handleCreateBooking() {
    if (!formStyleNo.trim() || !formStyleName.trim()) return;
    const newItem: BrandBookingItem = {
      id: `bk-${Date.now()}`,
      brandId,
      season: formSeason,
      styleNo: formStyleNo.trim(),
      styleName: formStyleName.trim(),
      fabricType: formFabric.trim() || "Single Jersey Cotton",
      projectedQty: Number(formProjQty) || 0,
      confirmedQty: Number(formConfQty) || 0,
      fobTargetUSD: Number(formFob) || 0,
      targetDeliveryDate: formDelivery,
      factoryName: formFactory,
      status: formStatus,
    };
    try {
      await BrandsApi.saveSubpageData(brandId, "booking", newItem);
      setBookings((prev) => [newItem, ...prev]);
    } catch (error: any) {
      alert(error?.message || "Failed to save booking.");
      return;
    }
    setIsModalOpen(false);
    setFormStyleNo("");
    setFormStyleName("");
  }

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
          <span className="font-medium text-teal-400">Order Booking Pipeline</span>
        </>
      }
    >
      <BrandNavTabs brandId={brandId} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Seasonal Order Bookings
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Projected vs. confirmed production orders, FOB targets &amp; delivery schedules for {brand?.name}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400 transition"
          >
            <Plus size={16} /> New Booking Line
          </button>
        </div>

        {/* Top Summary Bar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <span className="text-xs font-semibold uppercase text-gray-400">Total Confirmed Qty</span>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
              {totalConfirmed.toLocaleString()} pcs
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <span className="text-xs font-semibold uppercase text-gray-400">Total Projected Qty</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {totalProjected.toLocaleString()} pcs
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4">
            <span className="text-xs font-semibold uppercase text-gray-400">Conversion Rate</span>
            <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
              {totalProjected > 0 ? Math.round((totalConfirmed / totalProjected) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search style #, name, factory..."
                className="w-full rounded-lg border border-gray-700 bg-black pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-gray-400">Season:</span>
              <select
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
                className="rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-white outline-none focus:border-teal-400"
              >
                <option value="all">All Seasons</option>
                {seasons.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/90 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-black/50 text-xs uppercase tracking-wider text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Season</th>
                  <th className="py-3.5 px-4">Style # &amp; Description</th>
                  <th className="py-3.5 px-4">Fabric Quality</th>
                  <th className="py-3.5 px-4 text-right">Projected (Pcs)</th>
                  <th className="py-3.5 px-4 text-right">Confirmed (Pcs)</th>
                  <th className="py-3.5 px-4 text-right">FOB Target</th>
                  <th className="py-3.5 px-4">Target Ex-Factory</th>
                  <th className="py-3.5 px-4">Allocated Factory</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-800/30 transition">
                    <td className="py-3.5 px-4 font-medium text-white text-xs">{b.season}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-teal-300">{b.styleNo}</div>
                      <div className="text-xs text-gray-400">{b.styleName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-300 max-w-[200px] truncate">
                      {b.fabricType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-xs text-gray-400">
                      {b.projectedQty.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-xs font-bold text-emerald-300">
                      {b.confirmedQty.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-xs text-gray-200">
                      ${b.fobTargetUSD.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-400">
                      {b.targetDeliveryDate}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-300">{b.factoryName}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block rounded px-2.5 py-0.5 text-xs font-semibold ${
                          b.status === "In Production"
                            ? "bg-teal-500/20 text-teal-300"
                            : b.status === "Confirmed"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: New Booking Line */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-800/40">
                <h2 className="text-lg font-bold text-white">Add Seasonal Booking</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Season</label>
                    <input
                      value={formSeason}
                      onChange={(e) => setFormSeason(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Style # *</label>
                    <input
                      value={formStyleNo}
                      onChange={(e) => setFormStyleNo(e.target.value)}
                      placeholder="e.g. 009GS"
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold">
                      Style Description *
                    </label>
                    <input
                      value={formStyleName}
                      onChange={(e) => setFormStyleName(e.target.value)}
                      placeholder="e.g. Acid Wash Crewneck Sweatshirt"
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold">
                      Fabric Quality / Construction
                    </label>
                    <input
                      value={formFabric}
                      onChange={(e) => setFormFabric(e.target.value)}
                      placeholder="e.g. 320 GSM 100% Cotton Unbrushed Fleece"
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">
                      Projected Qty
                    </label>
                    <input
                      type="number"
                      value={formProjQty}
                      onChange={(e) => setFormProjQty(Number(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">
                      Confirmed Qty
                    </label>
                    <input
                      type="number"
                      value={formConfQty}
                      onChange={(e) => setFormConfQty(Number(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">
                      Target Delivery Date
                    </label>
                    <input
                      type="date"
                      value={formDelivery}
                      onChange={(e) => setFormDelivery(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">
                      Target FOB ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formFob}
                      onChange={(e) => setFormFob(Number(e.target.value) || 0)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-800 px-6 py-4 bg-gray-800/40">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBooking}
                  className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-white hover:bg-teal-400"
                >
                  Save Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

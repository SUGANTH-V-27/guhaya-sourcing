"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Filter,
  Layers,
  Package,
  Plus,
  Search,
  Sparkles,
  Tag,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { brands, models } from "@/lib/mock-data";

export default function MerchandisingHubPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">Merchandising &amp; Quality</span>
        </>
      }
    >
      <div className="space-y-6">
        {/* Banner */}
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-r from-teal-950/30 via-gray-900 to-black p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
                  Merchandising Suite
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-2">
                Brand Accounts &amp; Garment Collections
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage buyer accounts, style developments, seasonal tech packs &amp; production pipelines
              </p>
            </div>

            <Link
              href="/createbrand"
              className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-teal-400 transition shadow-lg self-start md:self-auto"
            >
              <Plus size={16} /> Create Brand
            </Link>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4">
          <div className="relative min-w-[240px] flex-1 sm:max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brand accounts..."
              className="w-full rounded-lg border border-gray-700 bg-black pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
            />
          </div>

          <div className="text-xs text-gray-400">
            Showing <strong className="text-white">{filteredBrands.length}</strong> active buyer brands
          </div>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((b) => {
            const brandModels = models.filter((m) => m.brandId === b.id);
            return (
              <Link
                key={b.id}
                href={`/brands/${b.id}`}
                className="group rounded-2xl border border-gray-800 bg-gray-900/80 p-5 shadow-lg transition-all duration-200 hover:border-teal-500/50 hover:bg-gray-900 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold text-lg">
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>

                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-mono font-semibold text-teal-300">
                    {brandModels.length} Styles
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mt-4 group-hover:text-teal-300 transition">
                  {b.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  Comprehensive buyer account with active seasonal bookings, CAPR log &amp; QA standards.
                </p>

                <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1 text-teal-400 font-semibold group-hover:underline">
                    Open Models <ChevronRight size={14} />
                  </span>
                  <span className="text-[11px] text-gray-500">Updated recently</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </SourcingShell>
  );
}

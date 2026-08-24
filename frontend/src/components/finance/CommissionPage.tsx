"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  RefreshCw,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import {
  buildMockCommissionPos,
  calcCommissionInr,
  COMMISSION_BRANDS,
  DEFAULT_FACTORY_RATES,
  formatInr,
  formatUsd,
  type CommissionPo,
  type CommissionStatus,
  type FactoryRate,
} from "@/lib/finance/commission-data";

const selectClass =
  "w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400/60";

const inlineInputClass =
  "w-16 border-b border-dashed border-gray-500 bg-transparent text-center text-sm text-white outline-none focus:border-teal-400";

export function CommissionPage() {
  const [selectedBrandId, setSelectedBrandId] = useState("sinsay");
  const [statusTab, setStatusTab] = useState<CommissionStatus>("unpaid");
  const [factoryFilter, setFactoryFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [intakeFilter, setIntakeFilter] = useState("all");
  const [rows, setRows] = useState<CommissionPo[]>(buildMockCommissionPos);
  const [factoryRates, setFactoryRates] = useState<FactoryRate[]>(DEFAULT_FACTORY_RATES);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [rateDraft, setRateDraft] = useState({ factory: "", commissionPct: "" });
  const [editingRateId, setEditingRateId] = useState<string | null>(null);

  const brandRows = useMemo(
    () => rows.filter((row) => row.brandId === selectedBrandId),
    [rows, selectedBrandId],
  );

  const filterOptions = useMemo(() => {
    const factories = [...new Set(brandRows.map((r) => r.factory))].sort();
    const styles = [...new Set(brandRows.map((r) => r.styleNo))].sort();
    const seasons = [...new Set(brandRows.map((r) => r.season))].sort();
    const intakes = [...new Set(brandRows.map((r) => r.intake))].sort();
    return { factories, styles, seasons, intakes };
  }, [brandRows]);

  const filteredRows = useMemo(() => {
    return brandRows.filter((row) => {
      if (row.status !== statusTab) return false;
      if (factoryFilter !== "all" && row.factory !== factoryFilter) return false;
      if (styleFilter !== "all" && row.styleNo !== styleFilter) return false;
      if (seasonFilter !== "all" && row.season !== seasonFilter) return false;
      if (intakeFilter !== "all" && row.intake !== intakeFilter) return false;
      return true;
    });
  }, [brandRows, statusTab, factoryFilter, styleFilter, seasonFilter, intakeFilter]);

  const stats = useMemo(() => {
    const base = brandRows.filter((row) => {
      if (factoryFilter !== "all" && row.factory !== factoryFilter) return false;
      if (styleFilter !== "all" && row.styleNo !== styleFilter) return false;
      if (seasonFilter !== "all" && row.season !== seasonFilter) return false;
      if (intakeFilter !== "all" && row.intake !== intakeFilter) return false;
      return true;
    });

    const unpaid = base
      .filter((r) => r.status === "unpaid")
      .reduce((s, r) => s + calcCommissionInr(r.poValueUsd, r.commissionPct, r.rateInrUsd), 0);
    const paid = base
      .filter((r) => r.status === "paid")
      .reduce((s, r) => s + calcCommissionInr(r.poValueUsd, r.commissionPct, r.rateInrUsd), 0);

    const unpaidCount = base.filter((r) => r.status === "unpaid").length;
    const paidCount = base.filter((r) => r.status === "paid").length;

    return { unpaid, paid, total: unpaid + paid, unpaidCount, paidCount };
  }, [brandRows, factoryFilter, styleFilter, seasonFilter, intakeFilter]);

  const availableFactoriesForRate = useMemo(() => {
    const used = new Set(factoryRates.map((r) => r.factory));
    const fromPos = [...new Set(rows.map((r) => r.factory))];
    return fromPos.filter((f) => !used.has(f) || editingRateId);
  }, [factoryRates, rows, editingRateId]);

  function updateRow(id: string, patch: Partial<CommissionPo>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function refreshFromPos() {
    const refreshed = buildMockCommissionPos();
    setRows((prev) => {
      const overrides = new Map(prev.map((r) => [r.id, r]));
      return refreshed.map((row) => {
        const existing = overrides.get(row.id);
        if (!existing) {
          const defaultRate = factoryRates.find((f) => f.factory === row.factory)?.commissionPct;
          return defaultRate != null ? { ...row, commissionPct: defaultRate } : row;
        }
        return existing;
      });
    });
  }

  function saveFactoryRate() {
    const pct = Number(rateDraft.commissionPct);
    if (!rateDraft.factory || !pct) return;

    if (editingRateId) {
      setFactoryRates((prev) =>
        prev.map((r) =>
          r.id === editingRateId ? { ...r, factory: rateDraft.factory, commissionPct: pct } : r,
        ),
      );
    } else {
      setFactoryRates((prev) => [...prev, { id: `fr-${Date.now()}`, factory: rateDraft.factory, commissionPct: pct }]);
    }

    setRows((prev) =>
      prev.map((row) =>
        row.factory === rateDraft.factory && row.commissionPct === (factoryRates.find((f) => f.id === editingRateId)?.commissionPct ?? row.commissionPct)
          ? { ...row, commissionPct: pct }
          : row.factory === rateDraft.factory && !editingRateId
            ? { ...row, commissionPct: pct }
            : row,
      ),
    );

    setRateDraft({ factory: "", commissionPct: "" });
    setEditingRateId(null);
  }

  function editFactoryRate(rate: FactoryRate) {
    setEditingRateId(rate.id);
    setRateDraft({ factory: rate.factory, commissionPct: String(rate.commissionPct) });
  }

  function deleteFactoryRate(id: string) {
    setFactoryRates((prev) => prev.filter((r) => r.id !== id));
    if (editingRateId === id) {
      setEditingRateId(null);
      setRateDraft({ factory: "", commissionPct: "" });
    }
  }

  const brandPillClass = (id: string) =>
    id === selectedBrandId
      ? "rounded-lg border border-teal-500 bg-teal-500 px-5 py-2 text-sm font-semibold text-black"
      : "rounded-lg border border-gray-600 bg-gray-800 px-5 py-2 text-sm font-medium text-gray-300 hover:border-gray-500";

  const statusTabClass = (tab: CommissionStatus) =>
    tab === statusTab
      ? tab === "unpaid"
        ? "rounded-lg border border-amber-500/50 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-300"
        : "rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300"
      : "rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200";

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">Dashboard</Link>
          <ChevronRight size={14} />
          <Link href="/finance" className="transition-colors hover:text-teal-400">Finance</Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">Commission</span>
        </>
      }
    >
      <div className="mb-6">
        <Link href="/finance" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-teal-400">
          <ArrowLeft size={14} /> Back to Finance
        </Link>
        <h1 className="text-3xl font-bold text-white">Commission</h1>
        <p className="mt-1 text-sm text-gray-400">Track commissions per PO across brands.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {COMMISSION_BRANDS.map((brand) => (
            <button key={brand.id} type="button" onClick={() => setSelectedBrandId(brand.id)} className={brandPillClass(brand.id)}>
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select value={factoryFilter} onChange={(e) => setFactoryFilter(e.target.value)} className={selectClass}>
            <option value="all">All Factories</option>
            {filterOptions.factories.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)} className={selectClass}>
            <option value="all">All Styles</option>
            {filterOptions.styles.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={seasonFilter} onChange={(e) => setSeasonFilter(e.target.value)} className={selectClass}>
            <option value="all">All Seasons</option>
            {filterOptions.seasons.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={intakeFilter} onChange={(e) => setIntakeFilter(e.target.value)} className={selectClass}>
            <option value="all">All Intakes</option>
            {filterOptions.intakes.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => setShowRatesModal(true)} className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300">
            <Settings2 size={16} /> Factory Rates
          </button>
          <button type="button" onClick={refreshFromPos} className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300">
            <RefreshCw size={16} /> Refresh from POs
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => setStatusTab("unpaid")} className={statusTabClass("unpaid")}>
          Unpaid ({stats.unpaidCount})
        </button>
        <button type="button" onClick={() => setStatusTab("paid")} className={statusTabClass("paid")}>
          Paid ({stats.paidCount})
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Unpaid Commission</p>
          <p className="mt-2 text-2xl font-bold text-amber-300">{formatInr(stats.unpaid)}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Paid Commission</p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{formatInr(stats.paid)}</p>
        </div>
        <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-400">Total Commission</p>
          <p className="mt-2 text-2xl font-bold text-sky-300">{formatInr(stats.total)}</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50 text-left text-xs text-gray-400">
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Style No</th>
                <th className="px-3 py-3">PO No</th>
                <th className="px-3 py-3">Factory</th>
                <th className="px-3 py-3">Shipment Date</th>
                <th className="px-3 py-3">PO Value (USD)</th>
                <th className="px-3 py-3">Commission %</th>
                <th className="px-3 py-3">Rate (INR/USD)</th>
                <th className="px-3 py-3">Commission (INR)</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-12 text-center text-gray-500">
                    No commission records for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => {
                  const commissionInr = calcCommissionInr(row.poValueUsd, row.commissionPct, row.rateInrUsd);
                  return (
                    <tr key={row.id} className="border-b border-gray-800 text-gray-300">
                      <td className="px-3 py-3">{index + 1}</td>
                      <td className="px-3 py-3 font-medium text-white">{row.styleNo}</td>
                      <td className="px-3 py-3">{row.poNo}</td>
                      <td className="px-3 py-3">{row.factory}</td>
                      <td className="px-3 py-3">{row.shipmentDate}</td>
                      <td className="px-3 py-3">{formatUsd(row.poValueUsd)}</td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          value={row.commissionPct}
                          onChange={(e) => updateRow(row.id, { commissionPct: Number(e.target.value) || 0 })}
                          className={inlineInputClass}
                        />
                        <span className="text-gray-500">%</span>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={0}
                          value={row.rateInrUsd}
                          onChange={(e) => updateRow(row.id, { rateInrUsd: Number(e.target.value) || 0 })}
                          className={inlineInputClass}
                        />
                      </td>
                      <td className="px-3 py-3 font-medium text-teal-300">{formatInr(commissionInr)}</td>
                      <td className="px-3 py-3">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                            row.status === "unpaid"
                              ? "bg-amber-500/15 text-amber-300"
                              : "bg-emerald-500/15 text-emerald-300",
                          ].join(" ")}
                        >
                          {row.status === "unpaid" ? "Unpaid" : "Paid"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-500">{row.invoice ?? "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showRatesModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowRatesModal(false)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Factory Commission Rates</h3>
              <button type="button" onClick={() => setShowRatesModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="mb-6 text-sm text-gray-400">
              Set default commission % per factory. New POs will use these rates automatically.
            </p>

            <table className="mb-6 min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-left text-gray-400">
                  <th className="px-3 py-2">Factory</th>
                  <th className="px-3 py-2">Commission %</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {factoryRates.map((rate) => (
                  <tr key={rate.id} className="border-b border-gray-800 text-gray-300">
                    <td className="px-3 py-3 text-white">{rate.factory}</td>
                    <td className="px-3 py-3">{rate.commissionPct}%</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => editFactoryRate(rate)} className="text-gray-400 hover:text-teal-400" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => deleteFactoryRate(rate.id)} className="text-gray-400 hover:text-red-400" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col gap-3 rounded-xl border border-gray-700 bg-black/40 p-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-500">Factory</label>
                <select
                  value={rateDraft.factory}
                  onChange={(e) => setRateDraft((p) => ({ ...p, factory: e.target.value }))}
                  className={selectClass}
                >
                  <option value="">Select factory...</option>
                  {(editingRateId
                    ? factoryRates.map((r) => r.factory)
                    : availableFactoriesForRate
                  ).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-28">
                <label className="mb-1 block text-xs text-gray-500">%</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder="%"
                  value={rateDraft.commissionPct}
                  onChange={(e) => setRateDraft((p) => ({ ...p, commissionPct: e.target.value }))}
                  className={selectClass}
                />
              </div>
              <button type="button" onClick={saveFactoryRate} className="btn whitespace-nowrap">
                {editingRateId ? "Update Rate" : "+ Add Rate"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SourcingShell>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ModelCard } from "@/components/cards/ModelCard";
import { brands, models } from "@/lib/mock-data";

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export default function BrandModelsPage() {
  const params = useParams();
  const brandId = params?.id ?? "";
  const [query, setQuery] = useState("");

  const brand = brands.find((item) => item.id === brandId);
  const brandModels = useMemo(
    () =>
      models
        .filter((model) => model.brandId === brandId)
        .filter((model) =>
          [model.code, model.name, model.category]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
        ),
    [brandId, query],
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 sm:px-10">
      <section className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-8 shadow-[0_32px_80px_-36px_rgba(15,23,42,0.9)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                Model listing
              </p>
              <h1 className="text-display">{brand?.name ?? "Brand"} models</h1>
              <p className="max-w-2xl text-base text-slate-400">
                Browse the current model shipment pipeline, update status, and review delivery timing.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accent-hover"
            >
              Create model
            </button>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-3xl bg-slate-900/80 p-6">
              <p className="text-sm text-slate-500">Brand</p>
              <p className="mt-3 text-2xl font-semibold text-white">{brand?.name ?? "Unknown brand"}</p>
              <p className="mt-2 text-sm text-slate-400">{brand?.description ?? "Review model progress and handover status for the selected brand."}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-6">
              <p className="text-sm text-slate-500">Matching models</p>
              <p className="mt-3 text-4xl font-semibold text-white">{brandModels.length}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr]">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search models"
                className="field-input pr-12 text-white"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-sm text-slate-500">Filter state</p>
              <p className="mt-3 text-xl font-semibold text-white">{query ? "Filtered" : "All models"}</p>
            </div>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={gridVariants}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {brandModels.length > 0 ? (
            brandModels.map((model) => <ModelCard key={model.id} model={model} />)
          ) : (
            <div className="col-span-full rounded-[28px] border border-slate-800 bg-slate-950/95 p-10 text-center text-slate-400">
              No models match your search criteria.
            </div>
          )}
        </motion.div>
      </section>
    </main>
  );
}

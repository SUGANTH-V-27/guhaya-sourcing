"use client";

import { motion } from "framer-motion";
import type { Model } from "@/types/model";

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

interface ModelCardProps {
  model: Model;
}

export function ModelCard({ model }: ModelCardProps) {
  const statusColor = model.status === "Shipped" ? "text-emerald-300" : "text-amber-300";
  const badgeColor = model.status === "Shipped" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300";
  const delayed = model.status === "Pending" && model.daysToHandover > 10;

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="group overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/95 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.8)]"
    >
      <div className="relative overflow-hidden">
        <img src={model.image} alt={model.name} className="h-52 w-full object-cover" />
        <span className={`absolute right-4 top-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
          {model.status}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Model ID</p>
            <h3 className="mt-2 text-xl font-semibold text-white">{model.code}</h3>
            <p className="mt-1 text-sm text-slate-400">{model.name}</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-300">
            {model.category}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Handover</p>
            <p className="mt-1 text-base font-medium text-white">{model.daysToHandover} days</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${model.status === "Shipped" ? "bg-emerald-400" : "bg-amber-400"}`} />
            <p className={`${statusColor} text-sm font-medium`}>{model.status}</p>
          </div>
        </div>

        {delayed && (
          <div className="flex items-center gap-2 rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <span>⚠️</span>
            <span>Delayed handover expected</span>
          </div>
        )}

        <button
          type="button"
          className="w-full rounded-full bg-slate-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Edit
        </button>
      </div>
    </motion.article>
  );
}

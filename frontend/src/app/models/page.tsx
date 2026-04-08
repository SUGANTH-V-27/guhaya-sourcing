"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { models } from "@/lib/mock-data";
import type { Model } from "../../../types/model";
import { useAuthStore } from "../../../store/authStore";

export default function ModelsPage() {
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useMemo(() => {
    return models.filter(
      (model) =>
        model.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="bg-teal-500 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Guhaya Sourcing</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm">{user?.email || "merch1@mrsgarments.com"}</span>
          <Link href="/login">
            <img src="/login_icon.png" alt="Login" className="h-6 w-6 object-contain" />
          </Link>
        </div>
      </header>

      <div className="p-8 bg-slate-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/createmodel"
              className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-colors"
            >
              CREATE
            </Link>
            <button className="px-6 py-2 border-2 border-teal-500 text-teal-500 font-semibold rounded-md hover:bg-teal-50 transition-colors">
              EDIT
            </button>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="relative w-72">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-teal-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search for Models"
                className="w-full rounded-2xl border border-teal-500 bg-gray-900 pl-12 pr-14 py-3 text-white placeholder-teal-200 outline-none focus:ring-2 focus:ring-teal-500/40 transition-colors"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-1 m-auto h-10 w-10 rounded-xl border border-teal-500 flex items-center justify-center hover:bg-teal-500/15 transition-colors"
              >
                <img src="/filter_icon.png" alt="Filter" className="h-5 w-5 object-contain" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm shadow-slate-200/80">
            <p className="text-slate-500 text-lg">No models found matching your search.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function ModelCard({ model }: { model: Model }) {
  const isShipped = model.status === "Shipped";
  const daysToHandover = model.daysToHandover;

  return (
    <Link href={`/models/${model.id}`} className="block">
      <article className="flex h-full flex-col justify-between overflow-hidden rounded-none border border-slate-700 bg-slate-900 transition shadow-slate-950/50">
        <div>
          <div className="border-b border-slate-700 px-6 py-6 text-center">
            <h2 className="text-3xl font-bold tracking-[0.24em] text-white">{model.code}</h2>
            <div className="mx-auto mt-3 h-0.5 w-16 rounded-full bg-teal-500" />
          </div>

          <div className="flex min-h-[240px] items-center justify-center bg-transparent p-6">
            <img src={model.image} alt={model.name} className="max-h-56 w-full max-w-[240px] object-contain" />
          </div>
        </div>

        <div className="mt-auto border-t border-slate-700 px-6 py-5 text-center">
          {isShipped ? (
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
              <img src="/tick_icon.png" alt="Tick" className="h-5 w-5 object-contain" />
              Style Shipped
            </div>
          ) : (
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
              <img src="/warning_icon.png" alt="Warning" className="h-5 w-5 object-contain" />
              {daysToHandover} Days to Hand over
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

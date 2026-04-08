"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { brands, models } from "@/lib/mock-data";
import { useAuthStore } from "../../../../store/authStore";

export default function BrandModelsPage() {
  const params = useParams();
  const brandId = params?.id ?? "";
  const user = useAuthStore((state) => state.user);
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
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="bg-teal-500 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Guhaya Sourcing</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm">{user?.email ?? "Login"}</span>
          <Link href="/login">
            <img src="/login_icon.png" alt="Login" className="h-6 w-6 object-contain" />
          </Link>
        </div>
      </header>

      <div className="p-8 bg-slate-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/createmodel?brandId=${brandId}`}
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
                value={query}
                onChange={(event) => setQuery(event.target.value)}
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

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {brandModels.length > 0 ? (
            brandModels.map((model) => (
              <Link key={model.id} href={`/models/${model.id}`} className="block h-full rounded-none border border-slate-700 bg-slate-900 p-6 shadow-lg shadow-slate-950/40 transition flex flex-col justify-between">
                <div className="flex flex-col gap-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white">{model.code}</h3>
                    <div className="mx-auto mt-2 h-0.5 w-20 rounded-full bg-teal-500" />
                  </div>

                  <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-3xl bg-transparent p-4">
                    <img src={model.image} alt={model.name} className="max-h-52 w-full object-contain" />
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                  {model.status === "Shipped" ? (
                    <>
                      <img src="/tick_icon.png" alt="Tick" className="h-5 w-5" />
                      <span className="text-emerald-300">Style Shipped</span>
                    </>
                  ) : (
                    <>
                      <img src="/warning_icon.png" alt="Warning" className="h-5 w-5" />
                      <span className="text-rose-300">{model.daysToHandover} Days to Hand over</span>
                    </>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
              No models match your search criteria.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

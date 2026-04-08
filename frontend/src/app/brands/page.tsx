"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { brands } from "@/lib/mock-data";
import type { Brand } from "@/types/brand";

export default function BrandListingPage() {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(5);

  const filteredBrands = useMemo(
    () =>
      brands.filter((brand) =>
        [brand.name, brand.category, brand.description]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
      ),
    [query],
  );

  const displayedBrands = filteredBrands.slice(0, limit);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-teal-500 text-white px-8 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Guhaya Sourcing</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm">merch1@mrsgarments.com</span>
          <Link href="/login">
            <button className="flex items-center justify-center">
              <img src="/login_icon.png" alt="Login" className="h-6 w-6 object-contain" />
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        {/* Controls Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button className="px-6 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-colors">
              CREATE
            </button>
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for Brands"
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

        {/* Brand Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {displayedBrands.length > 0 ? (
            displayedBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4 transition-all cursor-pointer"
              >
                {/* Brand Image */}
                <div className="w-full aspect-square bg-gray-700 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Brand Info */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-2">{brand.name}</h3>
                  <p className="text-gray-300 font-semibold text-sm mb-4">{brand.modelCount} Models</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No brands found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

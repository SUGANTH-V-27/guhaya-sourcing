"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Link from "next/link";
import { brands } from "@/lib/mock-data";
import type { Brand } from "../../../types/brand";

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

          <motion.div
            variants={itemVariants}
            className="inline-flex backdrop-blur-xl bg-white/5 border border-emerald-400/20 rounded-full px-8 py-4 mb-12 shadow-lg shadow-emerald-500/10 gap-4"
          >
            <Link
              href="/createbrand"
              className="inline-flex items-center gap-2 text-white/90 hover:text-emerald-300 transition-colors font-semibold text-sm tracking-wide"
            >
              <span>+</span> CREATE BRAND
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-white/60 hover:text-emerald-300 transition-colors font-semibold text-sm tracking-wide"
            >
              EDIT BRAND
            </button>
            <div className="w-px bg-white/10" />
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-xs font-semibold tracking-widest">TOTAL BRAND</span>
              <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-full w-10 h-10 flex items-center justify-center shadow-lg shadow-emerald-500/15">
                <span className="text-white font-bold text-sm">{brands.length}</span>
              </div>
            </div>
            <div className="w-px bg-white/10" />
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-transparent text-white/70 hover:text-emerald-300 font-semibold text-xs tracking-widest outline-none cursor-pointer appearance-none pr-4 transition-colors"
            >
              <option value={5} className="bg-zinc-900 text-white">VIEW 5</option>
              <option value={10} className="bg-zinc-900 text-white">VIEW 10</option>
              <option value={15} className="bg-zinc-900 text-white">VIEW 15</option>
            </select>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-6 justify-items-center mb-12"
        >
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
        </motion.div>

        {/* Pagination Dots */}
        {filteredBrands.length > 0 && (
          <div className="flex justify-center gap-3 mt-12">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.2 }}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  i === 1 ? "bg-emerald-400 w-8" : "bg-emerald-400/30 hover:bg-emerald-400/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {selectedBrand && (
        <div className="relative z-10 lg:w-[30%] lg:border-l lg:border-emerald-400/10 lg:h-screen lg:overflow-y-auto lg:sticky lg:top-0 bg-zinc-950"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(52, 211, 153, 0.3) transparent"
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
            div::-webkit-scrollbar-thumb {
              background: rgba(52, 211, 153, 0.3);
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: rgba(52, 211, 153, 0.6);
            }
          `}</style>

          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="show"
            className="bg-black/50 backdrop-blur-xl border-l border-emerald-400/15 p-8 lg:p-10"
          >
            {/* Title */}
            <h2 className="text-center text-2xl font-bold text-white tracking-widest mb-2 uppercase">
              {selectedBrand.name}
            </h2>

            <p className="text-center text-xs text-white/60 mb-8 tracking-widest uppercase">
              {selectedBrand.modelCount} models present
            </p>

            <div className="h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent mb-8" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative w-[80%] mx-auto max-w-[250px] aspect-square mb-8 overflow-hidden rounded-xl bg-zinc-900 border border-emerald-400/20 shadow-xl shadow-emerald-500/10"
            >
              <img
                src={selectedBrand.image}
                alt={selectedBrand.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="text-white/60 text-sm font-semibold tracking-widest">BRAND IMAGE</span>
              </div>
            </motion.div>

            <div className="space-y-6">
              <div className="border-b border-white/5 pb-5">
                <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-3">Brand Name</p>
                <h3 className="text-xl font-bold text-white">{selectedBrand.name}</h3>
              </div>

              <div className="border-b border-white/5 pb-5">
                <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-3">Model Count</p>
                <p className="text-2xl font-bold text-white">{selectedBrand.modelCount}</p>
              </div>

              <div className="pt-2">
                <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-3">Description</p>
                <p className="text-sm text-white/70 leading-relaxed">{selectedBrand.description}</p>
              </div>
            </div>

            <Link
              href={selectedBrand ? `/brands/${selectedBrand.id}` : "/models"}
              className="block w-full mt-8 py-3 text-center bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-400/40 rounded-lg text-black font-semibold tracking-wide transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
            >
              View Models
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

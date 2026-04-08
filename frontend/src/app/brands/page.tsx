"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BrandCard } from "@/components/cards/BrandCard";
import { brands } from "@/lib/mock-data";
import type { Brand } from "../../../types/brand";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, x: 100 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export default function BrandListingPage() {
  const [query, setQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(brands[0] || null);
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
    <main className="min-h-screen bg-black flex flex-col lg:flex-row">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-1/3 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl" />
      </div>

      <div className="fixed top-4 right-6 z-50">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center cursor-pointer hover:border-emerald-400/60 transition-colors shadow-lg shadow-emerald-500/10">
          <span className="text-xl">👤</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 px-10 py-12 overflow-y-auto lg:overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Header Pill Container */}
          <div className="inline-flex items-center justify-center backdrop-blur-md bg-white/5 border border-emerald-400/20 rounded-full px-10 py-6 mb-8 shadow-lg shadow-emerald-500/10">
            <img
              src="/guhaya_title.png"
              alt="Guhaya Sourcing"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="relative w-full max-w-md mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-full blur-lg" />
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search brands"
                className="w-full bg-white text-black placeholder-gray-500 rounded-full px-6 py-3.5 outline-none focus:ring-2 focus:ring-emerald-400 transition-all shadow-lg"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
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
              <motion.div
                key={brand.id}
                variants={itemVariants}
                onClick={() => setSelectedBrand(brand)}
                whileHover={{ y: -4 }}
              >
                <BrandCard brand={brand} isSelected={selectedBrand?.id === brand.id} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-white/60 text-lg">No brands found</p>
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
      )}
    </main>
  );
}

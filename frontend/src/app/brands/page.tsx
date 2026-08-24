"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { BrandImageCard } from "@/components/cards/BrandImageCard";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { BrandsApi } from "@/lib/api/brands-api";
import type { Brand } from "../../../types/brand";

const inputClass =
  "w-full rounded-lg border border-gray-700 bg-black py-2 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400/60";

export default function BrandListingPage() {
  const [brandList, setBrandList] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", category: "", description: "" });

  useEffect(() => {
    async function loadBrands() {
      try {
        setLoading(true);
        const data = await BrandsApi.getAll();
        setBrandList(data as Brand[]);
      } catch (err) {
        console.error("Failed to load brands:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return brandList;
    return brandList.filter((brand) =>
      [brand.name, brand.category, brand.description].join(" ").toLowerCase().includes(q),
    );
  }, [brandList, query]);

  const selectedBrand = brandList.find((brand) => brand.id === selectedBrandId) ?? null;

  useEffect(() => {
    if (selectedBrand) {
      setDraft({
        name: selectedBrand.name,
        category: selectedBrand.category || "",
        description: selectedBrand.description || "",
      });
    }
  }, [selectedBrand]);

  function toggleEditMode() {
    setEditMode((prev) => {
      const next = !prev;
      if (!next) setSelectedBrandId(null);
      return next;
    });
  }

  async function saveBrand() {
    if (!selectedBrandId) return;
    const updates = {
      name: draft.name.trim(),
      category: draft.category.trim(),
      description: draft.description.trim(),
    };
    await BrandsApi.update(selectedBrandId, updates);
    setBrandList((prev) =>
      prev.map((brand) =>
        brand.id === selectedBrandId
          ? { ...brand, ...updates }
          : brand,
      ),
    );
    setEditMode(false);
    setSelectedBrandId(null);
  }

  async function deleteBrand() {
    if (!selectedBrandId) return;
    if (!window.confirm("Delete this brand?")) return;
    await BrandsApi.delete(selectedBrandId);
    setBrandList((prev) => prev.filter((brand) => brand.id !== selectedBrandId));
    setSelectedBrandId(null);
    setEditMode(false);
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">Brands</span>
        </>
      }
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/createbrand" className="btn">
            Create brand
          </Link>
          <button
            type="button"
            onClick={toggleEditMode}
            className={editMode ? "btn-outline-active" : "btn-outline"}
          >
            Edit brand
          </button>
        </div>

        <div className="relative w-full sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands"
            className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-teal-400/60"
          />
        </div>
      </div>

      {editMode ? (
        <p className="mb-4 text-sm text-gray-400">Select a brand to rename or delete it.</p>
      ) : null}

      {editMode && selectedBrand ? (
        <div className="mb-6 rounded-xl border border-gray-700 bg-gray-900 p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Edit brand</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Brand name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Category</label>
              <input
                value={draft.category}
                onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-gray-400">Description</label>
              <input
                value={draft.description}
                onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={saveBrand} className="btn px-5 py-2 font-semibold">
              Save changes
            </button>
            <button type="button" onClick={deleteBrand} className="delete-btn" title="Delete brand">
              🗑
            </button>
            <button
              type="button"
              onClick={() => setSelectedBrandId(null)}
              className="btn-outline px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand) => (
            <BrandImageCard
              key={brand.id}
              href={`/brands/${brand.id}`}
              image={brand.image}
              name={brand.name}
              selectable={editMode}
              selected={selectedBrandId === brand.id}
              onSelect={() => setSelectedBrandId(brand.id)}
            />
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-gray-700 bg-gray-900 py-12 text-center text-gray-400">
            No brands found
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

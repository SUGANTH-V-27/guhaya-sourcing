"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ChevronRight, Save, Trash2, X } from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { brands } from "@/lib/mock-data";

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = React.use(params);
  const router = useRouter();
  const brand = brands.find((b) => b.id === brandId) || brands[0];

  const [brandName, setBrandName] = useState(brand?.name || "");
  const [buyerCountry, setBuyerCountry] = useState("United Kingdom");
  const [primaryContact, setPrimaryContact] = useState("Sourcing Director");
  const [email, setEmail] = useState("sourcing@brand.com");
  const [description, setDescription] = useState(
    "Premium streetwear apparel collection focusing on heavyweight cotton knits & sustainable trims."
  );

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Persist and navigate back
    router.push(`/brands/${brandId}`);
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/brands" className="transition-colors hover:text-teal-400">
            Brands
          </Link>
          <ChevronRight size={14} />
          <Link href={`/brands/${brandId}`} className="transition-colors hover:text-teal-400">
            {brand?.name || "Brand"}
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">Edit Brand</span>
        </>
      }
    >
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Edit Brand Profile</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Update brand account settings, contact details &amp; buyer preferences
          </p>
        </div>

        <form onSubmit={handleSave} className="rounded-2xl border border-gray-800 bg-gray-900/90 p-6 shadow-xl space-y-5">
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                  Buyer Country / Region
                </label>
                <input
                  type="text"
                  value={buyerCountry}
                  onChange={(e) => setBuyerCountry(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                  Primary Contact Person
                </label>
                <input
                  type="text"
                  value={primaryContact}
                  onChange={(e) => setPrimaryContact(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                Official Buyer Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                Brand Description &amp; Requirements
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-700 bg-black px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <Link
              href={`/brands/${brandId}`}
              className="rounded-xl border border-gray-700 bg-gray-800/80 px-5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-teal-400 transition shadow-lg"
            >
              <Save size={15} /> Save Brand
            </button>
          </div>
        </form>
      </div>
    </SourcingShell>
  );
}

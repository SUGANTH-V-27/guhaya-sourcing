"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Brand } from "@/types/brand";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface BrandCardProps {
  brand: Brand;
  isSelected?: boolean;
}

export function BrandCard({ brand, isSelected = false }: BrandCardProps) {
  return (
    <Link href={`/brands/${brand.id}`}>
      <motion.div
        variants={cardVariants}
        className={`relative cursor-pointer transition-all duration-300 ease-out ${
          isSelected
            ? "scale-105 ring-2 ring-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.8)]"
            : "hover:scale-105"
        }`}
      >
        <div className="w-[180px] h-[200px] bg-zinc-900 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:shadow-lg">
          
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">
            {brand.category}
          </p>

          <div className="relative w-24 h-24 overflow-hidden flex items-center justify-center">
            <img
              src={brand.image}
              alt={brand.name}
              className="w-full h-full object-contain"
            />
          </div>

          <button className="text-emerald-400/60 hover:text-emerald-400 transition-colors text-lg">
            ✎
          </button>
        </div>
      </motion.div>
    </Link>
  );
}

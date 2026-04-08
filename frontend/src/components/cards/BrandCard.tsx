"use client";

import { motion } from "framer-motion";
import type { Brand } from "../../../types/brand";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

interface BrandCardProps {
  brand: Brand;
  isSelected?: boolean;
}

export function BrandCard({ brand, isSelected = false }: BrandCardProps) {
  return (
    <motion.article
      variants={cardVariants}
      className={`group w-[220px] h-[260px] rounded-xl bg-zinc-900 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
        isSelected
          ? "scale-105 ring-2 ring-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.8)]"
          : "hover:scale-105"
      }`}
    >
      <div className="w-[75%] h-[75%] flex items-center justify-center overflow-hidden rounded-xl">
        <img src={brand.image} alt={brand.name} className="w-full h-full object-contain" />
      </div>

      <p className="text-sm font-semibold text-white text-center px-2 uppercase tracking-wide">
        {brand.name}
      </p>
    </motion.article>
  );
}

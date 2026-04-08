"use client";

import { motion } from "framer-motion";

export default function BrandListingPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col lg:flex-row">
      {/* Header with animated title image */}
      <div className="text-center mb-12 relative">
        {/* Neon circling animation */}
        <motion.div
          className="absolute -inset-4 rounded-full border-4 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.8),0_0_60px_rgba(16,185,129,0.4)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/guhaya_title.png"
            alt="Guhaya Sourcing Title"
            className="h-20 w-auto object-contain mx-auto"
          />
        </motion.div>
      </div>

      {/* Rest of the page content can be added here */}
    </main>
  );
}

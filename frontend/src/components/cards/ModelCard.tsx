"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, FileText } from "lucide-react";
import type { Model } from "../../../types/model";

interface ModelCardProps {
  model: Model;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function ModelCard({
  model,
  selectable = false,
  selected = false,
  onSelect,
}: ModelCardProps) {
  const [hovered, setHovered] = useState(false);
  const isActive = selectable ? selected : hovered;

  const className = [
    "group block overflow-hidden rounded-xl border bg-[#0d1414]",
    "transition-all duration-200 shadow-md flex flex-col justify-between w-full",
    isActive
      ? "border-teal-400 shadow-teal-950/30 -translate-y-0.5"
      : "border-gray-800/90 hover:border-gray-700",
    selectable ? "cursor-pointer text-left" : "",
  ].join(" ");

  const content = (
    <>
      {/* Card Header: Compact Model Code & Factory */}
      <div className="py-2 px-3 text-center border-b border-gray-800/80 bg-[#0d1414]">
        <h3 className="text-xs font-bold text-white font-mono tracking-tight">
          {model.code}
        </h3>
        <div className="flex items-center justify-center gap-1 text-[9px] text-gray-400 uppercase font-semibold mt-0.5 tracking-wider">
          <FileText size={10} className="text-gray-500" />
          <span>{model.factory || "NANDHI FABRICS"}</span>
        </div>
      </div>

      {/* Card Image Area: Compact square aspect ratio filling width & height */}
      <div className="relative w-full aspect-square bg-black overflow-hidden">
        <img
          src={model.image}
          alt={model.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Card Footer: Compact Status Bar / Overdue warning */}
      <div className="py-1.5 px-3 border-t border-gray-800/80 bg-[#0d1414] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-bold text-red-500 text-[10px]">
          <AlertTriangle size={11} className="shrink-0" />
          <span>{model.daysToHandover || 3} Days overdue</span>
        </div>
      </div>
    </>
  );

  if (selectable) {
    return (
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={`/models/${model.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
    >
      {content}
    </Link>
  );
}

"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  FileText,
  Paintbrush,
  Scissors,
  Tag,
  ClipboardCheck,
  BarChart2,
  ClipboardList,
  AlertTriangle,
  User,
  ChevronRight,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type IconName =
  | "ShoppingCart"
  | "FileText"
  | "Paintbrush"
  | "Scissors"
  | "Tag"
  | "ClipboardCheck"
  | "BarChart2"
  | "ClipboardList";

interface FolderCategory {
  id: string;
  label: string;
  iconName: IconName;
  fileCount: number;
}

interface ModelData {
  code: string;
  daysToHandover: number;
  imageUrl?: string;
}

// ── Icon renderer (avoids storing JSX in data) ───────────────────────────────

function CategoryIcon({ name }: { name: IconName }) {
  const props = { size: 36, strokeWidth: 1.4 };
  switch (name) {
    case "ShoppingCart":   return <ShoppingCart {...props} />;
    case "FileText":       return <FileText {...props} />;
    case "Paintbrush":     return <Paintbrush {...props} />;
    case "Scissors":       return <Scissors {...props} />;
    case "Tag":            return <Tag {...props} />;
    case "ClipboardCheck": return <ClipboardCheck {...props} />;
    case "BarChart2":      return <BarChart2 {...props} />;
    case "ClipboardList":  return <ClipboardList {...props} />;
  }
}

// ── Mock data (replace with real API call) ───────────────────────────────────

const CATEGORIES: FolderCategory[] = [
  { id: "purchase-orders",      label: "Purchase Orders",          iconName: "ShoppingCart",   fileCount: 1 },
  { id: "model-documentations", label: "Model Documentations",     iconName: "FileText",       fileCount: 3 },
  { id: "artwork",              label: "Artwork",                  iconName: "Paintbrush",     fileCount: 1 },
  { id: "pattern",              label: "Pattern",                  iconName: "Scissors",       fileCount: 4 },
  { id: "trimming-files",       label: "Trimming Files & Layouts", iconName: "Tag",            fileCount: 8 },
  { id: "sample-evaluation",    label: "Sample Evaluation",        iconName: "ClipboardCheck", fileCount: 4 },
  { id: "daily-production",     label: "Daily Production Report",  iconName: "BarChart2",      fileCount: 4 },
  { id: "quality-check",        label: "Quality Check Reports",    iconName: "ClipboardList",  fileCount: 4 },
];

const MODEL: ModelData = {
  code: "006GS",
  daysToHandover: 25,
};

// ── Sub-components ───────────────────────────────────────────────────────────

function CategoryCard({ category }: { category: FolderCategory }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        "group relative flex flex-col justify-between",
        "bg-gray-900 border rounded-xl p-5 text-left",
        "transition-all duration-200 cursor-pointer w-full",
        hovered
          ? "border-teal-400 shadow-md -translate-y-0.5"
          : "border-gray-700 shadow-sm",
      ].join(" ")}
      style={{ minHeight: "160px" }}
    >
      {/* Icon */}
      <div
        className={[
          "flex items-center justify-center w-16 h-16 rounded-full border-2 mb-3",
          "transition-colors duration-200",
          hovered
            ? "border-teal-500 text-teal-600 bg-teal-50"
            : "border-teal-400 text-teal-500",
        ].join(" ")}
      >
        <CategoryIcon name={category.iconName} />
      </div>

      {/* Label */}
      <p className="font-bold text-whitetext-sm leading-tight uppercase tracking-wide flex-1">
        {category.label}
      </p>

      {/* Divider + file count */}
      <div className="border-t border-gray-700 mt-3 pt-3">
        <span className="text-xs text-gray-300">
          No. Of Files:{" "}
          <span className="font-semibold text-gray-400">
            {String(category.fileCount).padStart(2, "0")}
          </span>
        </span>
      </div>

      {/* Hover arrow */}
      <ChevronRight
        size={14}
        className={[
          "absolute top-4 right-4 text-teal-400 transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </button>
  );
}

function ModelPreviewCard({ model }: { model: ModelData }) {
  const urgent = model.daysToHandover <= 30;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-sm flex flex-col items-center justify-between p-6 h-full">
      {/* Model code */}
      <p className="text-2xl font-bold text-white tracking-widest w-full text-center border-b border-gray-100 pb-3">
        {model.code}
      </p>

      {/* Garment illustration */}
      <div className="flex-1 flex items-center justify-center w-full my-4">
        {model.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={model.imageUrl}
            alt={`Model ${model.code}`}
            className="max-h-48 object-contain"
          />
        ) : (
          <div className="flex gap-3 items-end opacity-30">
            <div className="w-14 h-40 bg-amber-800 rounded-t-full rounded-b-sm" />
            <div
              className="w-14 h-40 rounded-t-full rounded-b-sm"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #bbb 0px, #bbb 4px, #ddd 4px, #ddd 10px)",
              }}
            />
          </div>
        )}
      </div>

      {/* Days to handover badge */}
      <div
        className={[
          "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold",
          urgent
            ? "bg-amber-50 text-amber-600 border border-amber-200"
            : "bg-teal-50 text-teal-600 border border-teal-200",
        ].join(" ")}
      >
        <AlertTriangle
          size={15}
          className={urgent ? "text-amber-500" : "text-teal-500"}
        />
        {model.daysToHandover} Days to handover!
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ModelFolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  return (
    <div className="min-h-screen bg-black font-sans">

      {/* Top nav bar */}
      <header className="flex items-center justify-between px-8 py-4 bg-teal-500 text-white shadow-md">
        <h1 className="text-2xl font-bold tracking-wide">Guhaya Sourcing</h1>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <span>merch1@mrsgarments.com</span>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <User size={16} />
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="px-8 py-3 text-sm text-gray-500 flex items-center gap-1">
        <span className="hover:text-teal-600 cursor-pointer transition-colors">
          Models
        </span>
        <ChevronRight size={14} />
        <span className="text-gray-200 font-medium">{id ?? MODEL.code}</span>
      </nav>

      {/* Main grid */}
      <main className="px-8 pb-12">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(3, 1fr) 280px",
          }}
        >
          {/* 8 category cards */}
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}

          {/* Model preview — spans all rows on column 4 */}
          <div
            style={{
              gridColumn: 4,
              gridRow: "1 / 4",
            }}
          >
            <ModelPreviewCard model={MODEL} />
          </div>
        </div>
      </main>
    </div>
  );
}

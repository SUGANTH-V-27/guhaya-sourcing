"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ModelStatusWidget } from "./ModelStatusWidget";
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
  const [imageFailed, setImageFailed] = useState(false);
  const isActive = selectable ? selected : hovered;
  const imageUrl = model.image?.trim();

  const className = [
    "group block w-full max-w-[210px] overflow-hidden rounded-xl border bg-[#0d1414]",
    "transition-all duration-200 shadow-md flex flex-col justify-between w-full",
    isActive
      ? "border-teal-400 shadow-teal-950/30 -translate-y-0.5"
      : "border-gray-800/90 hover:border-gray-700",
    selectable ? "cursor-pointer text-left" : "",
  ].join(" ");

  const content = (
    <>
      <div className="border-b border-gray-800/80 bg-[#0d1414] px-3 py-2 text-center">
        <h3 className="truncate font-mono text-xs font-bold tracking-tight text-white">
          {model.code}
        </h3>
      </div>

      <div className="relative w-full aspect-square bg-black overflow-hidden">
        {imageUrl && !imageFailed ? (
          <Image
            src={imageUrl}
            alt={model.name}
            fill
            unoptimized
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-950 px-4 text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
            {model.name}
          </div>
        )}
      </div>

      <div className="border-t border-gray-800/80 bg-[#0d1414] px-3 py-2.5 text-center">
        <ModelStatusWidget model={model} compact />
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

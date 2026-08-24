"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

type BrandImageCardProps = {
  href?: string;
  image: string;
  name: string;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

export function BrandImageCard({
  href,
  image,
  name,
  selectable = false,
  selected = false,
  onSelect,
}: BrandImageCardProps) {
  const [hovered, setHovered] = useState(false);
  const isActive = selectable ? selected : hovered;

  const className = [
    "group relative block overflow-hidden rounded-xl border bg-gray-900",
    "transition-all duration-200",
    isActive
      ? "border-teal-400 shadow-md -translate-y-0.5"
      : "border-gray-700 shadow-sm",
    selectable ? "cursor-pointer" : "",
  ].join(" ");

  const content = (
    <>
      <div className="aspect-[4/3] w-full overflow-hidden bg-black">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      {!selectable ? (
        <ChevronRight
          size={14}
          className={[
            "absolute right-4 top-4 text-teal-400 transition-opacity duration-200",
            hovered ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      ) : null}
    </>
  );

  if (selectable) {
    return (
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`${className} w-full text-left`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href ?? "#"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
    >
      {content}
    </Link>
  );
}

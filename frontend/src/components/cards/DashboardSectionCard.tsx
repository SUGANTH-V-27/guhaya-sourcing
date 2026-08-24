"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

type DashboardSectionCardProps = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
};

export function DashboardSectionCard({
  href,
  title,
  description,
  icon: Icon,
  iconClassName = "border-teal-400 text-teal-400",
}: DashboardSectionCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        "group relative flex min-h-[220px] flex-col justify-between rounded-xl border bg-gray-900 p-6",
        "transition-all duration-200",
        hovered
          ? "border-teal-400 shadow-md -translate-y-0.5"
          : "border-gray-700 shadow-sm",
      ].join(" ")}
    >
      <div
        className={[
          "mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors duration-200",
          hovered ? "border-teal-500 bg-teal-500/10 text-teal-300" : iconClassName,
        ].join(" ")}
      >
        <Icon size={28} strokeWidth={1.5} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">{description}</p>
      </div>

      <ChevronRight
        size={14}
        className={[
          "absolute right-5 top-5 text-teal-400 transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </Link>
  );
}

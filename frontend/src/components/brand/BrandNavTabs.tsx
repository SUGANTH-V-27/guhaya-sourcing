"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  FileCheck2,
  Gauge,
  Layers,
  ShieldAlert,
  Truck,
} from "lucide-react";

interface BrandNavTabsProps {
  brandId: string;
}

export function BrandNavTabs({ brandId }: BrandNavTabsProps) {
  const pathname = usePathname();

  const tabs = [
    { label: "Models & Styles", href: `/brands/${brandId}`, icon: Layers, exact: true },
    { label: "Summary", href: `/brands/${brandId}/summary`, icon: BarChart3 },
    { label: "Testing Standards", href: `/brands/${brandId}/standards`, icon: FileCheck2 },
    { label: "Booking Tracker", href: `/brands/${brandId}/booking`, icon: CalendarDays },
    { label: "Factory Capacity", href: `/brands/${brandId}/capacity`, icon: Gauge },
    { label: "Courier & Shipments", href: `/brands/${brandId}/courier`, icon: Truck },
    { label: "CAPR Issue Log", href: `/brands/${brandId}/capr`, icon: ShieldAlert },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-800 pb-1 mb-6 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              isActive
                ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
            }`}
          >
            <Icon size={15} className={isActive ? "text-teal-400" : "text-gray-500"} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

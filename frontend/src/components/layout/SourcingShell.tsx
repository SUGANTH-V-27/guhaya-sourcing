"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { ChevronRight, FolderTree, Home, User } from "lucide-react";

type SourcingShellProps = {
  breadcrumb?: React.ReactNode;
  children: React.ReactNode;
  fullHeight?: boolean;
};

// Route segment friendly titles map
const ROUTE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  brands: "Brands",
  soxo: "SOXO",
  tera: "TeraSource",
  astra: "AstraCraft",
  korva: "Korva Labs",
  nova: "NovaShift",
  sora: "Sora Supply",
  audit: "Audit",
  "social-compliance": "Social Compliance",
  "technical-audit": "Technical Audit",
  certifications: "Certifications",
  create: "New",
  edit: "Edit",
  costing: "Costing",
  finance: "Finance",
  ledger: "Factory Ledger",
  invoices: "Invoices",
  incomes: "Income Ledger",
  commission: "Commission",
  salary: "Salary",
  models: "Models",
  summary: "Summary",
  standards: "Testing Standards",
  booking: "Booking Tracker",
  capacity: "Factory Capacity",
  courier: "Courier & Shipments",
  capr: "CAPR Issue Log",
  "purchase-order": "PO",
  tna: "T&A",
  trimming: "Trims",
  "quality-check": "QC",
};

export function SourcingShell({ breadcrumb, children, fullHeight }: SourcingShellProps) {
  const pathname = usePathname() || "";

  // Auto-generate directory breadcrumbs from URL pathname
  const generatedBreadcrumbs = React.useMemo(() => {
    if (breadcrumb) return null;
    if (!pathname || pathname === "/" || pathname === "/dashboard") return null;

    const segments = pathname.split("/").filter(Boolean);
    let currentPath = "";

    const items = segments.map((seg, idx) => {
      currentPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      const title =
        ROUTE_TITLES[seg.toLowerCase()] ||
        seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");

      return {
        path: currentPath,
        title,
        isLast,
      };
    });

    return items;
  }, [pathname, breadcrumb]);

  const hasDirectory = Boolean(breadcrumb || (generatedBreadcrumbs && generatedBreadcrumbs.length > 0));

  return (
    <div
      className={
        fullHeight
          ? "flex h-screen flex-col overflow-hidden bg-black font-sans text-white"
          : "min-h-screen bg-black font-sans text-white"
      }
    >
      {/* Top Header with Brand Logo & User Profile */}
      <header className="flex items-center justify-between px-6 sm:px-8 py-3.5 bg-teal-500 text-white shadow-md">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-wide hover:opacity-90 transition">
          <Home size={20} strokeWidth={2.2} />
          <span>Guhaya Source Track</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs opacity-90">
            <span className="hidden sm:inline">merch1@mrsgarments.com</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <User size={14} />
            </div>
          </div>
        </div>
      </header>

      {/* Directory Checking / Back Navigation Bar (Positioned at Top Left / Sub-header) */}
      {hasDirectory && (
        <nav className="flex items-center justify-start px-6 sm:px-8 py-2.5 bg-[#091010] border-b border-gray-800/80 text-xs shadow-inner">
          <div className="flex items-center gap-1.5 bg-black/60 border border-gray-800 hover:border-teal-500/40 rounded-lg px-3 py-1.5 text-xs text-gray-300 transition shadow-sm flex-wrap">
            <FolderTree size={13} className="text-teal-400 shrink-0" />
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-teal-400 transition font-medium"
            >
              Dashboard
            </Link>

            {breadcrumb ? (
              <div className="flex items-center gap-1">{breadcrumb}</div>
            ) : (
              generatedBreadcrumbs?.map((item) => (
                <React.Fragment key={item.path}>
                  <ChevronRight size={11} className="text-gray-600 shrink-0" />
                  {item.isLast ? (
                    <span className="font-semibold text-teal-400">{item.title}</span>
                  ) : (
                    <Link
                      href={item.path}
                      className="text-gray-400 hover:text-teal-400 transition font-medium"
                    >
                      {item.title}
                    </Link>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </nav>
      )}

      <main
        className={
          fullHeight
            ? "w-full flex-1 overflow-y-auto px-6 sm:px-8 pt-6 pb-12"
            : "w-full px-6 sm:px-8 pt-6 pb-12"
        }
      >
        {children}
      </main>
    </div>
  );
}

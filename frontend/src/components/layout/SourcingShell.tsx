"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, FolderTree, Home, LogOut, Shield, User, Users } from "lucide-react";
import { authService } from "@/../services/auth.service";

type SourcingShellProps = {
  breadcrumb?: React.ReactNode;
  children: React.ReactNode;
  fullHeight?: boolean;
};

// Route segment friendly titles map
const ROUTE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  brands: "Brands",
  users: "User Management",
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
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      // Fallback check on API
      authService.getMe().then((u) => {
        if (u) setCurrentUser(u);
      }).catch(() => {});
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    authService.logout();
    router.push("/login");
  }

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

  const displayName = currentUser?.fullName || (currentUser?.email ? currentUser.email.split("@")[0] : "Merchandiser");
  const displayEmail = currentUser?.email || "merchandiser@guhaya.com";
  const displayRole = currentUser?.role || "Merchandiser";

  return (
    <div
      className={
        fullHeight
          ? "flex h-screen flex-col overflow-hidden bg-black font-sans text-white"
          : "min-h-screen bg-black font-sans text-white"
      }
    >
      {/* Top Header with Brand Logo & User Profile */}
      <header className="flex items-center justify-between px-6 sm:px-8 py-3.5 bg-teal-500 text-white shadow-md relative z-30">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-wide hover:opacity-90 transition">
          <Home size={20} strokeWidth={2.2} />
          <span>Guhaya Source Track</span>
        </Link>

        {/* Dynamic User Profile Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-xs text-white transition cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 font-bold uppercase text-[11px]">
              {displayName.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="font-semibold text-white">{displayName}</span>
              <span className="text-[10px] text-teal-100">{displayRole}</span>
            </div>
            <ChevronDown size={14} className={`text-teal-100 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* User Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-800 bg-[#0d1414] p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              <div className="border-b border-gray-800 pb-3 mb-2 px-2">
                <p className="font-bold text-sm text-white">{displayName}</p>
                <p className="text-gray-400 text-[11px] truncate">{displayEmail}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-medium text-teal-400 border border-teal-500/20">
                  <Shield size={10} />
                  <span>{displayRole}</span>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  href="/users"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition"
                >
                  <Users size={14} className="text-teal-400" />
                  <span>Manage Team & Users</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6 sm:p-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

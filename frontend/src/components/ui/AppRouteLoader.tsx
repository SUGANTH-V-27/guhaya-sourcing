"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LoadingEvent } from "@/lib/ui/loading";

export function AppRouteLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const requestLoading = pendingRequests > 0;

  useEffect(() => {
    function handleLoading(event: Event) {
      const detail = (event as CustomEvent<LoadingEvent>).detail;
      setPendingRequests(detail?.pending || 0);
    }

    window.addEventListener("guhaya:loading", handleLoading);
    return () => window.removeEventListener("guhaya:loading", handleLoading);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const startTimer = window.setTimeout(() => setShowLoader(true), 120);
    const stopTimer = window.setTimeout(() => setIsLoading(false), 320);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(stopTimer);
    };
  }, [pathname, requestLoading]);

  useEffect(() => {
    if (pendingRequests > 0) {
      setIsLoading(true);
      setShowLoader(true);
      return;
    }
    const hideTimer = window.setTimeout(() => setShowLoader(false), 220);
    return () => window.clearTimeout(hideTimer);
  }, [pendingRequests]);

  if (!showLoader || (!isLoading && pendingRequests === 0)) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex justify-center px-4 pt-3">
      <div className="flex items-center gap-2 rounded-full border border-teal-500/30 bg-[#0d1414]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-teal-300 shadow-lg backdrop-blur-md">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
        Loading
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type ToastState = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  duration: number;
};

export function AppToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    function handleToast(event: Event) {
      const customEvent = event as CustomEvent<ToastState>;
      const detail = customEvent.detail ?? {};
      const payload = {
        id: Date.now(),
        message: detail.message || "Saved",
        type: detail.type || "success",
        duration: detail.duration || 4200,
      };

      setPaused(false);
      setToast(payload);
    }

    window.addEventListener("guhaya:toast", handleToast);
    return () => window.removeEventListener("guhaya:toast", handleToast);
  }, []);

  useEffect(() => {
    if (!toast || paused || toast.duration <= 0) return;
    const timeout = window.setTimeout(() => setToast(null), toast.duration);
    return () => window.clearTimeout(timeout);
  }, [toast, paused]);

  if (!toast) return null;

  const isError = toast.type === "error";
  const isInfo = toast.type === "info";
  const Icon = isError ? CircleAlert : isInfo ? Info : CheckCircle2;
  const accent = isError ? "text-red-300" : isInfo ? "text-amber-300" : "text-emerald-300";
  const border = isError ? "border-red-500/40" : isInfo ? "border-amber-500/40" : "border-emerald-500/40";
  const background = isError ? "bg-red-950/90" : isInfo ? "bg-amber-950/90" : "bg-emerald-950/90";

  return (
    <div
      key={toast.id}
      className={`fixed bottom-5 right-5 z-[150] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-xl border ${border} ${background} p-4 text-white shadow-2xl backdrop-blur-xl`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-start gap-3">
        <Icon size={19} className={`${accent} mt-0.5 shrink-0`} aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm leading-5 text-gray-100">{toast.message}</p>
        <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification" className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-white/10 hover:text-white">
          <X size={16} />
        </button>
      </div>
      {toast.duration > 0 && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
          <div
            className={`h-full ${isError ? "bg-red-300" : isInfo ? "bg-amber-300" : "bg-emerald-300"}`}
            style={{ animation: `guhaya-toast-progress ${toast.duration}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
          />
        </div>
      )}
    </div>
  );
}

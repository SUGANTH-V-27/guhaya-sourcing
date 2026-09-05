export type GlobalToastType = "success" | "error" | "info";

export function showGlobalToast(message: string, type: GlobalToastType = "success", duration = 3600) {
  if (typeof window === "undefined") return;

  const event = new CustomEvent("guhaya:toast", {
    detail: { message, type, duration },
  });

  window.dispatchEvent(event);
}

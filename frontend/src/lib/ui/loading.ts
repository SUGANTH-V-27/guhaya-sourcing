export type LoadingEvent = {
  active: boolean;
  pending: number;
};

function emitLoading(active: boolean, pending: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<LoadingEvent>("guhaya:loading", {
    detail: { active, pending },
  }));
}

let pendingRequests = 0;

export function beginGlobalLoading() {
  pendingRequests += 1;
  emitLoading(true, pendingRequests);
}

export function endGlobalLoading() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  emitLoading(pendingRequests > 0, pendingRequests);
}

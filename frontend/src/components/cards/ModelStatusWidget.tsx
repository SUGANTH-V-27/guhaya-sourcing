"use client";

import { useEffect, useState } from "react";
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";

type ModelStatusWidgetProps = {
  model: Pick<ModelEntity, "id" | "daysToHandover">;
  compact?: boolean;
};

export function ModelStatusWidget({ model, compact = false }: ModelStatusWidgetProps) {
  const [status, setStatus] = useState<"handover" | "shipped" | "empty">("empty");
  const [value, setValue] = useState(0);

  useEffect(() => {
    let active = true;
    const handoverValue = Number(model.daysToHandover) || 0;

    ModelsApi.getPurchaseOrders(model.id)
      .then((orders) => {
        if (!active) return;
        const shippedCount = orders.filter((order: any) => {
          const normalized = String(order?.status || "").trim().toLowerCase();
          return ["shipped", "completed", "delivered"].includes(normalized);
        }).length;
        if (shippedCount > 0) {
          setStatus("shipped");
          setValue(shippedCount);
        } else if (handoverValue !== 0) {
          setStatus("handover");
          setValue(handoverValue);
        } else {
          setStatus("empty");
          setValue(0);
        }
      })
      .catch(() => {
        if (!active) return;
        if (handoverValue !== 0) {
          setStatus("handover");
          setValue(handoverValue);
        } else {
          setStatus("empty");
          setValue(0);
        }
      });

    return () => {
      active = false;
    };
  }, [model.id, model.daysToHandover]);

  const label = status === "shipped"
    ? `${value} POs Shipped`
    : status === "handover"
      ? `${Math.abs(value)} ${value < 0 ? "days overdue" : "days to handover"}`
      : "No deadline";
  const tone = status === "shipped"
    ? "border-teal-500/30 bg-teal-500/10 text-teal-300"
    : status === "handover"
      ? value < 0
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
      : "border-gray-800 bg-black text-gray-500";

  return (
    <div className={`w-full rounded-full border px-3 py-2 text-center text-xs font-semibold ${tone} ${compact ? "text-[10px]" : ""}`}>
      {label}
    </div>
  );
}

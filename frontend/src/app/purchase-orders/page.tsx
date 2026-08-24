"use client";

import ModelPurchaseOrderPage from "@/app/models/[id]/purchase-order/page";

export default function PurchaseOrderPage() {
  return <ModelPurchaseOrderPage params={Promise.resolve({ id: "5906482949644" })} />;
}
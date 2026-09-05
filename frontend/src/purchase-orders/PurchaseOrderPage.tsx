"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PurchaseDetails from "./PurchaseDetails";
import ModelDetails from "./ModelDetails";
import QuantityTable from "./QuantityTable";
import { SourcingShell } from "@/components/layout/SourcingShell";
import "./purchase.css";
import orderService from "../../services/order.service";
import { PurchaseOrder } from "../../types/order";

export type PurchaseOrderDraft = {
  id?: string; poNumber: string; modelId: string; brandId: string; factoryId: string; buyer: string; department: string;
  subclass: string; season: string; shipmentMode: string; orderDate: string; totalQty: string; totalAmount: string;
  unitPrice: string; specialInstructions: string; intake: string; buyerAssistant: string; paymentTerms: string;
  incoTerms: string; noOfSizes: string; dcType: string; dcPort: string; size1: string; size2: string; hod: string; sailing: string;
};

const emptyDraft: PurchaseOrderDraft = {
  poNumber: "", modelId: "", brandId: "", factoryId: "", buyer: "", department: "", subclass: "", season: "",
  shipmentMode: "Sea", orderDate: "", totalQty: "0", totalAmount: "0", unitPrice: "", specialInstructions: "",
  intake: "", buyerAssistant: "", paymentTerms: "", incoTerms: "", noOfSizes: "", dcType: "", dcPort: "", size1: "", size2: "", hod: "", sailing: "",
};

const readExtraFields = (value?: string): Partial<PurchaseOrderDraft> => {
  if (!value) return {};
  try {
    const extra = JSON.parse(value);
    if (!extra || typeof extra !== "object") return {};
    return {
      intake: extra.intake || "",
      subclass: extra.subclass || extra.subClass || "",
      buyerAssistant: extra.buyerAssistant || "",
      unitPrice: extra.unitPrice === undefined ? "" : String(extra.unitPrice),
      paymentTerms: extra.paymentTerms || "",
      incoTerms: extra.incoTerms || "",
      noOfSizes: extra.noOfSizes || "",
      dcType: extra.dcType || extra.quantityRows?.[0]?.dcType || "",
      dcPort: extra.dcPort || extra.quantityRows?.[0]?.dcPort || "",
      size1: extra.size1 || extra.quantityRows?.[0]?.size1 || "",
      size2: extra.size2 || extra.quantityRows?.[0]?.size2 || "",
      hod: extra.hod || extra.quantityRows?.[0]?.hod || "",
      sailing: extra.sailing || extra.quantityRows?.[0]?.sailing || "",
      specialInstructions: extra.comment || extra.specialInstructions || value,
    };
  } catch {
    return { specialInstructions: value };
  }
};

const toDraft = (order: PurchaseOrder, current: PurchaseOrderDraft = emptyDraft): PurchaseOrderDraft => ({
  ...emptyDraft,
  ...current,
  id: order.id, poNumber: order.poNumber || "", modelId: order.modelId || "", brandId: order.brandId || "",
  factoryId: order.factoryId || "", buyer: order.buyer || "", department: order.department || "", season: order.season || "",
  shipmentMode: order.shipmentMode || "Sea", orderDate: order.orderDate ? order.orderDate.slice(0, 10) : "",
  totalQty: String(order.totalQty || 0), totalAmount: String(order.totalAmount || 0), unitPrice: order.unitPrice ? String(order.unitPrice) : "",
  specialInstructions: order.specialInstructions || "",
  ...readExtraFields(order.specialInstructions),
});

const PurchaseOrderPage = () => {
  const [draft, setDraft] = useState<PurchaseOrderDraft>(emptyDraft);
  const [message, setMessage] = useState("Loading purchase order...");

  useEffect(() => {
    const saved = window.localStorage.getItem("guhaya-purchase-order-draft");
    let hasLocalDraft = false;
    if (saved) {
      try { setDraft({ ...emptyDraft, ...JSON.parse(saved) }); hasLocalDraft = true; } catch { window.localStorage.removeItem("guhaya-purchase-order-draft"); }
    }
    orderService.getOrders().then((orders) => {
      if (orders[0] && !hasLocalDraft) setDraft((current) => toDraft(orders[0], current));
      setMessage(hasLocalDraft ? "Loaded your saved purchase order" : orders[0] ? "Loaded saved purchase order" : "New purchase order");
    }).catch(() => setMessage(saved ? "Loaded local purchase order" : "New purchase order"));
  }, []);

  const updateDraft = (updates: Partial<PurchaseOrderDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...updates };
      window.localStorage.setItem("guhaya-purchase-order-draft", JSON.stringify(next));
      return next;
    });
  };

  const save = async () => {
    const extraFields = {
      comment: draft.specialInstructions,
      intake: draft.intake,
      subClass: draft.subclass,
      buyerAssistant: draft.buyerAssistant,
      unitPrice: Number(draft.unitPrice) || 0,
      paymentTerms: draft.paymentTerms,
      incoTerms: draft.incoTerms,
      noOfSizes: draft.noOfSizes,
      dcType: draft.dcType,
      dcPort: draft.dcPort,
      size1: draft.size1,
      size2: draft.size2,
      hod: draft.hod,
      sailing: draft.sailing,
    };
    const payload = {
      poNumber: draft.poNumber || undefined, modelId: draft.modelId || undefined, brandId: draft.brandId || undefined,
      factoryId: draft.factoryId || undefined, buyer: draft.buyer || undefined, department: draft.department || undefined,
      season: draft.season || undefined, shipmentMode: draft.shipmentMode, orderDate: draft.orderDate || undefined,
      totalQty: Number(draft.totalQty) || 0, totalAmount: Number(draft.totalAmount) || 0,
      unitPrice: Number(draft.unitPrice) || undefined, specialInstructions: JSON.stringify(extraFields),
    };
    window.localStorage.setItem("guhaya-purchase-order-draft", JSON.stringify(draft));
    try {
      const saved = draft.id
        ? await orderService.updateOrder(draft.id, payload)
        : await orderService.createOrder(payload);
      if (saved) {
        setDraft((current) => {
          const next = toDraft(saved, current);
          window.localStorage.setItem("guhaya-purchase-order-draft", JSON.stringify(next));
          return next;
        });
      }
      setMessage("Purchase order saved");
    } catch (error: any) {
      setMessage(error?.message || "Database save failed");
    }
  };

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/finance" className="transition-colors hover:text-teal-400">
            Finance
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">Purchase Orders</span>
        </>
      }
    >
      <div className="po-content">
        <div className="po-actions"><span>{message}</span><button className="btn" onClick={save}>Save purchase order</button></div>
        <PurchaseDetails draft={draft} updateDraft={updateDraft} />
        <ModelDetails draft={draft} updateDraft={updateDraft} />
        <QuantityTable draft={draft} updateDraft={updateDraft} />
      </div>
    </SourcingShell>
  );
};

export default PurchaseOrderPage;

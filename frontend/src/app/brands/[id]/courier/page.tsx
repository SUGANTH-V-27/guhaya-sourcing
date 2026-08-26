"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Package,
  Plus,
  Search,
  Truck,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { BrandNavTabs } from "@/components/brand/BrandNavTabs";
import { BrandsApi, BrandEntity } from "@/lib/api/brands-api";
import {
  type CourierShipment,
  INITIAL_COURIER_SHIPMENTS,
} from "@/lib/brand/brand-subpages-data";

export default function BrandCourierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: brandId } = React.use(params);
  const [brand, setBrand] = useState<BrandEntity | null>(null);
  const [shipments, setShipments] = useState<CourierShipment[]>(INITIAL_COURIER_SHIPMENTS);

  useEffect(() => {
    async function loadData() {
      if (!brandId) return;
      try {
        const [brandData, courierData] = await Promise.all([
          BrandsApi.getById(brandId),
          BrandsApi.getCourierShipments(brandId),
        ]);
        if (brandData) setBrand(brandData);
        if (courierData && courierData.length > 0) setShipments(courierData);
      } catch (err) {
        console.warn("Failed to load courier data:", err);
      }
    }
    loadData();
  }, [brandId]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formAwb, setFormAwb] = useState("");
  const [formPartner, setFormPartner] = useState<CourierShipment["courierPartner"]>("DHL Express");
  const [formType, setFormType] = useState<CourierShipment["shipmentType"]>("Fit Samples");
  const [formSender, setFormSender] = useState("Guhaya Sourcing Tirupur QA");
  const [formReceiver, setFormReceiver] = useState("Brand Design Studio");
  const [formOrigin, setFormOrigin] = useState("Tirupur, India");
  const [formDest, setFormDest] = useState("London, UK");
  const [formDispatch, setFormDispatch] = useState(new Date().toISOString().split("T")[0]);
  const [formEstDelivery, setFormEstDelivery] = useState(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formRemarks, setFormRemarks] = useState("");

  const filteredShipments = shipments.filter((s) => {
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.trackingNumber.toLowerCase().includes(q) ||
      s.shipmentType.toLowerCase().includes(q) ||
      s.courierPartner.toLowerCase().includes(q) ||
      s.receiver.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  function handleCreateShipment() {
    if (!formAwb.trim()) return;
    const newShip: CourierShipment = {
      id: `cour-${Date.now()}`,
      brandId,
      trackingNumber: formAwb.trim(),
      courierPartner: formPartner,
      shipmentType: formType,
      sender: formSender,
      receiver: formReceiver,
      origin: formOrigin,
      destination: formDest,
      dispatchDate: formDispatch,
      estimatedDelivery: formEstDelivery,
      status: "In Transit",
      remarks: formRemarks,
    };
    setShipments([newShip, ...shipments]);
    setIsModalOpen(false);
    setFormAwb("");
  }

  return (
    <SourcingShell
      breadcrumb={
        <>
          <Link href="/dashboard" className="transition-colors hover:text-teal-400">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/brands" className="transition-colors hover:text-teal-400">
            Brands
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-gray-200">{brand?.name || "Brand"}</span>
          <ChevronRight size={14} />
          <span className="font-medium text-teal-400">Courier &amp; Shipments</span>
        </>
      }
    >
      <BrandNavTabs brandId={brandId} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Sample &amp; Courier Shipments
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Live Air Waybill tracking for fit samples, lab dips, strike-offs &amp; shipping samples for {brand?.name}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-400 transition"
          >
            <Plus size={16} /> Log New Shipment
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/70 p-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AWB #, courier, type..."
                className="w-full rounded-lg border border-gray-700 bg-black pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-700 bg-black px-3 py-1.5 text-sm text-white outline-none focus:border-teal-400"
              >
                <option value="all">All Statuses</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-medium">
            Showing <strong className="text-white">{filteredShipments.length}</strong> shipments
          </div>
        </div>

        {/* Shipments List */}
        <div className="space-y-4">
          {filteredShipments.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-gray-800 bg-gray-900/90 p-5 shadow-lg space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-300 border border-teal-500/20">
                    {s.courierPartner}
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    AWB: {s.trackingNumber}
                  </span>
                  <span className="rounded bg-black/60 px-2 py-0.5 text-xs text-gray-300">
                    {s.shipmentType}
                  </span>
                </div>

                <span
                  className={`inline-block rounded-full px-3 py-0.5 text-xs font-bold self-start sm:self-auto ${
                    s.status === "Delivered"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : s.status === "In Transit"
                      ? "bg-teal-500/20 text-teal-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-lg bg-black/40 p-3.5 text-xs text-gray-300">
                <div>
                  <span className="text-gray-500">From &rarr; To:</span>
                  <div className="font-medium text-white mt-0.5">
                    {s.origin} &rarr; {s.destination}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Sender: {s.sender}</div>
                </div>

                <div>
                  <span className="text-gray-500">Dispatch &rarr; Est. Delivery:</span>
                  <div className="font-mono font-medium text-teal-300 mt-0.5">
                    {s.dispatchDate} &rarr; {s.estimatedDelivery}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Receiver: {s.receiver}</div>
                </div>

                <div>
                  <span className="text-gray-500">Package Remarks:</span>
                  <div className="text-gray-300 mt-0.5 italic">{s.remarks || "No remarks"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: New Shipment */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-800/40">
                <h2 className="text-lg font-bold text-white">Log New Sample Shipment</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">
                      Courier Partner
                    </label>
                    <select
                      value={formPartner}
                      onChange={(e) => setFormPartner(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    >
                      <option value="DHL Express">DHL Express</option>
                      <option value="FedEx">FedEx</option>
                      <option value="UPS">UPS</option>
                      <option value="Aramex">Aramex</option>
                      <option value="Bluedart">Bluedart</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">AWB / Tracking # *</label>
                    <input
                      value={formAwb}
                      onChange={(e) => setFormAwb(e.target.value)}
                      placeholder="e.g. DHL-9847291032"
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold">
                      Shipment Category
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    >
                      <option value="Fit Samples">Fit Samples</option>
                      <option value="Lab Dips & Swatches">Lab Dips &amp; Swatches</option>
                      <option value="Bulk Trims">Bulk Trims</option>
                      <option value="Sales Samples">Sales Samples</option>
                      <option value="Shipping Samples">Shipping Samples</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Origin City</label>
                    <input
                      value={formOrigin}
                      onChange={(e) => setFormOrigin(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Destination City</label>
                    <input
                      value={formDest}
                      onChange={(e) => setFormDest(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Dispatch Date</label>
                    <input
                      type="date"
                      value={formDispatch}
                      onChange={(e) => setFormDispatch(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-gray-400 font-semibold">Est. Delivery Date</label>
                    <input
                      type="date"
                      value={formEstDelivery}
                      onChange={(e) => setFormEstDelivery(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 font-mono text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs uppercase text-gray-400 font-semibold">Package Contents &amp; Remarks</label>
                    <textarea
                      value={formRemarks}
                      onChange={(e) => setFormRemarks(e.target.value)}
                      rows={2}
                      placeholder="Size sets, sample notes, wash test tags..."
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-800 px-6 py-4 bg-gray-800/40">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateShipment}
                  className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-white hover:bg-teal-400"
                >
                  Save Shipment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  FileText,
  Plus,
  Printer,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi, ModelEntity } from "@/lib/api/models-api";

interface QuantityRow {
  id: string;
  poNo: string;
  dcType: string;
  dcPort: string;
  sizes: Record<string, number>;
  totalQty: number;
  price: number;
  exFactory: string;
  hod: string;
  sailing: string;
}

interface FabricRow {
  id: string;
  colourCode: string;
  fabricType: string;
  composition: string;
  gsm: string;
}

interface PODocument {
  id: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  comment?: string;
}

const AVAILABLE_TESTS = [
  "Dimensional Stability (Shrinkage)",
  "Spirality / Torquing",
  "Fabric Weight (GSM Verification)",
  "Bursting Strength",
  "Pilling Resistance (Martindale)",
  "Seam Strength & Slippage",
  "Pull Test (Snaps & Buttons)",
  "pH Value of Aqueous Extract",
  "Formaldehyde Content",
  "Color Fastness to Washing",
  "Color Fastness to Rubbing (Dry/Wet)",
  "Color Fastness to Perspiration",
  "Color Fastness to Light",
];

export default function PurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: modelId } = React.use(params);
  const router = useRouter();
  const [currentModel, setCurrentModel] = useState<ModelEntity | null>(null);

  useEffect(() => {
    async function loadModel() {
      if (!modelId) return;
      try {
        const data = await ModelsApi.getById(modelId);
        if (data) setCurrentModel(data);
      } catch (err) {
        console.warn("Failed to load model in PO page:", err);
      }
    }
    loadModel();
  }, [modelId]);

  // ── Top Level Form State ───────────────────────────────────────────────────
  const [modelNo, setModelNo] = useState(modelId ? (modelId.length > 8 ? modelId : "5906482949644") : "5906482949644");
  const [factory, setFactory] = useState("NANDHI FABRICS");
  const [season, setSeason] = useState("2027");
  const [intake, setIntake] = useState("--");
  const [department, setDepartment] = useState("Home Textiles");
  const [subClass, setSubClass] = useState("Tote Bags / Kitchen Textiles");
  const [buyer, setBuyer] = useState("Kamila Jurczak");
  const [buyerAssistant, setBuyerAssistant] = useState("--");
  const [unitPrice, setUnitPrice] = useState("1.15");
  const [paymentTerms, setPaymentTerms] = useState("TT AGAINST BL");
  const [incoTerms, setIncoTerms] = useState("FOB");
  const [shipmentType, setShipmentType] = useState("SEA");
  const [poDate, setPoDate] = useState("2026-08-20");
  const [packSize, setPackSize] = useState("1");
  const [isEditing, setIsEditing] = useState(true);

  // ── Size Labels ────────────────────────────────────────────────────────────
  const [sizeLabels, setSizeLabels] = useState<string[]>(["ONE S"]);
  const [isAddSizeOpen, setIsAddSizeOpen] = useState(false);
  const [newSizeName, setNewSizeName] = useState("");

  // ── Quantity Rows ──────────────────────────────────────────────────────────
  const [quantityRows, setQuantityRows] = useState<QuantityRow[]>([
    {
      id: "qr-1",
      poNo: "PI_NF_001",
      dcType: "Gdansk",
      dcPort: "Gdansk",
      sizes: { "ONE S": 5760 },
      totalQty: 5760,
      price: 1.15,
      exFactory: "2026-08-20",
      hod: "25-08-2026",
      sailing: "2026-09-01",
    },
  ]);

  // ── Fabric Details ─────────────────────────────────────────────────────────
  const [fabricRows, setFabricRows] = useState<FabricRow[]>([
    {
      id: "fab-1",
      colourCode: "BLACK",
      fabricType: "WOVEN",
      composition: "100% Cotton",
      gsm: "280 GSM",
    },
  ]);

  // ── Testing Requirements ───────────────────────────────────────────────────
  const [selectedTests, setSelectedTests] = useState<string[]>([
    "Dimensional Stability (Shrinkage)",
    "Color Fastness to Washing",
  ]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // ── PO Documents ───────────────────────────────────────────────────────────
  const [poDocuments, setPoDocuments] = useState<PODocument[]>([]);

  // ── Calculations ───────────────────────────────────────────────────────────
  const totalOrderQty = useMemo(
    () => quantityRows.reduce((sum, r) => sum + (Number(r.totalQty) || 0), 0),
    [quantityRows]
  );

  const totalOrderValue = useMemo(
    () => totalOrderQty * (parseFloat(unitPrice) || 0),
    [totalOrderQty, unitPrice]
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleAddSize() {
    if (!newSizeName.trim()) return;
    const clean = newSizeName.trim().toUpperCase();
    if (!sizeLabels.includes(clean)) {
      setSizeLabels([...sizeLabels, clean]);
      setQuantityRows((prev) =>
        prev.map((r) => ({
          ...r,
          sizes: { ...r.sizes, [clean]: 0 },
        }))
      );
    }
    setNewSizeName("");
    setIsAddSizeOpen(false);
  }

  function handleAddOrderRow() {
    const defaultSizes: Record<string, number> = {};
    sizeLabels.forEach((s) => (defaultSizes[s] = 0));
    const newRow: QuantityRow = {
      id: `qr-${Date.now()}`,
      poNo: `PI_NF_00${quantityRows.length + 1}`,
      dcType: "Gdansk",
      dcPort: "Gdansk",
      sizes: defaultSizes,
      totalQty: 0,
      price: parseFloat(unitPrice) || 1.15,
      exFactory: "2026-08-20",
      hod: "25-08-2026",
      sailing: "2026-09-01",
    };
    setQuantityRows([...quantityRows, newRow]);
  }

  function handleDeleteOrderRow(id: string) {
    if (quantityRows.length <= 1) return;
    setQuantityRows(quantityRows.filter((r) => r.id !== id));
  }

  function handleSizeQtyChange(rowId: string, size: string, val: number) {
    setQuantityRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const newSizes = { ...r.sizes, [size]: val };
        const newTotal = Object.values(newSizes).reduce((a, b) => a + (Number(b) || 0), 0);
        return {
          ...r,
          sizes: newSizes,
          totalQty: newTotal,
        };
      })
    );
  }

  function handleAddFabric() {
    const newFab: FabricRow = {
      id: `fab-${Date.now()}`,
      colourCode: "",
      fabricType: "",
      composition: "",
      gsm: "",
    };
    setFabricRows([...fabricRows, newFab]);
  }

  function handleDeleteFabric(id: string) {
    if (fabricRows.length <= 1) return;
    setFabricRows(fabricRows.filter((f) => f.id !== id));
  }

  function handleToggleTest(testName: string) {
    if (selectedTests.includes(testName)) {
      setSelectedTests(selectedTests.filter((t) => t !== testName));
    } else {
      setSelectedTests([...selectedTests, testName]);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const newDoc: PODocument = {
      id: `doc-${Date.now()}`,
      fileName: file.name,
      uploadDate: new Date().toISOString().split("T")[0],
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      comment: "Official Purchase Order Release PDF",
    };
    setPoDocuments([newDoc, ...poDocuments]);
  }

  function handleSaveChanges() {
    alert("Purchase Order details saved successfully!");
  }

  function handleDeleteAll() {
    if (confirm("Are you sure you want to delete this purchase order record?")) {
      router.push(`/models/${modelId}`);
    }
  }

  return (
    <SourcingShell>
      <div className="space-y-8 pb-16 text-gray-200">

        {/* Top Info Grid + Model Image Card */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main 4-Column Form Fields */}
          <div className="flex-1 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Model No</label>
                <input
                  type="text"
                  value={modelNo}
                  onChange={(e) => setModelNo(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Factory</label>
                <div className="relative">
                  <select
                    value={factory}
                    onChange={(e) => setFactory(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  >
                    <option value="NANDHI FABRICS">NANDHI FABRICS</option>
                    <option value="Apex Apparels Ltd">Apex Apparels Ltd</option>
                    <option value="Prime Tex Mills">Prime Tex Mills</option>
                    <option value="Zenith Garments">Zenith Garments</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Season</label>
                <div className="relative">
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  >
                    <option value="2027">2027</option>
                    <option value="2026">2026</option>
                    <option value="Autumn / Winter 2026">Autumn / Winter 2026</option>
                    <option value="Spring / Summer 2027">Spring / Summer 2027</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Intake</label>
                <div className="relative">
                  <select
                    value={intake}
                    onChange={(e) => setIntake(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  >
                    <option value="--">--</option>
                    <option value="Intake 1">Intake 1</option>
                    <option value="Intake 2">Intake 2</option>
                    <option value="Intake 3">Intake 3</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Department</label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  >
                    <option value="Home Textiles">Home Textiles</option>
                    <option value="Menswear">Menswear</option>
                    <option value="Womenswear">Womenswear</option>
                    <option value="Kidswear">Kidswear</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Sub-class</label>
                <div className="relative">
                  <select
                    value={subClass}
                    onChange={(e) => setSubClass(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  >
                    <option value="Tote Bags / Kitchen Textiles">Tote Bags / Kitchen Textiles</option>
                    <option value="Hoodies / Sweatshirts">Hoodies / Sweatshirts</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Bottoms / Shorts">Bottoms / Shorts</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Buyer</label>
                <div className="relative">
                  <select
                    value={buyer}
                    onChange={(e) => setBuyer(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  >
                    <option value="Kamila Jurczak">Kamila Jurczak</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Buyer Assistant</label>
                <div className="relative">
                  <select
                    value={buyerAssistant}
                    onChange={(e) => setBuyerAssistant(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  >
                    <option value="--">--</option>
                    <option value="Assistant 1">Assistant 1</option>
                    <option value="Assistant 2">Assistant 2</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Price in $</label>
                <input
                  type="text"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Inco Terms</label>
                <input
                  type="text"
                  value={incoTerms}
                  onChange={(e) => setIncoTerms(e.target.value)}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Shipment Type</label>
                <div className="relative">
                  <select
                    value={shipmentType}
                    onChange={(e) => setShipmentType(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  >
                    <option value="SEA">SEA</option>
                    <option value="AIR">AIR</option>
                    <option value="COURIER">COURIER</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">PO Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 font-mono text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Order Quantity</label>
                <input
                  type="text"
                  readOnly
                  value={totalOrderQty.toLocaleString()}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 font-mono text-xs font-bold text-white outline-none cursor-default"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Order Value</label>
                <input
                  type="text"
                  readOnly
                  value={`$${totalOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 font-mono text-xs font-bold text-teal-300 outline-none cursor-default"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">No. Of Sizes</label>
                <input
                  type="text"
                  readOnly
                  value={sizeLabels.length}
                  className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 font-mono text-xs text-white outline-none cursor-default"
                />
              </div>
            </div>
          </div>

          {/* Model Image Preview Card */}
          <div className="w-full lg:w-56 shrink-0 flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-400 mb-2 self-start lg:self-center">
              Model Image
            </span>
            <div className="w-full h-56 rounded-2xl border border-gray-800 bg-[#0d1414] p-3 flex items-center justify-center overflow-hidden shadow-md">
              {currentModel?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentModel.image}
                  alt={currentModel.name || "Model"}
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="w-20 h-28 bg-black rounded-lg border border-gray-800 flex items-center justify-center shadow-inner">
                    <span className="font-extrabold text-xs tracking-widest bg-gradient-to-r from-teal-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                      CHAOS
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-2">Tote Bag</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section: Quantity Details ───────────────────────────────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white tracking-tight font-serif">
                Quantity Details
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Enter Pack</span>
                <input
                  type="number"
                  value={packSize}
                  onChange={(e) => setPackSize(e.target.value)}
                  className="w-12 rounded border border-gray-800 bg-[#0d1414] px-2 py-1 text-center font-mono text-xs text-white outline-none focus:border-teal-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Total Pcs</span>
                <span className="rounded-lg bg-teal-500/10 px-3 py-1 font-mono text-xs font-bold text-teal-300 border border-teal-500/20">
                  {totalOrderQty.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Size Labels Manager */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">Size Labels:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {sizeLabels.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-[#0d1414] border border-gray-800 px-2.5 py-0.5 text-xs font-mono font-bold text-teal-400"
                  >
                    {s}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setIsAddSizeOpen(true)}
                  className="rounded border border-dashed border-gray-700 bg-transparent px-2 py-0.5 text-[11px] text-gray-400 hover:border-teal-400 hover:text-white"
                >
                  + Add Size
                </button>
              </div>
            </div>
          </div>

          {/* Add Size Input Popover */}
          {isAddSizeOpen && (
            <div className="flex items-center gap-2 p-3 bg-[#0d1414] rounded-lg border border-gray-800 max-w-sm">
              <input
                type="text"
                placeholder="Size name (e.g. XL, 32, ONE SIZE)"
                value={newSizeName}
                onChange={(e) => setNewSizeName(e.target.value)}
                className="flex-1 rounded border border-gray-700 bg-black px-2.5 py-1 text-xs text-white outline-none focus:border-teal-400"
              />
              <button
                type="button"
                onClick={handleAddSize}
                className="rounded bg-teal-500 px-3 py-1 text-xs font-bold text-black hover:bg-teal-400"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddSizeOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Orders Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#0d1414]/90 shadow-md">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-gray-800 bg-black/60 text-[11px] font-semibold text-gray-400">
                <tr>
                  <th className="py-3 px-3">PO No</th>
                  <th className="py-3 px-3">DC Type</th>
                  <th className="py-3 px-3">DC Port</th>
                  {sizeLabels.map((s) => (
                    <th key={s} className="py-3 px-3 text-center uppercase">
                      {s}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center">Total Qty</th>
                  <th className="py-3 px-3 text-center">Price ($)</th>
                  <th className="py-3 px-3">Ex-Factory</th>
                  <th className="py-3 px-3">HOD</th>
                  <th className="py-3 px-3">Sailing</th>
                  <th className="py-3 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {quantityRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-800/20 transition">
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={r.poNo}
                        onChange={(e) =>
                          setQuantityRows((prev) =>
                            prev.map((row) => (row.id === r.id ? { ...row, poNo: e.target.value } : row))
                          )
                        }
                        className="w-28 rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={r.dcType}
                        onChange={(e) =>
                          setQuantityRows((prev) =>
                            prev.map((row) => (row.id === r.id ? { ...row, dcType: e.target.value } : row))
                          )
                        }
                        className="rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400 font-sans"
                      >
                        <option value="Gdansk">Gdansk</option>
                        <option value="Hamburg">Hamburg</option>
                        <option value="Rotterdam">Rotterdam</option>
                        <option value="Felixstowe">Felixstowe</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={r.dcPort}
                        onChange={(e) =>
                          setQuantityRows((prev) =>
                            prev.map((row) => (row.id === r.id ? { ...row, dcPort: e.target.value } : row))
                          )
                        }
                        className="rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400 font-sans"
                      >
                        <option value="Gdansk">Gdansk</option>
                        <option value="Hamburg">Hamburg</option>
                        <option value="Rotterdam">Rotterdam</option>
                        <option value="Felixstowe">Felixstowe</option>
                      </select>
                    </td>
                    {sizeLabels.map((s) => (
                      <td key={s} className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={r.sizes[s] ?? 0}
                          onChange={(e) =>
                            handleSizeQtyChange(r.id, s, Number(e.target.value) || 0)
                          }
                          className="w-16 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs font-bold text-white outline-none focus:border-teal-400"
                        />
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center font-bold text-teal-300">
                      {r.totalQty.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-200">
                      <input
                        type="number"
                        step="0.01"
                        value={r.price}
                        onChange={(e) =>
                          setQuantityRows((prev) =>
                            prev.map((row) =>
                              row.id === r.id ? { ...row, price: parseFloat(e.target.value) || 0 } : row
                            )
                          )
                        }
                        className="w-16 rounded border border-gray-800 bg-black px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        value={r.exFactory}
                        onChange={(e) =>
                          setQuantityRows((prev) =>
                            prev.map((row) =>
                              row.id === r.id ? { ...row, exFactory: e.target.value } : row
                            )
                          )
                        }
                        className="rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={r.hod}
                        onChange={(e) =>
                          setQuantityRows((prev) =>
                            prev.map((row) => (row.id === r.id ? { ...row, hod: e.target.value } : row))
                          )
                        }
                        className="w-24 rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="date"
                        value={r.sailing}
                        onChange={(e) =>
                          setQuantityRows((prev) =>
                            prev.map((row) => (row.id === r.id ? { ...row, sailing: e.target.value } : row))
                          )
                        }
                        className="rounded border border-gray-800 bg-black px-2 py-1 text-xs text-white outline-none focus:border-teal-400"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteOrderRow(r.id)}
                        className="text-gray-500 hover:text-red-400 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddOrderRow}
              className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-black hover:bg-teal-400 transition"
            >
              ADD ORDER
            </button>
          </div>
        </div>

        {/* ── Section: Fabric Details ─────────────────────────────────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <h2 className="text-xl font-bold text-white tracking-tight font-serif">
            Fabric Details
          </h2>

          <div className="space-y-3">
            {fabricRows.map((f) => (
              <div key={f.id} className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Colour Code
                  </label>
                  <input
                    type="text"
                    value={f.colourCode}
                    placeholder="e.g. BLACK"
                    onChange={(e) =>
                      setFabricRows((prev) =>
                        prev.map((row) =>
                          row.id === f.id ? { ...row, colourCode: e.target.value } : row
                        )
                      )
                    }
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex-1 min-w-[140px]">
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Fabric Type
                  </label>
                  <input
                    type="text"
                    value={f.fabricType}
                    placeholder="e.g. WOVEN"
                    onChange={(e) =>
                      setFabricRows((prev) =>
                        prev.map((row) =>
                          row.id === f.id ? { ...row, fabricType: e.target.value } : row
                        )
                      )
                    }
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex-1 min-w-[160px]">
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    Composition
                  </label>
                  <input
                    type="text"
                    value={f.composition}
                    placeholder="e.g. 100% Cotton"
                    onChange={(e) =>
                      setFabricRows((prev) =>
                        prev.map((row) =>
                          row.id === f.id ? { ...row, composition: e.target.value } : row
                        )
                      )
                    }
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div className="flex-1 min-w-[120px]">
                  <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                    GSM
                  </label>
                  <input
                    type="text"
                    value={f.gsm}
                    placeholder="e.g. 280 GSM"
                    onChange={(e) =>
                      setFabricRows((prev) =>
                        prev.map((row) => (row.id === f.id ? { ...row, gsm: e.target.value } : row))
                      )
                    }
                    className="w-full rounded-lg border border-gray-800 bg-[#0d1414] px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-teal-400"
                  />
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => handleDeleteFabric(f.id)}
                    className="p-2 text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={handleAddFabric}
              className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-black hover:bg-teal-400 transition"
            >
              ADD FABRIC +
            </button>
          </div>
        </div>

        {/* ── Section: Testing Requirements ───────────────────────────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight font-serif">
              Testing Requirements
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Define the tests required for this model. These will be available for selection in the Test Report.
            </p>
          </div>

          {/* Selected Test Chips */}
          <div className="flex flex-wrap gap-2">
            {selectedTests.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 text-xs text-teal-300"
              >
                {t}
                <button
                  type="button"
                  onClick={() => handleToggleTest(t)}
                  className="text-teal-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setIsTestModalOpen(true)}
              className="rounded-lg bg-teal-500 px-4 py-2 text-xs font-bold text-black hover:bg-teal-400 transition"
            >
              ADD TEST
            </button>
          </div>
        </div>

        {/* ── Section: PO Documents ───────────────────────────────────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-900">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight font-serif">
              PO Documents
            </h2>
            <label className="cursor-pointer rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-teal-400 transition">
              ADD +
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Documents Box */}
          {poDocuments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-800 bg-[#0d1414]/50 py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-black/60 border border-gray-800 flex items-center justify-center text-gray-500">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-300">No PO documents yet</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload a purchase order PDF to extract and track PO data
                </p>
              </div>
              <label className="cursor-pointer rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-teal-400 transition">
                ADD +
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              {poDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#0d1414] p-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-teal-400" />
                    <div>
                      <span className="font-bold text-white">{doc.fileName}</span>
                      <span className="text-gray-500 ml-2">({doc.fileSize})</span>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Uploaded on: {doc.uploadDate} {doc.comment && `• ${doc.comment}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                      Latest
                    </span>
                    <button
                      type="button"
                      onClick={() => setPoDocuments(poDocuments.filter((d) => d.id !== doc.id))}
                      className="text-gray-500 hover:text-red-400 transition ml-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom Action Bar ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-800">
          <button
            type="button"
            onClick={handleDeleteAll}
            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition"
          >
            <Trash2 size={15} /> DELETE
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-5 py-2 text-xs font-bold text-gray-300 hover:bg-gray-800 hover:text-white transition"
            >
              EDIT
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="rounded-lg bg-teal-500 px-6 py-2 text-xs font-bold text-black hover:bg-teal-400 transition shadow-lg"
            >
              SAVE CHANGES
            </button>
          </div>
        </div>

        {/* ── Modal: Select Tests from Standards ───────────────────────────────── */}
        {isTestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4 bg-gray-800/40">
                <h2 className="text-base font-bold text-white">Select Tests from Standards</h2>
                <button
                  onClick={() => setIsTestModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-2 overflow-y-auto max-h-[60vh]">
                {AVAILABLE_TESTS.map((test) => {
                  const isChecked = selectedTests.includes(test);
                  return (
                    <label
                      key={test}
                      onClick={() => handleToggleTest(test)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs font-medium cursor-pointer transition ${
                        isChecked
                          ? "border-teal-500/40 bg-teal-500/10 text-white"
                          : "border-gray-800 bg-black/40 text-gray-400 hover:border-gray-700"
                      }`}
                    >
                      <span>{test}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-gray-700 text-teal-500 focus:ring-0"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-800 px-6 py-4 bg-gray-800/40">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="rounded-lg bg-teal-500 px-5 py-2 text-xs font-bold text-black hover:bg-teal-400"
                >
                  Done ({selectedTests.length} selected)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SourcingShell>
  );
}

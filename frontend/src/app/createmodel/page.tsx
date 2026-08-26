"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, Upload, ChevronDown } from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { ModelsApi } from "@/lib/api/models-api";

function CreateModelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get("brandId") || "soxo";

  const [sizes, setSizes] = useState(5);
  const [modelName, setModelName] = useState("");
  const [modelNo, setModelNo] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Record<string, string>>({
    Factory: "Factory A",
    Season: "Summer",
    Intake: "2026",
    "Product Group": "Menswear",
    "Sub-class": "Shirts",
    Buyer: "John",
    "Buyer Assistant": "Alex",
    Price: "12.50",
    "Payment Terms": "TT AGAINST BL",
    "Inco Terms": "FOB",
    "Shipment Type": "Sea",
    "PO Date": new Date().toISOString().split("T")[0],
    "Order Qty": "5000",
    "Order Value": "62500",
  });

  const [rows, setRows] = useState<any[]>([createRow(5)]);

  function createRow(sizeCount: number) {
    return {
      po: "PO-001",
      dcType: "Primary",
      dcPort: "Hamburg",
      sizes: Array(sizeCount).fill("1000"),
      total: "5000",
      sailing: "Direct",
    };
  }

  const handleSizeChange = (value: number) => {
    const val = Math.max(1, value);
    setSizes(val);

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        sizes: Array(val).fill("1000"),
      }))
    );
  };

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const addRow = () => {
    setRows((prev) => {
      const updated = [...prev, createRow(sizes)];

      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return updated;
    });
  };

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectFields: Record<string, string[]> = {
    Factory: ["Factory A", "Factory B", "Factory C", "NANDHI FABRICS"],
    Season: ["Summer", "Winter", "Spring", "Autumn"],
    Intake: ["2024", "2025", "2026", "2027"],
    "Product Group": ["Menswear", "Womenswear", "Home Textiles", "Kidswear"],
    "Sub-class": ["Shirts", "Pants", "Jackets", "Tote Bags / Kitchen Textiles"],
    Buyer: ["John", "David", "Alex", "Kamila Jurczak"],
    "Buyer Assistant": ["Sam", "Leo", "Mark", "--"],
    "Shipment Type": ["Air", "Sea", "Courier"],
  };

  const baseInput =
    "w-full h-8 bg-[#1a1a1a] border border-[#00BFA5]/60 px-2 text-xs text-white rounded focus:outline-none focus:ring-1 focus:ring-[#00BFA5]/60";

  const renderField = (label: string) => {
    if (selectFields[label]) {
      return (
        <div className="relative">
          <select
            value={formData[label] || ""}
            onChange={(e) => setFormData({ ...formData, [label]: e.target.value })}
            className={`appearance-none ${baseInput} pr-6`}
          >
            <option value="">{label}</option>
            {selectFields[label].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
            <ChevronDown className="text-gray-400" size={12} />
          </span>
        </div>
      );
    }

    return (
      <input
        placeholder={label}
        value={label === "Model No" ? modelNo : formData[label] || ""}
        onChange={(e) => {
          if (label === "Model No") {
            setModelNo(e.target.value);
          } else {
            setFormData({ ...formData, [label]: e.target.value });
          }
        }}
        className={baseInput}
      />
    );
  };

  const handleCreateModel = async () => {
    const code = modelNo.trim() || `STYLE-${Date.now().toString().slice(-6)}`;
    const name = modelName.trim() || "New Garment Style";
    setError(null);
    setIsSaving(true);

    try {
      await ModelsApi.create({
        id: code,
        brandId,
        code,
        name,
        category: formData["Product Group"] || "Apparel",
        image: imagePreview || "",
        status: "Pending",
        daysToHandover: 14,
        factory: formData["Factory"] || "NANDHI FABRICS",
      });

      router.push(`/models/${code}`);
    } catch (err: any) {
      console.error("Failed to create model:", err);
      setError(err?.message || "Failed to create model. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SourcingShell fullHeight>
      <div className="space-y-10">
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-2.5 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        {/* MODEL DETAILS */}
        <div>
          <h2 className="mb-5 text-gray-300 font-semibold">Model Details</h2>

          <div className="flex gap-10 items-start">
            {/* LEFT */}
            <div className="flex flex-col gap-4 w-60">
              <input
                placeholder="Model Name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className={baseInput}
              />

              <label className="w-full h-36 bg-[#1a1a1a] border border-[#00BFA5]/60 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#00BFA5] relative overflow-hidden">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Model Preview" className="max-h-full max-w-full object-contain" />
                ) : (
                  <>
                    <Upload size={16} className="text-gray-400" />
                    <span className="text-[10px] text-gray-500 mt-1">Upload Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            {/* RIGHT */}
            <div className="flex-1 grid grid-cols-4 gap-6">
              {[
                "Model No",
                "Factory",
                "Season",
                "Intake",
                "Product Group",
                "Sub-class",
                "Buyer",
                "Buyer Assistant",
                "Price",
                "Payment Terms",
                "Inco Terms",
                "Shipment Type",
              ].map((label) => (
                <div key={label}>{renderField(label)}</div>
              ))}

              <input
                placeholder="PO Date"
                value={formData["PO Date"] || ""}
                onChange={(e) => setFormData({ ...formData, "PO Date": e.target.value })}
                className={baseInput}
              />
              <input
                placeholder="Order Qty"
                value={formData["Order Qty"] || ""}
                onChange={(e) => setFormData({ ...formData, "Order Qty": e.target.value })}
                className={baseInput}
              />
              <input
                placeholder="Order Value"
                value={formData["Order Value"] || ""}
                onChange={(e) => setFormData({ ...formData, "Order Value": e.target.value })}
                className={baseInput}
              />

              <input
                type="number"
                min={1}
                max={15}
                value={sizes}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className={baseInput}
              />
            </div>
          </div>
        </div>

        {/* QUANTITY */}
        <div>
          <h2 className="mb-3 text-gray-300 font-semibold">Quantity Details</h2>

          <div
            className="grid gap-6 mb-3 text-xs text-gray-400 font-medium"
            style={{
              gridTemplateColumns: `repeat(${sizes + 5}, minmax(0,1fr))`,
            }}
          >
            <p>PO</p>
            <p>DC Type</p>
            <p>DC Port</p>

            {Array.from({ length: sizes }).map((_, i) => (
              <p key={i}>S{i + 1}</p>
            ))}

            <p>Total</p>
            <p>Sailing</p>
          </div>

          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-6 mb-2"
              style={{
                gridTemplateColumns: `repeat(${sizes + 5}, minmax(0,1fr))`,
              }}
            >
              <input
                value={row.po}
                onChange={(e) => {
                  const next = [...rows];
                  next[rowIndex].po = e.target.value;
                  setRows(next);
                }}
                className={baseInput}
              />
              <input
                value={row.dcType}
                onChange={(e) => {
                  const next = [...rows];
                  next[rowIndex].dcType = e.target.value;
                  setRows(next);
                }}
                className={baseInput}
              />
              <input
                value={row.dcPort}
                onChange={(e) => {
                  const next = [...rows];
                  next[rowIndex].dcPort = e.target.value;
                  setRows(next);
                }}
                className={baseInput}
              />

              {row.sizes.map((sz: string, i: number) => (
                <input
                  key={i}
                  value={sz}
                  onChange={(e) => {
                    const next = [...rows];
                    next[rowIndex].sizes[i] = e.target.value;
                    setRows(next);
                  }}
                  className={baseInput}
                />
              ))}

              <input
                value={row.total}
                onChange={(e) => {
                  const next = [...rows];
                  next[rowIndex].total = e.target.value;
                  setRows(next);
                }}
                className={baseInput}
              />
              <input
                value={row.sailing}
                onChange={(e) => {
                  const next = [...rows];
                  next[rowIndex].sailing = e.target.value;
                  setRows(next);
                }}
                className={baseInput}
              />

              <button type="button" onClick={() => removeRow(rowIndex)}>
                <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
              </button>
            </div>
          ))}

          <div ref={bottomRef} />

          <button
            type="button"
            onClick={addRow}
            className="mt-4 bg-[#17b3a3] text-black px-4 py-2 rounded flex items-center gap-2 text-sm font-semibold hover:bg-[#00BFA5]"
          >
            <Plus size={12} /> Add Order
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push(`/brands/${brandId}`)}
            className="rounded border border-gray-600 px-6 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleCreateModel}
            disabled={isSaving}
            className="rounded bg-[#00BFA5] px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#0cae9d] disabled:opacity-50"
          >
            {isSaving ? "CREATING..." : "CREATE MODEL"}
          </button>
        </div>
      </div>
    </SourcingShell>
  );
}

export default function CreateModelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-teal-400">Loading...</div>}>
      <CreateModelContent />
    </Suspense>
  );
}

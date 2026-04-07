"use client";

import { useState } from "react";
import { Plus, Trash2, Upload, ChevronDown } from "lucide-react";

export default function GuhayaUI() {
  const [sizes, setSizes] = useState(5);

  const [rows, setRows] = useState<any[]>([
    createRow(5),
  ]);

  function createRow(sizeCount: number) {
    return {
      sizes: Array(sizeCount).fill(""),
    };
  }

  const handleSizeChange = (value: number) => {
    setSizes(value);

    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        sizes: Array(value).fill(""),
      }))
    );
  };

  const addRow = () => {
    setRows([...rows, createRow(sizes)]);
  };

  const removeRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const selectFields: Record<string, string[]> = {
    Factory: ["Factory A", "Factory B", "Factory C"],
    Season: ["Summer", "Winter", "Spring"],
    Intake: ["2024", "2025", "2026"],
    "Product Group": ["Menswear", "Womenswear"],
    "Sub-class": ["Shirts", "Pants", "Jackets"],
    Buyer: ["John", "David", "Alex"],
    "Buyer Assistant": ["Sam", "Leo", "Mark"],
    "Shipment Type": ["Air", "Sea"],
  };

  const renderField = (label: string) => {
    if (selectFields[label]) {
      return (
        <div className="relative">
          <select className="w-full appearance-none bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded pr-8">
            <option value="">{label}</option>
            {selectFields[label].map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      );
    }

    return (
      <input
        placeholder={label}
        className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded"
      />
    );
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">

      {/* HEADER */}
      <div className="bg-[#17b3a3] px-8 py-3 flex justify-between">
        <h1 className="text-lg font-semibold">Guhaya Sourcing</h1>
        <p className="text-sm">merch1@mrsgarments.com</p>
      </div>

      <div className="p-8 space-y-10">

        {/* MODEL SECTION */}
        <div className="flex gap-12">

          {/* LEFT: NAME + IMAGE */}
          <div className="w-64 flex flex-col gap-6">
            <input
              placeholder="Model Name"
              className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded"
            />

            <label className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl h-52 flex flex-col items-center justify-center cursor-pointer hover:border-[#17b3a3]">
              <Upload size={20} className="text-gray-400" />
              <span className="text-xs text-gray-500 mt-2">Upload Model</span>
              <input type="file" className="hidden" />
            </label>
          </div>

          {/* RIGHT: DETAILS */}
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
              className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded"
            />

            <input
              placeholder="Order Qty"
              className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded"
            />

            <input
              placeholder="Order Value"
              className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded"
            />

            <input
              type="number"
              value={sizes}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded"
            />
          </div>
        </div>

        {/* QUANTITY TABLE */}
        <div>
          <h2 className="mb-3 text-gray-300">Quantity Details</h2>

          <div
            className="grid gap-3 mb-3 text-sm text-gray-400"
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
              className="grid gap-3 mb-2"
              style={{
                gridTemplateColumns: `repeat(${sizes + 5}, minmax(0,1fr))`,
              }}
            >
              <input className="bg-[#1a1a1a] border border-[#2a2a2a] p-2 rounded" />
              <input className="bg-[#1a1a1a] border border-[#2a2a2a] p-2 rounded" />
              <input className="bg-[#1a1a1a] border border-[#2a2a2a] p-2 rounded" />

              {row.sizes.map((_: any, i: number) => (
                <input
                  key={i}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] p-2 rounded"
                />
              ))}

              <input className="bg-[#1a1a1a] border border-[#2a2a2a] p-2 rounded" />
              <input className="bg-[#1a1a1a] border border-[#2a2a2a] p-2 rounded" />

              <button onClick={() => removeRow(rowIndex)}>
                <Trash2 size={16} className="text-gray-400 hover:text-red-400" />
              </button>
            </div>
          ))}

          <button
            onClick={addRow}
            className="mt-4 bg-[#17b3a3] text-black px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={14} /> Add Order
          </button>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4">
          <button className="border border-gray-600 px-6 py-2 rounded">
            DELETE
          </button>
          <button className="border border-gray-600 px-6 py-2 rounded">
            EDIT
          </button>
          <button className="bg-[#17b3a3] text-black px-6 py-2 rounded">
            CREATE MODEL
          </button>
        </div>
      </div>
    </main>
  );
}

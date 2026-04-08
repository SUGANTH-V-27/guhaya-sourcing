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

  // smaller + consistent inputs
  const baseInput =
    "w-full h-8 bg-[#1a1a1a] border border-[#00BFA5]/60 px-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#00BFA5]/60";

  const renderField = (label: string) => {
    if (selectFields[label]) {
      return (
        <div className="relative">
          <select className={`appearance-none ${baseInput} pr-6`}>
            <option value="">{label}</option>
            {selectFields[label].map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>

          <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
            <ChevronDown className="text-gray-400" size={12} />
          </span>
        </div>
      );
    }

    return <input placeholder={label} className={baseInput} />;
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">

      <div className="bg-[#00BFA5] px-8 py-3 flex justify-between items-center shrink-0">
        <h1 className="text-white text-lg font-semibold">
          Guhaya Sourcing
        </h1>

        <div className="flex items-center gap-3 text-white text-sm">
          merch1@mrsgarments.com
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
            <span className="text-[#00BFA5] text-xs font-bold">M</span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10">

        {/* MODEL DETAILS */}
        <div>
          <h2 className="mb-5 text-gray-300">Model Details</h2>

          {/* LEFT + RIGHT LAYOUT */}
          <div className="flex gap-10 items-start">

            {/* LEFT SIDE */}
            <div className="flex flex-col gap-4 w-60">
              <input placeholder="Model Name" className={baseInput} />

              <label className="w-full h-36 bg-[#1a1a1a] border border-[#00BFA5]/60 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#00BFA5]">
                <Upload size={16} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 mt-1">Upload</span>
                <input type="file" className="hidden" />
              </label>
            </div>

            {/* RIGHT SIDE FORM */}
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

              <input placeholder="PO Date" className={baseInput} />
              <input placeholder="Order Qty" className={baseInput} />
              <input placeholder="Order Value" className={baseInput} />

              <input
                type="number"
                value={sizes}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className={baseInput}
              />
            </div>
          </div>
        </div>

        {/* QUANTITY */}
        <div>
          <h2 className="mb-3 text-gray-300">Quantity Details</h2>

          <div
            className="grid gap-6 mb-3 text-xs text-gray-400"
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
              <input className={baseInput} />
              <input className={baseInput} />
              <input className={baseInput} />

              {row.sizes.map((_: any, i: number) => (
                <input key={i} className={baseInput} />
              ))}

              <input className={baseInput} />
              <input className={baseInput} />

              <button onClick={() => removeRow(rowIndex)}>
                <Trash2 size={12} className="text-gray-400 hover:text-red-400" />
              </button>
            </div>
          ))}

          <button
            onClick={addRow}
            className="mt-4 bg-[#17b3a3] text-black px-4 py-2 rounded flex items-center gap-2 text-sm"
          >
            <Plus size={12} /> Add Order
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button className="border border-gray-600 px-6 py-2 rounded text-sm">DELETE</button>
          <button className="border border-gray-600 px-6 py-2 rounded text-sm">EDIT</button>
          <button className="bg-[#17b3a3] text-black px-6 py-2 rounded text-sm">CREATE MODEL</button>
        </div>
      </div>
    </main>
  );
}

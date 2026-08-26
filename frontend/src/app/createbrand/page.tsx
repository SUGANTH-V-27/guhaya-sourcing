"use client";

import { JSX, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Upload } from "lucide-react";
import { SourcingShell } from "@/components/layout/SourcingShell";
import { BrandsApi } from "@/lib/api/brands-api";

type BrandColumns = {
  seasons: string[];
  intake: string[];
  shipment: string[];
  dcType: string[];
  dcPort: string[];
};

type BuyerRow = {
  department: string;
  subclass: string;
  buyer: string;
  assistant: string;
  manager: string;
};

type FactoryRow = {
  code: string;
  name: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
};

export default function CreateBrandPage(): JSX.Element {
  const router = useRouter();
  const buyerEndRef = useRef<HTMLDivElement | null>(null);
  const factoryEndRef = useRef<HTMLDivElement | null>(null);

  const [brandName, setBrandName] = useState<string>("");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [brandColumns, setBrandColumns] = useState<BrandColumns>({
    seasons: ["Summer"],
    intake: ["2025"],
    shipment: ["Air"],
    dcType: ["Primary"],
    dcPort: ["Chennai"],
  });

  const [rows, setRows] = useState<BuyerRow[]>([
    {
      department: "Menswear",
      subclass: "Shirts",
      buyer: "John",
      assistant: "Alex",
      manager: "David",
    },
  ]);

  const [factoryRows, setFactoryRows] = useState<FactoryRow[]>([
    {
      code: "F001",
      name: "ABC Factory",
      address: "Chennai",
      gstin: "",
      state: "TAMILNADU",
      stateCode: "33",
    },
  ]);

  const brandConfig: { key: keyof BrandColumns; label: string }[] = [
    { key: "seasons", label: "Seasons" },
    { key: "intake", label: "Intake" },
    { key: "shipment", label: "Shipment" },
    { key: "dcType", label: "DC Type" },
    { key: "dcPort", label: "DC Port" },
  ];

  const addBrandItem = (key: keyof BrandColumns) => {
    setBrandColumns((prev) => ({
      ...prev,
      [key]: [...prev[key], ""],
    }));
  };

  const removeBrandItem = (key: keyof BrandColumns, index: number) => {
    if (brandColumns[key].length === 1) return;
    const updated = [...brandColumns[key]];
    updated.splice(index, 1);
    setBrandColumns({ ...brandColumns, [key]: updated });
  };

  const handleBrandChange = (
    key: keyof BrandColumns,
    index: number,
    value: string
  ) => {
    const updated = [...brandColumns[key]];
    updated[index] = value;
    setBrandColumns({ ...brandColumns, [key]: updated });
  };

  const addRow = () => {
    setRows((prev) => {
      const updated = [
        ...prev,
        {
          department: "",
          subclass: "",
          buyer: "",
          assistant: "",
          manager: "",
        },
      ];

      setTimeout(() => {
        buyerEndRef.current?.scrollIntoView({
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

  const handleChange = (
    index: number,
    field: keyof BuyerRow,
    value: string
  ) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addFactoryRow = () => {
    setFactoryRows((prev) => {
      const updated = [
        ...prev,
        { code: "", name: "", address: "", gstin: "", state: "", stateCode: "" },
      ];

      setTimeout(() => {
        factoryEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      return updated;
    });
  };

  const removeFactoryRow = (index: number) => {
    if (factoryRows.length === 1) return;
    const updated = [...factoryRows];
    updated.splice(index, 1);
    setFactoryRows(updated);
  };

  const handleFactoryChange = (
    index: number,
    field: keyof FactoryRow,
    value: string
  ) => {
    const updated = [...factoryRows];
    updated[index][field] = value;
    setFactoryRows(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBrand = async () => {
    if (!brandName.trim()) {
      setError("Please enter a Brand Name.");
      return;
    }
    setError(null);
    setIsSaving(true);

    try {
      const id = brandName.toLowerCase().replace(/[^a-z0-9]/g, "") || `brand_${Date.now()}`;
      await BrandsApi.create({
        id,
        name: brandName.trim(),
        description: `Buyer account for ${brandName.trim()}`,
        logoUrl: logoPreview || "",
        totalModels: 0,
        activeOrders: 0,
      });

      router.push(`/brands/${id}`);
    } catch (err: any) {
      console.error("Failed to save brand:", err);
      setError(err?.message || "Failed to save brand. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const headers: string[] = [
    "Department",
    "Subclass",
    "Buyer",
    "Buyer Assistant",
    "Product Manager",
  ];

  const fields: (keyof BuyerRow)[] = [
    "department",
    "subclass",
    "buyer",
    "assistant",
    "manager",
  ];

  return (
    <SourcingShell fullHeight>
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-7 flex flex-col gap-10">
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-2.5 text-xs text-red-400 text-center">
            {error}
          </div>
        )}

        {/* BRAND DETAILS */}
        <div>
          <h2 className="text-sm text-gray-300 mb-5">Brand Details</h2>

          <div className="grid grid-cols-[180px_1fr] gap-8">
            {/* LEFT */}
            <div className="flex flex-col gap-4">
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Brand Name"
                className="bg-black border border-teal-500/40 rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-400"
              />

              <label className="bg-black border border-teal-500/40 rounded px-3 py-8 text-sm text-gray-400 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00BFA5] relative overflow-hidden">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo Preview" className="max-h-20 max-w-full object-contain" />
                ) : (
                  <>
                    <Upload size={18} />
                    <span className="text-xs">Upload Logo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>

            {/* RIGHT */}
            <div className="grid grid-cols-5 gap-6">
              {brandConfig.map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-gray-400">{label}</p>
                    <button
                      type="button"
                      onClick={() => addBrandItem(key)}
                      className="bg-[#00BFA5] text-black p-[5px] rounded hover:bg-[#0cae9d]"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {brandColumns[key].map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <input
                          value={item}
                          onChange={(e) =>
                            handleBrandChange(key, i, e.target.value)
                          }
                          className="w-full bg-black border border-teal-500/40 rounded px-3 py-2.5 text-sm text-white"
                        />

                        <button
                          type="button"
                          onClick={() => removeBrandItem(key, i)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Minus size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BUYER DETAILS */}
        <div>
          <h2 className="text-sm text-gray-300 mb-5">
            Department &amp; Buyer Details
          </h2>

          <div className="grid grid-cols-6 gap-6 mb-3">
            {headers.map((h) => (
              <p key={h} className="text-xs text-gray-400">
                {h}
              </p>
            ))}
            <div />
          </div>

          <div className="flex flex-col gap-4">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-6 gap-6">
                {fields.map((field) => (
                  <input
                    key={field}
                    value={row[field]}
                    onChange={(e) =>
                      handleChange(i, field, e.target.value)
                    }
                    className="bg-black border border-teal-500/40 rounded px-3 py-2.5 text-sm text-white"
                  />
                ))}

                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="flex items-center justify-center text-gray-400 hover:text-red-400"
                >
                  <Minus size={16} />
                </button>
              </div>
            ))}

            <div ref={buyerEndRef} />
          </div>

          <div className="pt-4 flex justify-start">
            <button
              type="button"
              onClick={addRow}
              className="bg-[#00BFA5] text-black px-5 py-2 text-sm rounded flex items-center gap-2 font-medium hover:bg-[#0cae9d]"
            >
              <Plus size={14} /> Add Buyer Details
            </button>
          </div>
        </div>

        {/* FACTORY DETAILS */}
        <div>
          <h2 className="text-sm text-gray-300 mb-5">
            Factory Details
          </h2>

          <div className="grid grid-cols-7 gap-4 mb-3">
            {[
              "Factory Code",
              "Factory",
              "Factory Address",
              "GSTIN",
              "State",
              "Code",
            ].map((h) => (
              <p key={h} className="text-xs text-gray-400">
                {h}
              </p>
            ))}
            <div />
          </div>

          <div className="flex flex-col gap-4">
            {factoryRows.map((row, i) => (
              <div key={i} className="grid grid-cols-7 gap-4">
                <input
                  value={row.code}
                  onChange={(e) =>
                    handleFactoryChange(i, "code", e.target.value)
                  }
                  className="bg-black border border-teal-500/40 rounded px-3 py-2.5 text-sm text-white"
                />
                <input
                  value={row.name}
                  onChange={(e) =>
                    handleFactoryChange(i, "name", e.target.value)
                  }
                  className="bg-black border border-teal-500/40 rounded px-3 py-2.5 text-sm text-white"
                />
                <input
                  value={row.address}
                  onChange={(e) =>
                    handleFactoryChange(i, "address", e.target.value)
                  }
                  className="bg-black border border-teal-500/40 rounded px-3 py-2.5 text-sm text-white"
                />
                <input
                  value={row.gstin}
                  onChange={(e) =>
                    handleFactoryChange(i, "gstin", e.target.value)
                  }
                  placeholder="GSTIN"
                  className="bg-black border border-teal-500/40 rounded px-3 py-2.5 text-sm text-white"
                />
                <input
                  value={row.state}
                  onChange={(e) =>
                    handleFactoryChange(i, "state", e.target.value)
                  }
                  placeholder="State"
                  className="bg-black border border-teal-500/40 rounded px-3 py-2.5 text-sm text-white"
                />
                <input
                  value={row.stateCode}
                  onChange={(e) =>
                    handleFactoryChange(i, "stateCode", e.target.value)
                  }
                  placeholder="Code"
                  className="bg-black border border-teal-500/40 rounded px-3 py-2.5 text-sm text-white"
                />

                <button
                  type="button"
                  onClick={() => removeFactoryRow(i)}
                  className="flex items-center justify-center text-gray-400 hover:text-red-400"
                >
                  <Minus size={16} />
                </button>
              </div>
            ))}

            <div ref={factoryEndRef} />
          </div>

          <div className="pt-4 flex justify-start">
            <button
              type="button"
              onClick={addFactoryRow}
              className="bg-[#00BFA5] text-black px-5 py-2 text-sm rounded flex items-center gap-2 font-medium hover:bg-[#0cae9d]"
            >
              <Plus size={14} /> Add Factory
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={() => router.push("/brands")}
          className="rounded-md border border-gray-600 px-6 py-2 text-sm text-gray-300 hover:bg-gray-800"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={handleSaveBrand}
          disabled={isSaving}
          className="rounded-md bg-[#00BFA5] px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#0cae9d] disabled:opacity-50"
        >
          {isSaving ? "SAVING..." : "SAVE BRAND"}
        </button>
      </div>
    </SourcingShell>
  );
}

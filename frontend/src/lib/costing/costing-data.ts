import { db } from "../db/db-client";

export type CostingRow = {
  id: string;
  label: string;
  value: number;
  detail?: string;
};

export type GarmentSection = {
  id: string;
  sectionName?: string;
  fabricCostRows: CostingRow[];
  wastagePercent: number;
  garmentCostRows: CostingRow[];
  overheadsProfitPercent: number;
};

export type CostSheet = {
  id: string;
  brand: string;
  brandName?: string;
  name: string; // Style name
  styleNo: string;
  modelCode?: string;
  modelName?: string;
  image?: string;
  fabricComposition: string;
  gsm: string;
  currency: "INR" | "USD" | "EUR" | "GBP" | string;
  exchangeRate: number; // e.g. 87.5 for INR/USD
  targetQuantity?: number;
  garmentCount: number;
  garmentSections: GarmentSection[];
  totalCost?: number;
  finalPrice?: number;
  usdFinalPrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_FABRIC_COST_ROWS: CostingRow[] = [
  { id: "fab-1", label: "Yarn Cost (per kg)", value: 0, detail: "" },
  { id: "fab-2", label: "Knitting Charges", value: 0, detail: "" },
  { id: "fab-3", label: "Dyeing / Bio-wash", value: 0, detail: "" },
  { id: "fab-4", label: "Compacting & Stenter", value: 0, detail: "" },
  { id: "fab-5", label: "Printing / All-over", value: 0, detail: "" },
];

export const DEFAULT_GARMENT_COST_ROWS: CostingRow[] = [
  { id: "gar-1", label: "Fabric", value: 0, detail: "" },
  { id: "gar-2", label: "Stitching & Making (CMT)", value: 0, detail: "" },
  { id: "gar-3", label: "Chest Print / Embroidery", value: 0, detail: "" },
  { id: "gar-4", label: "Trims & Accessories", value: 0, detail: "" },
  { id: "gar-5", label: "Packaging & Polybag", value: 0, detail: "" },
  { id: "gar-6", label: "Testing & Inspection", value: 0, detail: "" },
  { id: "gar-7", label: "Freight & Forwarding", value: 0, detail: "" },
];

export function createNewGarmentSection(name?: string): GarmentSection {
  return {
    id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sectionName: name || "Main Garment",
    fabricCostRows: JSON.parse(JSON.stringify(DEFAULT_FABRIC_COST_ROWS)),
    wastagePercent: 0,
    garmentCostRows: JSON.parse(JSON.stringify(DEFAULT_GARMENT_COST_ROWS)),
    overheadsProfitPercent: 0,
  };
}

export function calcFabricCostSummary(fabricRows: CostingRow[], wastagePercent: number): {
  subtotal: number;
  wastageAmount: number;
  totalPerKg: number;
} {
  const subtotal = fabricRows.reduce((sum, r) => sum + (Number(r.value) || 0), 0);
  const wastageAmount = Math.round((subtotal * (Number(wastagePercent) || 0)) / 100);
  const totalPerKg = subtotal + wastageAmount;
  return { subtotal, wastageAmount, totalPerKg };
}

export function calcGarmentSectionCost(section: GarmentSection): {
  fabricCostPerKg: number;
  fabricCostPerPc: number;
  manufacturingTotal: number;
  overheadsProfitAmount: number;
  sectionTotalInr: number;
} {
  const { totalPerKg } = calcFabricCostSummary(section.fabricCostRows, section.wastagePercent);
  
  let fabricCostPerPc = 0;
  let manufacturingTotal = 0;

  for (const row of section.garmentCostRows) {
    if (row.label.toLowerCase().includes("fabric")) {
      const consumptionKg = parseFloat(row.detail || "0") || 0;
      fabricCostPerPc = Math.round(totalPerKg * consumptionKg);
      manufacturingTotal += fabricCostPerPc;
    } else {
      manufacturingTotal += (Number(row.value) || 0);
    }
  }

  const overheadsProfitAmount = Math.round(
    (manufacturingTotal * (Number(section.overheadsProfitPercent) || 0)) / 100
  );
  const sectionTotalInr = manufacturingTotal + overheadsProfitAmount;

  return {
    fabricCostPerKg: totalPerKg,
    fabricCostPerPc,
    manufacturingTotal,
    overheadsProfitAmount,
    sectionTotalInr,
  };
}

export function calcTotalCostSheet(costSheet: CostSheet): {
  totalInr: number;
  totalConverted: number;
  breakdown: Array<{
    sectionName: string;
    totalInr: number;
    fabricCostPerPc: number;
  }>;
} {
  const breakdown = costSheet.garmentSections.map((sec, idx) => {
    const res = calcGarmentSectionCost(sec);
    return {
      sectionName: sec.sectionName || `Garment Part ${idx + 1}`,
      totalInr: res.sectionTotalInr,
      fabricCostPerPc: res.fabricCostPerPc,
    };
  });

  const totalInr = breakdown.reduce((sum, item) => sum + item.totalInr, 0);
  const rate = costSheet.currency === "INR" ? 1 : Number(costSheet.exchangeRate) || 87.5;
  const totalConverted = costSheet.currency === "INR" ? totalInr : (rate > 0 ? totalInr / rate : 0);

  return { totalInr, totalConverted, breakdown };
}

const STORAGE_KEY = "guhaya-costings";

export const INITIAL_MOCK_COSTINGS: CostSheet[] = [];

export function loadCostings(): CostSheet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function loadCostingsAsync(): Promise<CostSheet[]> {
  try {
    const dbData = await db.costingSheets.getAll();
    if (dbData && Array.isArray(dbData)) {
      const mapped: CostSheet[] = dbData.map((d: any) => ({
        id: d.id,
        brand: d.brand || "",
        name: d.styleName || d.name || "",
        styleNo: d.styleCode || d.styleNo || "",
        fabricComposition: d.fabricComposition || "",
        gsm: d.gsm || "",
        currency: d.currency || "USD",
        exchangeRate: Number(d.exchangeRate) || 0,
        targetQuantity: Number(d.orderQuantity || d.targetQuantity) || 0,
        garmentCount: Number(d.garmentCount) || 1,
        garmentSections: Array.isArray(d.garmentSections) ? d.garmentSections : [],
        usdFinalPrice: Number(d.totalFobPrice || d.usdFinalPrice) || 0,
        image: d.image || undefined,
        createdAt: d.createdAt || new Date().toISOString(),
        updatedAt: d.updatedAt || new Date().toISOString(),
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
      return mapped;
    }
  } catch {}
  return loadCostings();
}

export function saveCostings(costings: CostSheet[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(costings));
}

export function getCostingById(id: string): CostSheet | undefined {
  const list = loadCostings();
  return list.find((c) => c.id === id);
}

export async function saveOrUpdateCosting(costSheet: CostSheet): Promise<void> {
  const list = loadCostings();
  const existingIdx = list.findIndex((c) => c.id === costSheet.id);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...costSheet, updatedAt: new Date().toISOString() };
    saveCostings(list);
    try {
      await db.costingSheets.update(costSheet.id, costSheet);
    } catch {}
  } else {
    list.unshift({
      ...costSheet,
      createdAt: costSheet.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveCostings(list);
    try {
      await db.costingSheets.insert(costSheet);
    } catch {}
  }
}

export async function deleteCosting(id: string): Promise<boolean> {
  const list = loadCostings().filter((c) => c.id !== id);
  saveCostings(list);
  try {
    await db.costingSheets.delete(id);
  } catch {}
  return true;
}

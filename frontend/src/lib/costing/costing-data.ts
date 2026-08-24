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
  name: string; // Style name
  styleNo: string;
  fabricComposition: string;
  gsm: string;
  currency: "INR" | "USD" | "EUR" | "GBP";
  exchangeRate: number; // e.g. 87.5 for INR/USD
  targetQuantity?: number;
  garmentCount: number;
  garmentSections: GarmentSection[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_FABRIC_COST_ROWS: CostingRow[] = [
  { id: "fab-1", label: "Yarn Cost (per kg)", value: 240, detail: "100% Combed Cotton 30s" },
  { id: "fab-2", label: "Knitting Charges", value: 35, detail: "Single Jersey 24 Gauge" },
  { id: "fab-3", label: "Dyeing / Bio-wash", value: 85, detail: "Reactive Soft Dyeing" },
  { id: "fab-4", label: "Compacting & Stenter", value: 20, detail: "Controlled Shrinkage" },
  { id: "fab-5", label: "Printing / All-over", value: 0, detail: "Solid color" },
];

export const DEFAULT_GARMENT_COST_ROWS: CostingRow[] = [
  { id: "gar-1", label: "Fabric", value: 0, detail: "0.260 kg per piece" },
  { id: "gar-2", label: "Stitching & Making (CMT)", value: 55, detail: "Crew neck tee assembly" },
  { id: "gar-3", label: "Chest Print / Embroidery", value: 18, detail: "Screen print 2 colors" },
  { id: "gar-4", label: "Trims & Accessories", value: 12, detail: "Main label, size, care, hangtag" },
  { id: "gar-5", label: "Packaging & Polybag", value: 8, detail: "Individual polybag + master carton" },
  { id: "gar-6", label: "Testing & Inspection", value: 4, detail: "AQL 2.5 internal audit" },
  { id: "gar-7", label: "Freight & Forwarding", value: 6, detail: "Local warehouse dispatch" },
];

export function createNewGarmentSection(name?: string): GarmentSection {
  return {
    id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sectionName: name || "Main Garment",
    fabricCostRows: JSON.parse(JSON.stringify(DEFAULT_FABRIC_COST_ROWS)),
    wastagePercent: 7,
    garmentCostRows: JSON.parse(JSON.stringify(DEFAULT_GARMENT_COST_ROWS)),
    overheadsProfitPercent: 12,
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
      const consumptionKg = parseFloat(row.detail || "0.25") || 0;
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
  const totalConverted = costSheet.currency === "INR" ? totalInr : totalInr / rate;

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

export function saveCostings(costings: CostSheet[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(costings));
}

export function getCostingById(id: string): CostSheet | undefined {
  const list = loadCostings();
  return list.find((c) => c.id === id);
}

export function saveOrUpdateCosting(costSheet: CostSheet) {
  const list = loadCostings();
  const existingIdx = list.findIndex((c) => c.id === costSheet.id);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...costSheet, updatedAt: new Date().toISOString() };
  } else {
    list.unshift({
      ...costSheet,
      createdAt: costSheet.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  saveCostings(list);
}

export function deleteCosting(id: string) {
  const list = loadCostings().filter((c) => c.id !== id);
  saveCostings(list);
}

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
  fabricType?: string;
  gsm: string;
  currency: "INR" | "USD" | "EUR" | "GBP" | string;
  exchangeRate: number; // e.g. 87.5 for INR/USD
  targetQuantity?: number;
  garmentCount: number;
  garmentSections: GarmentSection[];
  totalCost?: number;
  finalPrice?: number;
  totalFobPrice?: number;
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

function coerceNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value ?? fallback);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeCostingRows(rows: unknown, fallback: CostingRow[] = []): CostingRow[] {
  if (!Array.isArray(rows)) return fallback;

  return rows.map((row: any, index: number) => {
    const item = row?.label ?? row?.item ?? `Row ${index + 1}`;
    const detail = row?.detail ?? row?.notes ?? "";
    const value = coerceNumber(row?.value ?? row?.amount ?? 0, 0);

    return {
      id: row?.id ?? `${item}-${index}`,
      label: item,
      value,
      detail,
    };
  });
}

function normalizeGarmentSection(section: any, index: number): GarmentSection {
  const fabricRows = normalizeCostingRows(
    section?.fabricCostRows ?? section?.fabricRows ?? section?.fabric ?? [],
    DEFAULT_FABRIC_COST_ROWS.map((row) => ({ ...row }))
  );
  const garmentRows = normalizeCostingRows(
    section?.garmentCostRows ?? section?.garmentRows ?? section?.garment ?? [],
    DEFAULT_GARMENT_COST_ROWS.map((row) => ({ ...row }))
  );

  return {
    id: section?.id ?? `sec-${index + 1}`,
    sectionName: section?.sectionName ?? section?.name ?? `Garment ${index + 1}`,
    fabricCostRows: fabricRows,
    wastagePercent: coerceNumber(section?.wastagePercent ?? section?.wastagePct ?? 0, 0),
    garmentCostRows: garmentRows,
    overheadsProfitPercent: coerceNumber(
      section?.overheadsProfitPercent ?? section?.overheadPct ?? section?.overheadsProfit ?? 0,
      0
    ),
  };
}

export function normalizeCostingRecord(raw: any): CostSheet {
  const breakdown = raw?.breakdownJson && typeof raw.breakdownJson === "object" ? raw.breakdownJson : {};
  const rawSections = Array.isArray(raw?.garmentSections)
    ? raw.garmentSections
    : Array.isArray(breakdown?.garmentSections)
      ? breakdown.garmentSections
      : Array.isArray(raw?.sections)
        ? raw.sections
        : Array.isArray(breakdown?.sections)
          ? breakdown.sections
          : Array.isArray(raw?.breakdownJson)
            ? raw.breakdownJson
            : [];

  const garmentSections = rawSections.length
    ? rawSections.map((section: any, index: number) => normalizeGarmentSection(section, index))
    : [];

  const brand = raw?.brand || breakdown?.brand || raw?.brandName || breakdown?.brandName || "Brand";
  const name = raw?.styleName || raw?.name || breakdown?.name || "Untitled Costing";
  const styleNo = raw?.styleCode || raw?.styleNo || breakdown?.styleNo || "STYLE";
  const createdAt = raw?.createdAt || raw?.created_at || breakdown?.createdAt || new Date().toISOString();

  return {
    id: raw?.id || `cost-${Date.now()}`,
    brand,
    brandName: raw?.brandName || brand,
    name,
    styleNo,
    modelCode: raw?.modelCode || breakdown?.modelCode || "",
    modelName: raw?.modelName || breakdown?.modelName || name,
    image: raw?.image || breakdown?.image || undefined,
    fabricComposition: raw?.fabricComposition || breakdown?.fabricComposition || "",
    fabricType: raw?.fabricType || breakdown?.fabricType || "",
    gsm: raw?.gsm || breakdown?.gsm || "",
    currency: raw?.currency || breakdown?.currency || "USD",
    exchangeRate: coerceNumber(raw?.exchangeRate ?? breakdown?.exchangeRate ?? 0, 0),
    targetQuantity: coerceNumber(raw?.orderQuantity ?? raw?.targetQuantity ?? breakdown?.targetQuantity ?? 0, 0),
    garmentCount: coerceNumber(
      raw?.garmentCount ?? breakdown?.garmentCount ?? (garmentSections.length || 1),
      1
    ),
    garmentSections,
    totalCost: coerceNumber(raw?.totalCost ?? breakdown?.totalCost ?? 0, 0),
    finalPrice: coerceNumber(raw?.finalPrice ?? breakdown?.finalPrice ?? 0, 0),
    totalFobPrice: coerceNumber(raw?.totalFobPrice ?? raw?.usdFinalPrice ?? breakdown?.totalFobPrice ?? breakdown?.usdFinalPrice ?? 0, 0),
    usdFinalPrice: coerceNumber(raw?.usdFinalPrice ?? raw?.totalFobPrice ?? breakdown?.usdFinalPrice ?? breakdown?.totalFobPrice ?? 0, 0),
    notes: raw?.notes || breakdown?.notes || "",
    createdAt,
    updatedAt: raw?.updatedAt || raw?.updated_at || breakdown?.updatedAt || createdAt,
  };
}

export function serializeCostingForPersistence(costSheet: CostSheet): Record<string, any> {
  const normalizedBreakdown = {
    brand: costSheet.brand,
    brandName: costSheet.brandName || costSheet.brand,
    name: costSheet.name,
    styleNo: costSheet.styleNo,
    fabricComposition: costSheet.fabricComposition,
    fabricType: costSheet.fabricType,
    gsm: costSheet.gsm,
    currency: costSheet.currency,
    exchangeRate: costSheet.exchangeRate,
    targetQuantity: costSheet.targetQuantity,
    garmentCount: costSheet.garmentCount,
    image: costSheet.image,
    totalCost: costSheet.totalCost,
    totalFobPrice: costSheet.totalFobPrice,
    usdFinalPrice: costSheet.usdFinalPrice,
    finalPrice: costSheet.finalPrice,
    notes: costSheet.notes,
    garmentSections: costSheet.garmentSections,
  };

  return {
    id: costSheet.id,
    brand: costSheet.brand || "Brand",
    brandName: costSheet.brandName || costSheet.brand || "Brand",
    styleName: costSheet.name || "Untitled Costing",
    styleCode: costSheet.styleNo || "STYLE",
    name: costSheet.name || "Untitled Costing",
    modelCode: costSheet.modelCode || "",
    modelName: costSheet.modelName || costSheet.name || "Untitled Costing",
    fabricComposition: costSheet.fabricComposition,
    fabricType: costSheet.fabricType,
    gsm: costSheet.gsm,
    currency: costSheet.currency || "USD",
    exchangeRate: costSheet.exchangeRate,
    targetQuantity: costSheet.targetQuantity,
    orderQuantity: costSheet.targetQuantity || costSheet.garmentCount || 0,
    garmentCount: costSheet.garmentCount,
    garmentSections: costSheet.garmentSections,
    totalCost: costSheet.totalCost,
    totalFobPrice: costSheet.totalFobPrice,
    usdFinalPrice: costSheet.usdFinalPrice,
    finalPrice: costSheet.finalPrice,
    image: costSheet.image,
    notes: costSheet.notes,
    breakdownJson: normalizedBreakdown,
    createdAt: costSheet.createdAt,
    updatedAt: costSheet.updatedAt,
  };
}

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
      const mapped: CostSheet[] = dbData.map((d: any) => normalizeCostingRecord(d));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
      return mapped;
    }
  } catch (error) {
    console.warn("Failed to load costings from backend:", error);
    return [];
  }
  return [];
}

export function saveCostings(costings: CostSheet[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(costings));
}

export function getCostingById(id: string): CostSheet | undefined {
  const list = loadCostings();
  return list.find((c) => c.id === id);
}

export async function getCostingByIdAsync(id: string): Promise<CostSheet | undefined> {
  const record = await db.costingSheets.getById(id);
  if (!record) return undefined;
  return normalizeCostingRecord(record);
}

export async function saveOrUpdateCosting(costSheet: CostSheet): Promise<void> {
  const persisted = serializeCostingForPersistence(costSheet);
  const existingIdx = loadCostings().findIndex((c) => c.id === costSheet.id);
  if (existingIdx >= 0) {
    await db.costingSheets.update(costSheet.id, persisted);
  } else {
    await db.costingSheets.insert(persisted);
  }
  saveCostings([normalizeCostingRecord(persisted), ...loadCostings().filter((item) => item.id !== costSheet.id)]);
}

export async function deleteCosting(id: string): Promise<boolean> {
  await db.costingSheets.delete(id);
  saveCostings(loadCostings().filter((c) => c.id !== id));
  return true;
}

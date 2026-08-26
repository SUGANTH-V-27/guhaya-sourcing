import { db } from "../config/db.js";
import { CostSheet } from "../types/index.js";

export class CostingService {
  async getAll(): Promise<CostSheet[]> {
    return (await db.costSheets.select()) as CostSheet[];
  }

  async getById(id: string): Promise<CostSheet | null> {
    return (await db.costSheets.selectById(id)) as CostSheet | null;
  }

  async create(data: Partial<CostSheet>): Promise<CostSheet> {
    const id = data.id || `cost_${Date.now()}`;
    const fabricCost = Number(data.fabricCost) || 0;
    const trimsCost = Number(data.trimsCost) || 0;
    const cmCost = Number(data.cmCost) || 0;
    const washCost = Number(data.washCost) || 0;
    const freightCost = Number(data.freightCost) || 0;
    const otherCost = Number(data.otherCost) || 0;
    const totalCost = Number(data.totalCost) || (fabricCost + trimsCost + cmCost + washCost + freightCost + otherCost);
    const marginPercent = Number(data.marginPercent) || 15;
    const finalPrice = Number(data.finalPrice) || (totalCost * (1 + marginPercent / 100));

    const newCosting = await db.costSheets.insert({
      ...data,
      id,
      modelCode: data.modelCode || `STYLE-${Date.now().toString().slice(-4)}`,
      modelName: data.modelName || "Garment Style",
      fabricCost,
      trimsCost,
      cmCost,
      washCost,
      freightCost,
      otherCost,
      totalCost,
      marginPercent,
      finalPrice,
      usdFinalPrice: Number(data.usdFinalPrice) || finalPrice,
      status: data.status || "Draft",
    });

    return newCosting as CostSheet;
  }

  async update(id: string, updates: Partial<CostSheet>): Promise<CostSheet | null> {
    return (await db.costSheets.update(id, updates)) as CostSheet | null;
  }

  async delete(id: string): Promise<boolean> {
    return await db.costSheets.delete(id);
  }
}

export const costingService = new CostingService();

import { db } from "../config/db.js";

export class CostingService {
  async getAll() {
    return await db.costSheets.findMany();
  }

  async getById(id: string) {
    return await db.costSheets.findOne(id);
  }

  async create(data: any) {
    const id = data.id || `cost_${Date.now()}`;
    const fabricCost = Number(data.fabricCost) || 0;
    const trimsCost = Number(data.trimsCost) || 0;
    const cmCost = Number(data.cmCost) || 0;
    const printEmbroideryCost = Number(data.printEmbroideryCost || data.printCost) || 0;
    const washFinishCost = Number(data.washFinishCost || data.washCost) || 0;
    const packagingCost = Number(data.packagingCost) || 0;
    const commercialTransportCost = Number(data.commercialTransportCost || data.freightCost) || 0;
    const subtotalCost = Number(data.subtotalCost) || (fabricCost + trimsCost + cmCost + printEmbroideryCost + washFinishCost + packagingCost + commercialTransportCost);
    const marginPercentage = Number(data.marginPercentage || data.marginPercent) || 15;
    const marginAmount = Number(data.marginAmount) || (subtotalCost * marginPercentage / 100);
    const totalFobPrice = Number(data.totalFobPrice || data.finalPrice) || (subtotalCost + marginAmount);
    const targetFobPrice = Number(data.targetFobPrice) || totalFobPrice;
    const variance = Number(data.variance) || (totalFobPrice - targetFobPrice);

    return await db.costSheets.create({
      id,
      modelId: data.modelId || null,
      styleCode: data.styleCode || data.modelCode || `STYLE-${Date.now().toString().slice(-4)}`,
      styleName: data.styleName || data.modelName || "Garment Style",
      brand: data.brand || "Brand",
      season: data.season || "SS26",
      currency: data.currency || "USD",
      orderQuantity: Number(data.orderQuantity || data.qty) || 1000,
      fabricCost,
      trimsCost,
      cmCost,
      printEmbroideryCost,
      washFinishCost,
      packagingCost,
      commercialTransportCost,
      subtotalCost,
      marginPercentage,
      marginAmount,
      totalFobPrice,
      targetFobPrice,
      variance,
      status: data.status || "Draft",
    });
  }

  async update(id: string, updates: any) {
    return await db.costSheets.update(id, updates);
  }

  async delete(id: string) {
    return await db.costSheets.delete(id);
  }
}

export const costingService = new CostingService();

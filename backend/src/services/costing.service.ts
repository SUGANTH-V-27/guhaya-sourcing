import { db } from "../config/db.js";

function normalizeCostingPayload(data: any) {
  const breakdown = data?.breakdownJson && typeof data.breakdownJson === "object" ? data.breakdownJson : {};
  const garmentSections = Array.isArray(data?.garmentSections)
    ? data.garmentSections
    : Array.isArray(breakdown?.garmentSections)
      ? breakdown.garmentSections
      : Array.isArray(data?.sections)
        ? data.sections
        : [];

  const styleName = data?.styleName || data?.name || breakdown?.name || "Garment Style";
  const styleCode = data?.styleCode || data?.styleNo || breakdown?.styleNo || `STYLE-${Date.now().toString().slice(-4)}`;
  const brand = data?.brand || data?.brandName || breakdown?.brand || breakdown?.brandName || "Brand";
  const currency = data?.currency || breakdown?.currency || "USD";
  const orderQuantity = Number(data?.orderQuantity ?? data?.targetQuantity ?? breakdown?.targetQuantity ?? 0) || 0;
  const garmentCount = Number(data?.garmentCount ?? breakdown?.garmentCount ?? (garmentSections.length || 1)) || 1;

  return {
    ...data,
    styleName,
    styleCode,
    brand,
    currency,
    orderQuantity,
    garmentCount,
    breakdownJson: {
      ...breakdown,
      brand,
      brandName: data?.brandName || brand,
      name: styleName,
      styleNo: styleCode,
      styleName,
      currency,
      orderQuantity,
      garmentCount,
      fabricComposition: data?.fabricComposition ?? breakdown?.fabricComposition ?? "",
      fabricType: data?.fabricType ?? breakdown?.fabricType ?? "",
      gsm: data?.gsm ?? breakdown?.gsm ?? "",
      exchangeRate: Number(data?.exchangeRate ?? breakdown?.exchangeRate ?? 0) || 0,
      targetQuantity: orderQuantity,
      image: data?.image ?? breakdown?.image ?? undefined,
      garmentSections,
      totalCost: Number(data?.totalCost ?? breakdown?.totalCost ?? 0) || 0,
      finalPrice: Number(data?.finalPrice ?? breakdown?.finalPrice ?? 0) || 0,
      totalFobPrice: Number(data?.totalFobPrice ?? data?.usdFinalPrice ?? breakdown?.totalFobPrice ?? breakdown?.usdFinalPrice ?? 0) || 0,
      usdFinalPrice: Number(data?.usdFinalPrice ?? data?.totalFobPrice ?? breakdown?.usdFinalPrice ?? breakdown?.totalFobPrice ?? 0) || 0,
      notes: data?.notes ?? breakdown?.notes ?? "",
    },
  };
}

export class CostingService {
  async getAll() {
    return await db.costSheets.findMany();
  }

  async getById(id: string) {
    return await db.costSheets.findOne(id);
  }

  async create(data: any) {
    const normalized = normalizeCostingPayload(data);
    const id = normalized.id || `cost_${Date.now()}`;
    const fabricCost = Number(normalized.fabricCost) || 0;
    const trimsCost = Number(normalized.trimsCost) || 0;
    const cmCost = Number(normalized.cmCost) || 0;
    const printEmbroideryCost = Number(normalized.printEmbroideryCost || normalized.printCost) || 0;
    const washFinishCost = Number(normalized.washFinishCost || normalized.washCost) || 0;
    const packagingCost = Number(normalized.packagingCost) || 0;
    const commercialTransportCost = Number(normalized.commercialTransportCost || normalized.freightCost) || 0;
    const subtotalCost = Number(normalized.subtotalCost) || (fabricCost + trimsCost + cmCost + printEmbroideryCost + washFinishCost + packagingCost + commercialTransportCost);
    const marginPercentage = Number(normalized.marginPercentage || normalized.marginPercent) || 15;
    const marginAmount = Number(normalized.marginAmount) || (subtotalCost * marginPercentage / 100);
    const totalFobPrice = Number(normalized.totalFobPrice || normalized.finalPrice) || (subtotalCost + marginAmount);
    const targetFobPrice = Number(normalized.targetFobPrice) || totalFobPrice;
    const variance = Number(normalized.variance) || (totalFobPrice - targetFobPrice);

    return await db.costSheets.create({
      id,
      modelId: normalized.modelId || null,
      styleCode: normalized.styleCode,
      styleName: normalized.styleName,
      brand: normalized.brand,
      season: normalized.season || "SS26",
      currency: normalized.currency,
      orderQuantity: normalized.orderQuantity || 0,
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
      status: normalized.status || "Draft",
      breakdownJson: normalized.breakdownJson,
    });
  }

  async update(id: string, updates: any) {
    const normalized = normalizeCostingPayload(updates);
    return await db.costSheets.update(id, {
      ...normalized,
      styleName: normalized.styleName,
      styleCode: normalized.styleCode,
      brand: normalized.brand,
      currency: normalized.currency,
      orderQuantity: normalized.orderQuantity,
      breakdownJson: normalized.breakdownJson,
    });
  }

  async delete(id: string) {
    return await db.costSheets.delete(id);
  }
}

export const costingService = new CostingService();

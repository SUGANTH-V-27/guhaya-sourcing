import { db } from "../config/db.js";
import { Model } from "../types/index.js";

export class ModelService {
  async getAll(brandId?: string): Promise<Model[]> {
    const query = brandId ? { brand_id: brandId } : undefined;
    let models = await db.models.select(query);
    if ((!models || models.length === 0) && brandId) {
      // Fallback check on camelCase brandId
      models = await db.models.select({ brandId });
    }
    return models as Model[];
  }

  async getById(id: string): Promise<Model | null> {
    const model = await db.models.selectById(id);
    return model as Model | null;
  }

  async create(data: Partial<Model>): Promise<Model> {
    const id = data.id || data.code || `model_${Date.now()}`;
    const newModel = await db.models.insert({
      ...data,
      id,
      code: data.code || id,
      name: data.name || "New Style",
      brandId: data.brandId || "soxo",
      brand_id: data.brandId || "soxo",
      status: data.status || "Pending",
      daysToHandover: data.daysToHandover || 0,
      image: data.image || data.imageUrl || "",
    });
    return newModel as Model;
  }

  async update(id: string, updates: Partial<Model>): Promise<Model | null> {
    const updated = await db.models.update(id, updates);
    return updated as Model | null;
  }

  async delete(id: string): Promise<boolean> {
    return await db.models.delete(id);
  }

  async getSubpageData(modelId: string, subpage: string) {
    switch (subpage) {
      case "purchase-order":
        return await db.purchaseOrders.select({ model_id: modelId });
      case "fabric-status":
        return await db.qcInspections.select({ modelId, inspectionType: "fabric-status" });
      case "measurement":
      case "measurements":
        return await db.qcInspections.select({ modelId, inspectionType: "measurements" });
      case "pattern-files":
      case "pattern":
        return await db.qcInspections.select({ modelId, inspectionType: "pattern" });
      case "trimming":
        return await db.trimmingBoms.select({ modelId });
      case "tna":
        return await db.tnaPlans.select({ modelId });
      case "daily-production-report":
        return await db.dailyProductionReports.select({ model_id: modelId });
      case "artwork":
        return await db.qcInspections.select({ modelId, inspectionType: "artwork" });
      case "documentation":
        return await db.qcInspections.select({ modelId, inspectionType: "documentation" });
      case "quality-check":
        return await db.qcInspections.select({ modelId });
      default:
        return [];
    }
  }

  async saveSubpageData(modelId: string, subpage: string, data: any) {
    const record = { ...data, model_id: modelId };
    switch (subpage) {
      case "purchase-order":
        return await db.purchaseOrders.insert(record);
      case "fabric-status":
        return await db.qcInspections.insert({ ...data, modelId, inspectionType: "fabric-status" });
      case "measurement":
      case "measurements":
        return await db.measurementSpecs.insert(record);
      case "pattern-files":
      case "pattern":
        return await db.qcInspections.insert({ ...data, modelId, inspectionType: "pattern" });
      case "trimming":
        return await db.trimmingBoms.insert({ ...data, modelId });
      case "tna":
        return await db.tnaPlans.insert({ ...data, modelId });
      case "daily-production-report":
        return await db.dailyProductionReports.insert(record);
      case "artwork":
        return await db.qcInspections.insert({ ...data, modelId, inspectionType: "artwork" });
      case "documentation":
        return await db.qcInspections.insert({ ...data, modelId, inspectionType: "documentation" });
      case "quality-check":
        return await db.qcInspections.insert({ ...data, modelId });
      default:
        throw new Error(`Unknown model subpage: ${subpage}`);
    }
  }

  async deleteSubpageData(subpage: string, recordId: string) {
    switch (subpage) {
      case "quality-check":
        return await db.qcInspections.delete(recordId);
      case "trimming":
        return await db.trimmingBoms.delete(recordId);
      case "tna":
        return await db.tnaPlans.delete(recordId);
      default:
        throw new Error(`Unknown model subpage: ${subpage}`);
    }
  }
}

export const modelService = new ModelService();

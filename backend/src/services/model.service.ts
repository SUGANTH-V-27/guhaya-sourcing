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
        return await db.fabricStatus.select({ model_id: modelId });
      case "measurement":
      case "measurements":
        return await db.measurementSpecs.select({ model_id: modelId });
      case "pattern-files":
      case "pattern":
        return await db.patternFiles.select({ model_id: modelId });
      case "trimming":
        return await db.trimmingItems.select({ model_id: modelId });
      case "tna":
        return await db.tnaActivities.select({ model_id: modelId });
      case "daily-production-report":
        return await db.dailyProductionReports.select({ model_id: modelId });
      case "artwork":
        return await db.artworkFiles.select({ model_id: modelId });
      case "documentation":
        return await db.documentationFiles.select({ model_id: modelId });
      case "quality-check":
        return await db.qualityCheckReports.select({ model_id: modelId });
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
        return await db.fabricStatus.insert(record);
      case "measurement":
      case "measurements":
        return await db.measurementSpecs.insert(record);
      case "pattern-files":
      case "pattern":
        return await db.patternFiles.insert(record);
      case "trimming":
        return await db.trimmingItems.insert(record);
      case "tna":
        return await db.tnaActivities.insert(record);
      case "daily-production-report":
        return await db.dailyProductionReports.insert(record);
      case "artwork":
        return await db.artworkFiles.insert(record);
      case "documentation":
        return await db.documentationFiles.insert(record);
      case "quality-check":
        return await db.qualityCheckReports.insert(record);
      default:
        throw new Error(`Unknown model subpage: ${subpage}`);
    }
  }
}

export const modelService = new ModelService();

import { db } from "../db/db-client";
import { modelService } from "../../../services/model.service";
import { api } from "../../../services/api";

export interface ModelEntity {
  id: string;
  brandId: string;
  code: string;
  name: string;
  category?: string;
  image?: string;
  daysToHandover?: number;
  status: "Pending" | "Shipped";
  factory?: string;
  targetFob?: number;
  imageUrl?: string;
  factoryId?: string;
  factoryName?: string;
}

function normalizeModel(model: any): ModelEntity {
  return {
    ...model,
    image: model.image || model.imageUrl || "",
    imageUrl: model.imageUrl || model.image || "",
    factory: model.factory || model.factoryName || "",
  };
}

export const ModelsApi = {
  async getAll(): Promise<ModelEntity[]> {
    return (await db.models.getAll()).map(normalizeModel);
  },

  async getByBrand(brandId: string): Promise<ModelEntity[]> {
    const models = await db.models.query(
      (m) => m.brandId.toLowerCase() === brandId.toLowerCase()
    );
    return models.map(normalizeModel);
  },

  async getById(id: string): Promise<ModelEntity | null> {
    const model = await db.models.getById(id);
    return model ? normalizeModel(model) : null;
  },

  async create(model: Omit<ModelEntity, "id"> & { id?: string }): Promise<ModelEntity> {
    return await db.models.insert(model);
  },

  async update(id: string, updates: Partial<ModelEntity>): Promise<ModelEntity | null> {
    return await db.models.update(id, updates);
  },

  async delete(id: string): Promise<boolean> {
    return await db.models.delete(id);
  },

  // Purchase Order
  async getPurchaseOrders(modelId: string) {
    return await api.get<any[]>("/orders", { modelId });
  },

  async savePurchaseOrder(po: any) {
    if (po.id) {
      return await api.put(`/orders/${po.id}`, po);
    }
    return await api.post("/orders", po);
  },

  async deletePurchaseOrder(id: string) {
    return await api.delete(`/orders/${id}`);
  },

  async getTestingRequirements(purchaseOrderId: string) {
    return await api.get<any[]>(`/orders/${purchaseOrderId}/testing-requirements`);
  },

  async saveTestingRequirements(purchaseOrderId: string, requirements: any[]) {
    return await api.put(`/orders/${purchaseOrderId}/testing-requirements`, { requirements });
  },

  // T&A
  async getTnaPlans(modelId: string) {
    return await modelService.getSubpageData(modelId, "tna");
  },

  async saveTnaPlan(tna: any) {
    return await modelService.saveSubpageData(tna.modelId, "tna", tna);
  },

  async deleteTnaPlan(modelId: string, recordId: string) {
    return await modelService.deleteSubpageData(modelId, "tna", recordId);
  },

  // Trimming BOM
  async getTrimmingBoms(modelId: string) {
    return await modelService.getSubpageData(modelId, "trimming");
  },

  async saveTrimmingBom(bom: any) {
    return await modelService.saveSubpageData(bom.modelId, "trimming", bom);
  },

  async deleteTrimmingBom(modelId: string, recordId: string) {
    return await modelService.deleteSubpageData(modelId, "trimming", recordId);
  },

  // Quality Check
  async getQcInspections(modelId: string, inspectionType?: string) {
    const data = await modelService.getSubpageData(modelId, "quality-check");
    return inspectionType ? data.filter((qc: any) => qc.inspectionType === inspectionType) : data;
  },

  async saveQcInspection(qc: any) {
    return await modelService.saveSubpageData(qc.modelId, "quality-check", qc);
  },

  async deleteQcInspection(modelId: string, recordId: string) {
    return await modelService.deleteSubpageData(modelId, "quality-check", recordId);
  },

  async getPatternFiles(modelId: string) {
    return await modelService.getSubpageData(modelId, "pattern");
  },

  async savePatternFile(file: any) {
    return await modelService.saveSubpageData(file.modelId, "pattern", file);
  },
};

import { db } from "../db/db-client";
import { modelService } from "../../../services/model.service";

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
}

export const ModelsApi = {
  async getAll(): Promise<ModelEntity[]> {
    return await db.models.getAll();
  },

  async getByBrand(brandId: string): Promise<ModelEntity[]> {
    return await db.models.query(
      (m) => m.brandId.toLowerCase() === brandId.toLowerCase()
    );
  },

  async getById(id: string): Promise<ModelEntity | null> {
    return await db.models.getById(id);
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
    return await db.purchaseOrders.query((po) => po.modelId === modelId);
  },

  async savePurchaseOrder(po: any) {
    if (po.id) {
      return await db.purchaseOrders.update(po.id, po);
    }
    return await db.purchaseOrders.insert(po);
  },

  // T&A
  async getTnaPlans(modelId: string) {
    return await modelService.getSubpageData(modelId, "tna");
  },

  async saveTnaPlan(tna: any) {
    return await modelService.saveSubpageData(tna.modelId, "tna", tna);
  },

  // Trimming BOM
  async getTrimmingBoms(modelId: string) {
    return await modelService.getSubpageData(modelId, "trimming");
  },

  async saveTrimmingBom(bom: any) {
    return await modelService.saveSubpageData(bom.modelId, "trimming", bom);
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

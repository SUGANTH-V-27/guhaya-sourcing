import { db } from "../db/db-client";

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
    return await db.tnaPlans.query((tna) => tna.modelId === modelId);
  },

  async saveTnaPlan(tna: any) {
    if (tna.id) {
      return await db.tnaPlans.update(tna.id, tna);
    }
    return await db.tnaPlans.insert(tna);
  },

  // Trimming BOM
  async getTrimmingBoms(modelId: string) {
    return await db.trimmingBoms.query((bom) => bom.modelId === modelId);
  },

  async saveTrimmingBom(bom: any) {
    if (bom.id) {
      return await db.trimmingBoms.update(bom.id, bom);
    }
    return await db.trimmingBoms.insert(bom);
  },

  // Quality Check
  async getQcInspections(modelId: string, inspectionType?: string) {
    return await db.qcInspections.query((qc) => {
      if (inspectionType) {
        return qc.modelId === modelId && qc.inspectionType === inspectionType;
      }
      return qc.modelId === modelId;
    });
  },

  async saveQcInspection(qc: any) {
    if (qc.id) {
      return await db.qcInspections.update(qc.id, qc);
    }
    return await db.qcInspections.insert(qc);
  },
};

import { db } from "../config/db.js";
import { Model } from "../types/index.js";

export class ModelService {
  async getAll(brandId?: string): Promise<Model[]> {
    const models = await db.models.select(brandId ? { brandId } : undefined);
    return models as Model[];
  }

  async getById(id: string): Promise<Model | null> {
    const model = await db.models.selectById(id);
    return model as Model | null;
  }

  async create(data: Partial<Model>): Promise<Model> {
    const code = data.code?.trim();
    const id = data.id || code || `model_${Date.now()}`;
    const newModel = await db.models.insert({
      ...data,
      id,
      code: code || id,
      name: data.name?.trim() || code || "New Style",
      brandId: data.brandId || "soxo",
      status: data.status || "Pending",
      daysToHandover: data.daysToHandover || 0,
      imageUrl: data.imageUrl || data.image || "",
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
        return await db.purchaseOrders.select({ modelId });
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
        {
          const plans = await db.tnaPlans.select({ modelId });
          const rows = await Promise.all(plans.map(async (plan: any) => {
            const milestones = await db.tnaMilestones.select({ tnaPlanId: plan.id }, { orderBy: { sortOrder: "asc" } });
            const milestone: any = milestones[0] || {};
            return {
              id: plan.id,
              modelId,
              activity: milestone.stageName || plan.poNumber || "",
              plannedDate: milestone.plannedEnd ? new Date(milestone.plannedEnd).toISOString().slice(0, 10) : (plan.exFactoryDate ? new Date(plan.exFactoryDate).toISOString().slice(0, 10) : ""),
              actualDate: milestone.actualEnd ? new Date(milestone.actualEnd).toISOString().slice(0, 10) : "",
              remarks: milestone.remarks || "",
            };
          }));
          return rows;
        }
      case "daily-production-report":
        return await db.dailyProductionReports.select({ modelId, inspectionType: "daily-production-report" });
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
    const inspectionDate = data.inspectionDate || new Date().toISOString();
    const record = { ...data, modelId, inspectionDate };
    switch (subpage) {
      case "purchase-order":
        return await db.purchaseOrders.insert({ ...data, modelId });
      case "fabric-status":
        return await db.qcInspections.insert({ ...data, modelId, inspectionType: "fabric-status" });
      case "measurement":
      case "measurements":
        return await db.measurementSpecs.insert({ ...record, inspectionType: "measurements" });
      case "pattern-files":
      case "pattern":
        return await db.qcInspections.insert({ ...data, modelId, inspectionType: "pattern" });
      case "trimming":
        return await db.trimmingBoms.insert({ ...data, modelId });
      case "tna":
        {
          const planId = data.id || `tna_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const existingPlan = await db.tnaPlans.selectById(planId);

          const plan = existingPlan
            ? await db.tnaPlans.update(planId, {
                modelId,
                poNumber: data.poNumber || existingPlan.poNumber || null,
                orderQty: Number(data.orderQty) || existingPlan.orderQty || 0,
                exFactoryDate: data.plannedDate ? new Date(data.plannedDate) : existingPlan.exFactoryDate || null,
                totalStages: 1,
                completedStages: data.actualDate ? 1 : existingPlan.completedStages || 0,
                status: data.actualDate ? "Completed" : existingPlan.status || "Pending",
              })
            : await db.tnaPlans.insert({
                id: planId,
                modelId,
                poNumber: data.poNumber || null,
                orderQty: Number(data.orderQty) || 0,
                exFactoryDate: data.plannedDate ? new Date(data.plannedDate) : null,
                totalStages: 1,
                completedStages: data.actualDate ? 1 : 0,
                status: data.actualDate ? "Completed" : "Pending",
              });

          if (!plan) {
            throw new Error("Unable to create or locate the TNA plan record.");
          }

          const milestoneList = await db.tnaMilestones.select({ tnaPlanId: plan.id }, { orderBy: { sortOrder: "asc" } });
          const existingMilestone = milestoneList[0];

          const savedMilestone = existingMilestone
            ? await db.tnaMilestones.update(existingMilestone.id, {
                tnaPlanId: plan.id,
                stageName: data.activity || existingMilestone.stageName || "",
                plannedEnd: data.plannedDate ? new Date(data.plannedDate) : existingMilestone.plannedEnd || null,
                actualEnd: data.actualDate ? new Date(data.actualDate) : existingMilestone.actualEnd || null,
                status: data.actualDate ? "Completed" : existingMilestone.status || "Pending",
                remarks: data.remarks ?? existingMilestone.remarks ?? null,
                sortOrder: 0,
              })
            : await db.tnaMilestones.insert({
                id: `tna_milestone_${plan.id}`,
                tnaPlanId: plan.id,
                stageName: data.activity || "",
                plannedEnd: data.plannedDate ? new Date(data.plannedDate) : null,
                actualEnd: data.actualDate ? new Date(data.actualDate) : null,
                status: data.actualDate ? "Completed" : "Pending",
                remarks: data.remarks || null,
                sortOrder: 0,
              });

          return { ...plan, milestone: savedMilestone };
        }
      case "daily-production-report":
        return await db.dailyProductionReports.insert({ ...record, inspectionType: "daily-production-report" });
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
        {
          const plan = await db.tnaPlans.selectById(recordId);
          if (plan) {
            await db.tnaMilestones.deleteMany({ tnaPlanId: plan.id });
          }
          return await db.tnaPlans.delete(recordId);
        }
      default:
        throw new Error(`Unknown model subpage: ${subpage}`);
    }
  }
}

export const modelService = new ModelService();

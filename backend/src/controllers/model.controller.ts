import { Request, Response } from "express";
import { db } from "../config/db.js";

export const getModels = async (req: Request, res: Response) => {
  try {
    const { brandId } = req.query;
    const query = brandId ? { brand_id: brandId } : undefined;
    const models = await db.models.select(query);
    res.json({ success: true, data: models });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const model = await db.models.selectById(id);
    if (!model) {
      return res.status(404).json({ success: false, message: "Model not found" });
    }
    res.json({ success: true, data: model });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createModel = async (req: Request, res: Response) => {
  try {
    const newModel = await db.models.insert(req.body);
    res.status(201).json({ success: true, data: newModel });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await db.models.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Model not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.models.delete(id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Subpage details: POs, Fabric, Measurements, Patterns, Trimmings, TNA
export const getModelSubpageData = async (req: Request, res: Response) => {
  try {
    const { id, subpage } = req.params;
    let data: any[] = [];
    switch (subpage) {
      case "purchase-order":
        data = await db.purchaseOrders.select({ model_id: id });
        break;
      case "fabric-status":
        data = await db.fabricStatus.select({ model_id: id });
        break;
      case "measurement":
        data = await db.measurementSpecs.select({ model_id: id });
        break;
      case "pattern-files":
        data = await db.patternFiles.select({ model_id: id });
        break;
      case "trimming":
        data = await db.trimmingItems.select({ model_id: id });
        break;
      case "tna":
        data = await db.tnaActivities.select({ model_id: id });
        break;
      default:
        return res.status(400).json({ success: false, message: `Unknown subpage: ${subpage}` });
    }
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

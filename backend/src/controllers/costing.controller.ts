import { Request, Response } from "express";
import { db } from "../config/db.js";

export const getCostings = async (req: Request, res: Response) => {
  try {
    const costings = await db.costSheets.select();
    res.json({ success: true, data: costings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCostingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const costing = await db.costSheets.selectById(id);
    if (!costing) {
      return res.status(404).json({ success: false, message: "Costing not found" });
    }
    res.json({ success: true, data: costing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCosting = async (req: Request, res: Response) => {
  try {
    const newCosting = await db.costSheets.insert(req.body);
    res.status(201).json({ success: true, data: newCosting });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCosting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await db.costSheets.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Costing not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCosting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.costSheets.delete(id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { Request, Response } from "express";
import { db } from "../config/db.js";

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await db.brands.select();
    res.json({ success: true, data: brands });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brand = await db.brands.selectById(id);
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }
    res.json({ success: true, data: brand });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const newBrand = await db.brands.insert(req.body);
    res.status(201).json({ success: true, data: newBrand });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await db.brands.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.brands.delete(id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

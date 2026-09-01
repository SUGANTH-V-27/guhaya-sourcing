import { Request, Response } from "express";
import { brandService } from "../services/brand.service.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

export const getBrands = async (req: Request, res: Response) => {
  try {
    const brands = await brandService.getAll();
    return sendSuccess(res, brands);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const brand = await brandService.getById(id);
    if (!brand) {
      return sendError(res, "Brand not found", 404);
    }
    return sendSuccess(res, brand);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const newBrand = await brandService.create(req.body);
    return sendSuccess(res, newBrand, "Brand created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await brandService.update(id, req.body);
    if (!updated) {
      return sendError(res, "Brand not found", 404);
    }
    return sendSuccess(res, updated, "Brand updated successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await brandService.delete(id);
    return sendSuccess(res, { deleted }, "Brand deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const getBrandSubpage = async (req: Request, res: Response) => {
  try {
    const { id, subpage } = req.params;
    const data = await brandService.getSubpageData(id, subpage);
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const saveBrandSubpage = async (req: Request, res: Response) => {
  try {
    const { id, subpage } = req.params;
    const saved = await brandService.saveSubpageData(id, subpage, req.body);
    return sendSuccess(res, saved, "Brand subpage data saved successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

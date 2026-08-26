import { Request, Response } from "express";
import { modelService } from "../services/model.service.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

export const getModels = async (req: Request, res: Response) => {
  try {
    const brandId = (req.query.brandId as string) || (req.query.brand_id as string);
    const models = await modelService.getAll(brandId);
    return sendSuccess(res, models);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const getModelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const model = await modelService.getById(id);
    if (!model) {
      return sendError(res, "Model not found", 404);
    }
    return sendSuccess(res, model);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createModel = async (req: Request, res: Response) => {
  try {
    const newModel = await modelService.create(req.body);
    return sendSuccess(res, newModel, "Model created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const updateModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await modelService.update(id, req.body);
    if (!updated) {
      return sendError(res, "Model not found", 404);
    }
    return sendSuccess(res, updated, "Model updated successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const deleteModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await modelService.delete(id);
    return sendSuccess(res, { deleted }, "Model deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const getModelSubpageData = async (req: Request, res: Response) => {
  try {
    const { id, subpage } = req.params;
    const data = await modelService.getSubpageData(id, subpage);
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const saveModelSubpageData = async (req: Request, res: Response) => {
  try {
    const { id, subpage } = req.params;
    const saved = await modelService.saveSubpageData(id, subpage, req.body);
    return sendSuccess(res, saved, "Model subpage data saved successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

import { Request, Response } from "express";
import { costingService } from "../services/costing.service.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

export const getCostings = async (req: Request, res: Response) => {
  try {
    const costings = await costingService.getAll();
    return sendSuccess(res, costings);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const getCostingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const costing = await costingService.getById(id);
    if (!costing) {
      return sendError(res, "Costing sheet not found", 404);
    }
    return sendSuccess(res, costing);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createCosting = async (req: Request, res: Response) => {
  try {
    const newCosting = await costingService.create(req.body);
    return sendSuccess(res, newCosting, "Cost sheet created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const updateCosting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await costingService.update(id, req.body);
    if (!updated) {
      return sendError(res, "Cost sheet not found", 404);
    }
    return sendSuccess(res, updated, "Cost sheet updated successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const deleteCosting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await costingService.delete(id);
    return sendSuccess(res, { deleted }, "Cost sheet deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

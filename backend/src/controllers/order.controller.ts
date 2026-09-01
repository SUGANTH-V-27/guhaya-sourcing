import { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getAll();
    return sendSuccess(res, orders);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getById(id);
    if (!order) {
      return sendError(res, "Order not found", 404);
    }
    return sendSuccess(res, order);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const newOrder = await orderService.create(req.body);
    return sendSuccess(res, newOrder, "Order created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await orderService.update(id, req.body);
    if (!updated) {
      return sendError(res, "Order not found", 404);
    }
    return sendSuccess(res, updated, "Order updated successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await orderService.delete(id);
    return sendSuccess(res, { deleted }, "Order deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

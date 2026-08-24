import { Request, Response } from "express";
import { db } from "../config/db.js";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await db.purchaseOrders.select();
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await db.purchaseOrders.selectById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const newOrder = await db.purchaseOrders.insert(req.body);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await db.purchaseOrders.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.purchaseOrders.delete(id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

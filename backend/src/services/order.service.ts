import { db } from "../config/db.js";
import { PurchaseOrder } from "../types/index.js";

export class OrderService {
  async getAll(): Promise<PurchaseOrder[]> {
    const orders = await db.purchaseOrders.select();
    return orders as PurchaseOrder[];
  }

  async getById(id: string): Promise<PurchaseOrder | null> {
    const order = await db.purchaseOrders.selectById(id);
    return order as PurchaseOrder | null;
  }

  async create(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const id = data.id || `po_${Date.now()}`;
    const newOrder = await db.purchaseOrders.insert({
      ...data,
      id,
      poNumber: data.poNumber || `PO-${Date.now().toString().slice(-6)}`,
      totalQty: data.totalQty || 0,
      totalAmount: data.totalAmount || 0,
      status: data.status || "Draft",
    });
    return newOrder as PurchaseOrder;
  }

  async update(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    const updated = await db.purchaseOrders.update(id, updates);
    return updated as PurchaseOrder | null;
  }

  async delete(id: string): Promise<boolean> {
    return await db.purchaseOrders.delete(id);
  }
}

export const orderService = new OrderService();

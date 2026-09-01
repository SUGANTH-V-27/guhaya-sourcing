import { api } from "./api";
import { PurchaseOrder } from "../types/order";

export const orderService = {
  async getOrders(): Promise<PurchaseOrder[]> {
    return await api.get<PurchaseOrder[]>("/orders");
  },

  async getOrderById(id: string): Promise<PurchaseOrder | null> {
    return await api.get<PurchaseOrder>(`/orders/${id}`);
  },

  async createOrder(order: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    return await api.post<PurchaseOrder>("/orders", order);
  },

  async updateOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    return await api.put<PurchaseOrder>(`/orders/${id}`, updates);
  },

  async deleteOrder(id: string): Promise<boolean> {
    const res = await api.delete<{ deleted: boolean }>(`/orders/${id}`);
    return res?.deleted ?? true;
  },
};

export default orderService;

import { db } from "../config/db.js";
import { PurchaseOrder } from "../types/index.js";

export class OrderService {
  async getAll(modelId?: string): Promise<PurchaseOrder[]> {
    const orders = modelId
      ? await db.purchaseOrders.select({ modelId })
      : await db.purchaseOrders.select();
    return orders as PurchaseOrder[];
  }

  async getById(id: string): Promise<PurchaseOrder | null> {
    const order = await db.purchaseOrders.selectById(id);
    return order as PurchaseOrder | null;
  }

  async create(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const poNumber = data.poNumber || `PO-${Date.now().toString().slice(-6)}`;
    const orderData = {
      modelId: data.modelId || null,
      brandId: data.brandId || "",
      factoryId: data.factoryId || null,
      poNumber,
      buyer: data.buyer || null,
      department: data.department || null,
      season: data.season || null,
      currency: data.currency || "USD",
      totalQty: data.totalQty || 0,
      totalAmount: data.totalAmount || 0,
      orderDate: data.orderDate ? new Date(data.orderDate) : null,
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
      shipmentMode: data.shipmentMode || "Sea",
      status: data.status || "Draft",
      specialInstructions: data.specialInstructions || null,
    };

    const existing = await db.purchaseOrders.select({ poNumber }, { take: 1 });
    if (existing[0]?.id) {
      const updated = await db.purchaseOrders.update(existing[0].id, orderData);
      return updated as PurchaseOrder;
    }

    const newOrder = await db.purchaseOrders.insert({
      id: data.id || `po_${Date.now()}`,
      ...orderData,
    });
    await this.syncCommission(newOrder as PurchaseOrder);
    return newOrder as PurchaseOrder;
  }

  async update(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    const updated = await db.purchaseOrders.update(id, updates);
    if (updated) await this.syncCommission(updated as PurchaseOrder);
    return updated as PurchaseOrder | null;
  }

  async getTestingRequirements(purchaseOrderId: string) {
    return await db.testingRequirements.select({ purchaseOrderId });
  }

  async replaceTestingRequirements(purchaseOrderId: string, requirements: Array<Record<string, any>>) {
    const existing = await db.testingRequirements.select({ purchaseOrderId });
    const incomingIds = new Set(requirements.map((requirement) => requirement.id).filter(Boolean));

    for (const record of existing) {
      if (record.id && !incomingIds.has(record.id)) {
        await db.testingRequirements.delete(record.id);
      }
    }

    return await Promise.all(requirements.map((requirement) => db.testingRequirements.insert({
      id: requirement.id || `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      purchaseOrderId,
      category: requirement.category || "Other Tests",
      parameter: requirement.parameter || "",
      product: requirement.product || "",
      requirement: requirement.requirement || "",
      testMethod: requirement.testMethod || "",
      notes: requirement.notes || null,
    })));
  }

  private async syncCommission(order: PurchaseOrder) {
    const commissionId = `commission-po-${order.id}`;
    const existing = await db.commissions.selectById(commissionId);
    const commission = {
      id: commissionId,
      buyerBrand: order.brandId || "",
      factoryName: order.factoryId || "",
      orderNumber: order.poNumber,
      orderValue: Number(order.totalAmount) || 0,
      commissionRatePct: 0,
      commissionAmount: 0,
      invoiceDate: order.orderDate ? new Date(order.orderDate) : null,
      paymentStatus: "Pending",
      remarks: JSON.stringify({
        modelId: order.modelId || null,
        source: "purchase-order",
        rateInrUsd: 90,
      }),
    };
    if (existing) {
      await db.commissions.update(commissionId, commission);
    } else {
      await db.commissions.insert(commission);
    }
  }

  async delete(id: string): Promise<boolean> {
    return await db.purchaseOrders.delete(id);
  }
}

export const orderService = new OrderService();

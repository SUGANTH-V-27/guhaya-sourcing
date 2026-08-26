export type OrderStatus = "Draft" | "Confirmed" | "In Production" | "Shipped" | "Cancelled";

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  modelId?: string;
  brandId?: string;
  factoryId?: string;
  factoryName?: string;
  buyer?: string;
  department?: string;
  season?: string;
  currency?: string;
  totalQty: number;
  totalAmount: number;
  unitPrice?: number;
  orderDate?: string;
  deliveryDate?: string;
  shipmentMode?: string;
  status: OrderStatus;
  items?: any[];
  createdAt?: string;
  updatedAt?: string;
}

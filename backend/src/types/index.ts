export interface UserProfile {
  id: string;
  userId?: string;
  email: string;
  fullName?: string;
  role: "Admin" | "Merchandiser" | "Auditor" | "FactoryManager" | "Viewer";
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Factory {
  id: string;
  name: string;
  code?: string;
  location?: string;
  address?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  complianceGrade?: string;
  totalCapacityMonthly?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  code?: string;
  country?: string;
  category?: string;
  primaryContact?: string;
  email?: string;
  phone?: string;
  description?: string;
  image?: string;
  logoUrl?: string;
  modelCount?: number;
  totalModels?: number;
  activeOrders?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Model {
  id: string;
  brandId: string;
  factoryId?: string;
  factoryName?: string;
  code: string;
  name: string;
  category?: string;
  image?: string;
  imageUrl?: string;
  status: "Pending" | "Shipped" | "In Production" | "Completed";
  daysToHandover: number;
  buyer?: string;
  department?: string;
  subclass?: string;
  season?: string;
  targetFob?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  modelId?: string;
  brandId?: string;
  factoryId?: string;
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
  status: "Draft" | "Confirmed" | "In Production" | "Shipped" | "Cancelled";
  items?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SocialComplianceAudit {
  id: string;
  factoryId?: string;
  factoryName: string;
  auditDate: string;
  auditorName: string;
  auditingBody?: string;
  overallScore: number;
  grade: "A" | "B" | "C" | "D";
  status: "Passed" | "Conditional" | "Failed";
  findings?: any[];
  sectionScores?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TechnicalAudit {
  id: string;
  factoryId?: string;
  factoryName: string;
  brand?: string;
  auditDate: string;
  auditorName: string;
  location?: string;
  contact?: string;
  workforce?: number;
  capacity?: number;
  categories?: string;
  modules?: any[];
  overallScore?: number;
  grade?: string;
  status: "Approved" | "Conditional" | "Rejected";
  conclusion?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FactoryCertification {
  id: string;
  factoryId?: string;
  factoryName: string;
  certificationName: string;
  standardType?: string;
  certNumber?: string;
  issuedDate: string;
  expiryDate: string;
  validityStatus: "Valid" | "Expiring Soon" | "Expired";
  documentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CostSheet {
  id: string;
  modelId?: string;
  modelCode: string;
  modelName: string;
  brandId?: string;
  brandName?: string;
  category?: string;
  image?: string;
  season?: string;
  fabricCost: number;
  trimsCost: number;
  cmCost: number;
  washCost: number;
  freightCost: number;
  otherCost: number;
  totalCost: number;
  marginPercent: number;
  finalPrice: number;
  usdFinalPrice?: number;
  currency?: string;
  status: "Draft" | "Reviewed" | "Approved";
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  brandId?: string;
  brandName: string;
  invoiceDate: string;
  dueDate: string;
  items: any[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  createdAt?: string;
  updatedAt?: string;
}

export interface FactoryLedgerTransaction {
  id: string;
  factoryId?: string;
  factoryName: string;
  date: string;
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: "Invoice" | "Payment" | "Advance" | "DebitNote" | "CreditNote";
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeExpenseEntry {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  amount: number;
  paymentMode: string;
  description: string;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffSalary {
  id: string;
  staffName: string;
  designation: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentStatus: "Pending" | "Paid";
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

/**
 * Universal Prisma Database Client for Backend
 * Connects directly to Supabase PostgreSQL using DIRECT_URL / DATABASE_URL.
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DIRECT_URL || env.DATABASE_URL,
    },
  },
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

export interface DatabaseRecord {
  id?: string;
  [key: string]: any;
}

// Table field white-lists to ensure strict mapping to Prisma/Supabase schema
const MODEL_FIELDS_MAP: Record<string, string[]> = {
  profile: ["id", "userId", "email", "fullName", "role", "phone", "avatarUrl"],
  factory: ["id", "name", "code", "location", "address", "contactPerson", "contactEmail", "contactPhone", "complianceGrade", "totalCapacityMonthly"],
  brand: ["id", "name", "code", "country", "primaryContact", "email", "phone", "description", "logoUrl", "totalModels", "activeOrders"],
  model: ["id", "brandId", "factoryId", "factoryName", "code", "name", "category", "imageUrl", "status", "daysToHandover", "buyer", "department", "subclass", "season", "targetFob"],
  purchaseOrder: ["id", "poNumber", "modelId", "brandId", "factoryId", "buyer", "department", "season", "currency", "totalQty", "totalAmount", "orderDate", "deliveryDate", "shipmentMode", "status", "specialInstructions"],
  poItem: ["id", "purchaseOrderId", "colorway", "itemCode", "xsQty", "sQty", "mQty", "lQty", "xlQty", "xxlQty", "totalQty", "unitPrice", "totalPrice"],
  tnaPlan: ["id", "modelId", "poNumber", "orderQty", "exFactoryDate", "totalStages", "completedStages", "status"],
  tnaMilestone: ["id", "tnaPlanId", "stageName", "category", "plannedStart", "plannedEnd", "actualStart", "actualEnd", "status", "responsiblePerson", "remarks", "sortOrder"],
  trimmingBom: ["id", "modelId", "itemType", "supplierName", "specification", "color", "sizeDimension", "consumptionPerPc", "unit", "unitCost", "currency", "requiredQty", "approvalStatus", "proofImageUrl", "notes"],
  qcInspection: ["id", "modelId", "inspectionType", "factoryName", "inspectorName", "inspectionDate", "totalOrderQty", "sampleSize", "aqlLevel", "criticalDefects", "majorDefects", "minorDefects", "result", "remarks", "reportPdfUrl", "photos"],
  brandSummary: ["id", "brandId", "summaryMonth", "totalOrders", "totalPieces", "fobValue", "onTimeDeliveryRate", "qualityPassRate", "notes"],
  testingStandard: ["id", "brandId", "testCategory", "parameterName", "testMethod", "requirementStandard", "tolerance", "isMandatory"],
  bookingTracker: ["id", "brandId", "factoryId", "monthPeriod", "department", "projectedPieces", "confirmedPieces", "shippedPieces", "status"],
  factoryCapacity: ["id", "brandId", "factoryName", "totalLines", "totalMachines", "monthlyCapacityPcs", "allocatedPcs", "utilizationPct", "monthPeriod"],
  courierShipment: ["id", "brandId", "awbNumber", "courierPartner", "shipmentType", "sender", "recipient", "dispatchDate", "deliveryDate", "status", "trackingUrl", "remarks"],
  caprIssue: ["id", "brandId", "modelId", "factoryName", "issueTitle", "issueDescription", "severity", "rootCause", "preventiveAction", "assignedTo", "targetClosureDate", "closureDate", "status"],
  socialComplianceAudit: ["id", "factoryName", "brand", "address", "auditDate", "contactPerson", "contactEmail", "auditorName", "overallScore", "grade", "colorRating", "criticalCompliantCount", "criticalTotalCount", "totalPointsPossible", "totalPointsAchieved", "auditorRemarks", "goodPractices", "criticalIssues", "status"],
  technicalAudit: ["id", "factoryName", "brand", "auditDate", "auditorName", "contactPerson", "contactEmail", "factoryAddress", "scorePercentage", "availableItems", "missingItems", "totalItems", "rating", "conclusion", "sectionsData", "proofFileUrl"],
  certification: ["id", "factoryName", "certificationType", "certificateNumber", "issuingBody", "issueDate", "expiryDate", "scope", "notes", "pdfUrl", "status"],
  costingSheet: ["id", "modelId", "styleCode", "styleName", "brand", "season", "currency", "orderQuantity", "fabricCost", "trimsCost", "cmCost", "printEmbroideryCost", "washFinishCost", "packagingCost", "commercialTransportCost", "subtotalCost", "marginPercentage", "marginAmount", "totalFobPrice", "targetFobPrice", "variance", "status", "breakdownJson"],
  companySetting: ["id", "companyName", "gstin", "pan", "address", "email", "phone", "bankName", "accountNumber", "ifscCode", "branch", "invoicePrefix"],
  invoice: ["id", "invoiceNumber", "invoiceType", "partyType", "partyName", "partyGstin", "partyAddress", "partyEmail", "invoiceDate", "dueDate", "currency", "subtotal", "cgstRate", "cgstAmount", "sgstRate", "sgstAmount", "igstRate", "igstAmount", "grandTotal", "paidAmount", "balanceAmount", "paymentStatus", "notes"],
  factoryLedgerTransaction: ["id", "factoryId", "factoryName", "transactionDate", "referenceNo", "description", "debitAmount", "creditAmount", "runningBalance", "paymentMode", "notes"],
  monthlyLedger: ["id", "monthKey", "totalIncome", "totalExpenses", "netSavings", "status"],
  incomeEntry: ["id", "monthKey", "sourceName", "category", "amount", "entryDate", "referenceNo", "remarks"],
  expenseEntry: ["id", "monthKey", "expenseName", "category", "amount", "entryDate", "paidTo", "receiptUrl", "remarks"],
  commissionRecord: ["id", "buyerBrand", "factoryName", "orderNumber", "orderValue", "commissionRatePct", "commissionAmount", "invoiceDate", "paymentStatus", "receivedDate", "remarks"],
  staffMember: ["id", "staffCode", "fullName", "designation", "department", "dateOfJoining", "phone", "email", "baseSalary", "hra", "allowances", "bankAccount", "panNumber", "isActive"],
  attendanceRecord: ["id", "staffId", "attendanceDate", "status", "inTime", "outTime", "overtimeHours", "notes"],
  salarySlip: ["id", "staffId", "salaryMonth", "workingDays", "presentDays", "basicPay", "hra", "allowances", "overtimePay", "grossSalary", "pfDeduction", "esiDeduction", "tdsDeduction", "advanceRecovery", "totalDeductions", "netSalary", "paymentStatus", "paymentDate"],
  advancePayment: ["id", "staffId", "advanceDate", "amount", "repaymentMonths", "monthlyDeduction", "repaidAmount", "balanceAmount", "status", "reason"],
};

// Aliases for common snake_case/frontend name conversions
const FIELD_ALIASES: Record<string, Record<string, string>> = {
  brand: {
    logo_url: "logoUrl",
    image: "logoUrl",
    model_count: "totalModels",
    modelCount: "totalModels",
    active_orders: "activeOrders",
  },
  model: {
    brand_id: "brandId",
    factory_id: "factoryId",
    factory_name: "factoryName",
    image_url: "imageUrl",
    image: "imageUrl",
    days_to_handover: "daysToHandover",
    target_fob: "targetFob",
  },
  profile: {
    user_id: "userId",
    full_name: "fullName",
    avatar_url: "avatarUrl",
  },
  purchaseOrder: {
    po_number: "poNumber",
    model_id: "modelId",
    brand_id: "brandId",
    factory_id: "factoryId",
    total_qty: "totalQty",
    total_amount: "totalAmount",
    order_date: "orderDate",
    delivery_date: "deliveryDate",
    shipment_mode: "shipmentMode",
    special_instructions: "specialInstructions",
  },
  brandSummary: {
    brand_id: "brandId",
    summary_month: "summaryMonth",
    total_orders: "totalOrders",
    total_pieces: "totalPieces",
    fob_value: "fobValue",
    on_time_delivery_rate: "onTimeDeliveryRate",
    quality_pass_rate: "qualityPassRate",
  },
  testingStandard: {
    brand_id: "brandId",
    test_category: "testCategory",
    parameter_name: "parameterName",
    test_method: "testMethod",
    requirement_standard: "requirementStandard",
    is_mandatory: "isMandatory",
  },
  bookingTracker: {
    brand_id: "brandId",
    factory_id: "factoryId",
    month_period: "monthPeriod",
    projected_pieces: "projectedPieces",
    confirmed_pieces: "confirmedPieces",
    shipped_pieces: "shippedPieces",
  },
  factoryCapacity: {
    brand_id: "brandId",
    factory_name: "factoryName",
    total_lines: "totalLines",
    total_machines: "totalMachines",
    monthly_capacity_pcs: "monthlyCapacityPcs",
    allocated_pcs: "allocatedPcs",
    utilization_pct: "utilizationPct",
    month_period: "monthPeriod",
  },
  courierShipment: {
    brand_id: "brandId",
    awb_number: "awbNumber",
    courier_partner: "courierPartner",
    shipment_type: "shipmentType",
    dispatch_date: "dispatchDate",
    delivery_date: "deliveryDate",
    tracking_url: "trackingUrl",
  },
  caprIssue: {
    brand_id: "brandId",
    model_id: "modelId",
    factory_name: "factoryName",
    issue_title: "issueTitle",
    issue_description: "issueDescription",
    root_cause: "rootCause",
    preventive_action: "preventiveAction",
    assigned_to: "assignedTo",
    target_closure_date: "targetClosureDate",
    closure_date: "closureDate",
  },
};

function sanitizeData(modelName: string, data: Record<string, any>): Record<string, any> {
  const allowed = MODEL_FIELDS_MAP[modelName];
  const aliases = FIELD_ALIASES[modelName] || {};
  const clean: Record<string, any> = {};

  for (const [key, rawVal] of Object.entries(data)) {
    if (rawVal === undefined) continue;

    // Check alias
    const mappedKey = aliases[key] || key;

    if (!allowed || allowed.includes(mappedKey)) {
      // Type conversions if needed
      if (mappedKey.endsWith("Date") || mappedKey === "inspectionDate" || mappedKey === "entryDate") {
        if (rawVal && typeof rawVal === "string") {
          const d = new Date(rawVal);
          clean[mappedKey] = isNaN(d.getTime()) ? null : d;
        } else {
          clean[mappedKey] = rawVal;
        }
      } else {
        clean[mappedKey] = rawVal;
      }
    }
  }

  return clean;
}

/**
 * Universal Database Table Manager for Express Backend backed by Prisma & Supabase PostgreSQL.
 * Throws explicit errors when a query fails instead of silent fallback.
 */
export class BackendDbTable<T extends DatabaseRecord> {
  private modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  private get delegate(): any {
    const d = (prisma as any)[this.modelName];
    if (!d) {
      throw new Error(`Prisma delegate for '${this.modelName}' does not exist in schema.prisma.`);
    }
    return d;
  }

  async select(where?: Record<string, any>): Promise<T[]> {
    try {
      const cleanWhere = where ? sanitizeData(this.modelName, where) : undefined;
      return await this.delegate.findMany({
        where: cleanWhere && Object.keys(cleanWhere).length > 0 ? cleanWhere : undefined,
        orderBy: { createdAt: "desc" },
      });
    } catch (err: any) {
      // Fallback for models without createdAt
      try {
        const cleanWhere = where ? sanitizeData(this.modelName, where) : undefined;
        return await this.delegate.findMany({
          where: cleanWhere && Object.keys(cleanWhere).length > 0 ? cleanWhere : undefined,
        });
      } catch (innerErr: any) {
        console.error(`[Database Error] select failed on model '${this.modelName}':`, innerErr.message || innerErr);
        throw innerErr;
      }
    }
  }

  async selectById(id: string): Promise<T | null> {
    try {
      return await this.delegate.findUnique({
        where: { id },
      });
    } catch (err: any) {
      console.error(`[Database Error] selectById failed on model '${this.modelName}' for id '${id}':`, err.message || err);
      throw err;
    }
  }

  async insert(record: T): Promise<T> {
    try {
      const clean = sanitizeData(this.modelName, record);
      const id = clean.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      clean.id = id;

      return await this.delegate.upsert({
        where: { id },
        update: clean,
        create: clean,
      });
    } catch (err: any) {
      console.error(`[Database Error] insert/upsert failed on model '${this.modelName}':`, err.message || err);
      throw err;
    }
  }

  async findMany(where?: Record<string, any>): Promise<T[]> {
    return await this.select(where);
  }

  async findOne(id: string): Promise<T | null> {
    return await this.selectById(id);
  }

  async create(record: T): Promise<T> {
    return await this.insert(record);
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const clean = sanitizeData(this.modelName, updates);
      delete clean.id;

      return await this.delegate.update({
        where: { id },
        data: clean,
      });
    } catch (err: any) {
      console.error(`[Database Error] update failed on model '${this.modelName}' for id '${id}':`, err.message || err);
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.delegate.delete({
        where: { id },
      });
      return true;
    } catch (err: any) {
      console.error(`[Database Error] delete failed on model '${this.modelName}' for id '${id}':`, err.message || err);
      throw err;
    }
  }
}

// Pre-instantiated database tables connecting to Prisma models
export const db = {
  profiles: new BackendDbTable("profile"),
  factories: new BackendDbTable("factory"),
  brands: new BackendDbTable("brand"),
  models: new BackendDbTable("model"),
  purchaseOrders: new BackendDbTable("purchaseOrder"),
  poItems: new BackendDbTable("poItem"),
  tnaPlans: new BackendDbTable("tnaPlan"),
  tnaMilestones: new BackendDbTable("tnaMilestone"),
  trimmingBoms: new BackendDbTable("trimmingBom"),
  qcInspections: new BackendDbTable("qcInspection"),
  brandSummaries: new BackendDbTable("brandSummary"),
  testingStandards: new BackendDbTable("testingStandard"),
  bookingTrackers: new BackendDbTable("bookingTracker"),
  factoryCapacities: new BackendDbTable("factoryCapacity"),
  courierShipments: new BackendDbTable("courierShipment"),
  caprIssues: new BackendDbTable("caprIssue"),
  socialAudits: new BackendDbTable("socialComplianceAudit"),
  socialComplianceSections: new BackendDbTable("socialComplianceSection"),
  sirFindings: new BackendDbTable("sirFinding"),
  technicalAudits: new BackendDbTable("technicalAudit"),
  certifications: new BackendDbTable("certification"),
  costSheets: new BackendDbTable("costingSheet"),
  invoices: new BackendDbTable("invoice"),
  invoiceItems: new BackendDbTable("invoiceItem"),
  ledgerTransactions: new BackendDbTable("factoryLedgerTransaction"),
  monthlyLedgers: new BackendDbTable("monthlyLedger"),
  incomeEntries: new BackendDbTable("incomeEntry"),
  expenseEntries: new BackendDbTable("expenseEntry"),
  commissions: new BackendDbTable("commissionRecord"),
  staffMembers: new BackendDbTable("staffMember"),
  attendanceRecords: new BackendDbTable("attendanceRecord"),
  salarySlips: new BackendDbTable("salarySlip"),
  advancePayments: new BackendDbTable("advancePayment"),
  companySettings: new BackendDbTable("companySetting"),
  // Table aliases for legacy service compatibility
  incomeExpenses: new BackendDbTable("incomeEntry"),
  staffSalaries: new BackendDbTable("salarySlip"),
  fabricStatus: new BackendDbTable("model"),
  measurementSpecs: new BackendDbTable("model"),
  patternFiles: new BackendDbTable("model"),
  trimmingItems: new BackendDbTable("trimmingBom"),
  tnaActivities: new BackendDbTable("tnaMilestone"),
  dailyProductionReports: new BackendDbTable("qcInspection"),
  artworkFiles: new BackendDbTable("model"),
  documentationFiles: new BackendDbTable("model"),
  qualityCheckReports: new BackendDbTable("qcInspection"),
};

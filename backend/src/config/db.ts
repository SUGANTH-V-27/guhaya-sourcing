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
  profile: ["id", "userId", "email", "passwordHash", "fullName", "role", "phone", "avatarUrl"],
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
  staffMember: {
    name: "fullName",
    full_name: "fullName",
    role: "designation",
    fixedSalary: "baseSalary",
    fixed_salary: "baseSalary",
    salary: "baseSalary",
    base_salary: "baseSalary",
    staff_code: "staffCode",
    staffId: "id",
    date_of_joining: "dateOfJoining",
    pan_number: "panNumber",
    bank_account: "bankAccount",
    is_active: "isActive",
  },
  attendanceRecord: {
    staff_id: "staffId",
    attendance_date: "attendanceDate",
    overtime_hours: "overtimeHours",
    in_time: "inTime",
    out_time: "outTime",
  },
  salarySlip: {
    staff_id: "staffId",
    salary_month: "salaryMonth",
    working_days: "workingDays",
    present_days: "presentDays",
    basic_pay: "basicPay",
    basicSalary: "basicPay",
    overtime_pay: "overtimePay",
    gross_salary: "grossSalary",
    net_salary: "netSalary",
    netPay: "netSalary",
    pf_deduction: "pfDeduction",
    esi_deduction: "esiDeduction",
    tds_deduction: "tdsDeduction",
    advance_recovery: "advanceRecovery",
    advanceDeduction: "advanceRecovery",
    total_deductions: "totalDeductions",
    payment_status: "paymentStatus",
    payment_date: "paymentDate",
  },
  advancePayment: {
    staff_id: "staffId",
    advance_date: "advanceDate",
    repayment_months: "repaymentMonths",
    monthly_deduction: "monthlyDeduction",
    repaid_amount: "repaidAmount",
    balance_amount: "balanceAmount",
  },
  incomeEntry: {
    month_key: "monthKey",
    source_name: "sourceName",
    entry_date: "entryDate",
    reference_no: "referenceNo",
  },
  expenseEntry: {
    month_key: "monthKey",
    expense_name: "expenseName",
    entry_date: "entryDate",
    paid_to: "paidTo",
    receipt_url: "receiptUrl",
  },
  commissionRecord: {
    buyer_brand: "buyerBrand",
    factory_name: "factoryName",
    order_number: "orderNumber",
    order_value: "orderValue",
    commission_rate_pct: "commissionRatePct",
    commission_amount: "commissionAmount",
    invoice_date: "invoiceDate",
    payment_status: "paymentStatus",
    received_date: "receivedDate",
  },
  costingSheet: {
    name: "styleName",
    styleNo: "styleCode",
    style_code: "styleCode",
    style_name: "styleName",
    model_id: "modelId",
    order_quantity: "orderQuantity",
    targetQuantity: "orderQuantity",
    fabric_cost: "fabricCost",
    trims_cost: "trimsCost",
    cm_cost: "cmCost",
    print_embroidery_cost: "printEmbroideryCost",
    wash_finish_cost: "washFinishCost",
    packaging_cost: "packagingCost",
    commercial_transport_cost: "commercialTransportCost",
    subtotal_cost: "subtotalCost",
    margin_percentage: "marginPercentage",
    margin_amount: "marginAmount",
    total_fob_price: "totalFobPrice",
    target_fob_price: "targetFobPrice",
    finalPrice: "totalFobPrice",
    usdFinalPrice: "totalFobPrice",
    breakdown_json: "breakdownJson",
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
      // Date conversions
      if (mappedKey.endsWith("Date") || mappedKey === "inspectionDate" || mappedKey === "entryDate") {
        if (rawVal && typeof rawVal === "string") {
          const d = new Date(rawVal);
          clean[mappedKey] = isNaN(d.getTime()) ? null : d;
        } else {
          clean[mappedKey] = rawVal;
        }
      } else if (
        mappedKey === "baseSalary" ||
        mappedKey === "hra" ||
        mappedKey === "allowances" ||
        mappedKey === "basicPay" ||
        mappedKey === "netSalary" ||
        mappedKey === "amount" ||
        mappedKey === "orderValue"
      ) {
        clean[mappedKey] = typeof rawVal === "number" ? rawVal : parseFloat(rawVal) || 0;
      } else {
        clean[mappedKey] = rawVal;
      }
    }
  }

  return clean;
}

/**
 * Universal Database Table Manager for Express Backend backed by Prisma & Supabase PostgreSQL.
 */
export class BackendDbTable<T extends Record<string, any> = Record<string, any>> {
  private modelName: string;
  private delegate: any;

  constructor(modelName: string) {
    this.modelName = modelName;
    this.delegate = (prisma as any)[modelName];
    if (!this.delegate) {
      throw new Error(
        `Database is unavailable: Prisma model '${modelName}' is not registered. Configure DATABASE_URL/DIRECT_URL and ensure the schema includes this table.`,
      );
    }
  }

  private toDbError(err: any, action: string): Error {
    const baseMessage = err?.message || err?.code || "Unknown database error";
    const codeText = err?.code ? ` (code: ${err.code})` : "";

    return new Error(
      `Database is unavailable while ${action} on '${this.modelName}'. Configure DATABASE_URL/DIRECT_URL and ensure PostgreSQL is reachable.${codeText} Original error: ${baseMessage}`,
    );
  }

  private ensureAvailable(): void {
    if (!this.delegate) {
      throw new Error(
        `Database is unavailable: Prisma model '${this.modelName}' is not registered. Configure DATABASE_URL/DIRECT_URL and ensure the schema includes this table.`,
      );
    }
  }

  private matchesRecord(item: Record<string, any>, where?: Record<string, any>): boolean {
    if (!where) return true;

    return Object.entries(where).every(([key, expected]) => {
      const actual = (item as any)[key];
      if (expected === undefined || expected === null) return true;
      if (typeof expected === "object" && expected !== null && !(expected instanceof Date)) {
        return JSON.stringify(actual) === JSON.stringify(expected);
      }
      return actual === expected;
    });
  }

  async select(where?: Record<string, any>, options?: { orderBy?: any; take?: number; skip?: number }): Promise<T[]> {
    this.ensureAvailable();

    try {
      const cleanWhere = where ? sanitizeData(this.modelName, where) : undefined;
      return await this.delegate.findMany({
        where: cleanWhere,
        orderBy: options?.orderBy,
        take: options?.take,
        skip: options?.skip,
      });
    } catch (err: any) {
      throw this.toDbError(err, "reading");
    }
  }

  async selectById(id: string): Promise<T | null> {
    this.ensureAvailable();

    try {
      return await this.delegate.findUnique({
        where: { id },
      });
    } catch (err: any) {
      throw this.toDbError(err, "loading a record by id");
    }
  }

  async insert(record: T): Promise<T> {
    this.ensureAvailable();

    try {
      const clean = sanitizeData(this.modelName, record as Record<string, any>);
      const id = clean.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      clean.id = id;

      return await this.delegate.upsert({
        where: { id },
        update: clean,
        create: clean,
      });
    } catch (err: any) {
      throw this.toDbError(err, "inserting");
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
    this.ensureAvailable();

    try {
      const clean = sanitizeData(this.modelName, updates as Record<string, any>);
      delete clean.id;

      return await this.delegate.update({
        where: { id },
        data: clean,
      });
    } catch (err: any) {
      throw this.toDbError(err, "updating");
    }
  }

  async delete(id: string): Promise<boolean> {
    this.ensureAvailable();

    try {
      const res = await this.delegate.deleteMany({
        where: { id },
      });
      if (res && res.count > 0) return true;

      try {
        await this.delegate.delete({ where: { id } });
        return true;
      } catch (innerErr: any) {
        if (innerErr?.code === "P2025") return false;
        throw this.toDbError(innerErr, "deleting");
      }
      return true;
    } catch (err: any) {
      throw this.toDbError(err, "deleting");
    }
  }

  async deleteMany(where?: Record<string, any>): Promise<number> {
    this.ensureAvailable();

    try {
      const res = await this.delegate.deleteMany({ where: where || {} });
      return res?.count || 0;
    } catch (err: any) {
      throw this.toDbError(err, "deleting many records");
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

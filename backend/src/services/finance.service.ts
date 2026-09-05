import { db } from "../config/db.js";

export class FinanceService {
  // ── Invoices ─────────────────────────────────────────────────────────────
  async getInvoices(monthKey?: string) {
    const invoices = await db.invoices.findMany(
      monthKey
        ? {
            invoiceDate: {
              gte: new Date(`${monthKey}-01T00:00:00.000Z`),
              lt: (() => {
                const [year, month] = monthKey.split("-").map(Number);
                return new Date(Date.UTC(year, month, 1));
              })(),
            },
          }
        : undefined,
    );
    return await Promise.all(invoices.map((invoice: any) => this.formatInvoice(invoice)));
  }

  async getInvoiceById(id: string) {
    const invoice = await db.invoices.findOne(id);
    if (!invoice) return null;
    return await this.formatInvoice(invoice);
  }

  private async formatInvoice(invoice: any) {
    let metadata: any = {};
    try {
      metadata = invoice.notes ? JSON.parse(invoice.notes) : {};
    } catch {
      metadata = {};
    }
    const items = await db.invoiceItems.findMany({ invoiceId: invoice.id });
    return {
      ...invoice,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().slice(0, 10) : "",
      brandName: metadata.brandName || "",
      hsnCode: metadata.hsnCode || "9988",
      invoiceTo: metadata.invoiceTo || {
        company: invoice.partyName || "",
        address: invoice.partyAddress || "",
        gstin: invoice.partyGstin || "",
        state: "",
        code: "",
      },
      commissionRows: metadata.commissionRows || [],
      bankDiscountPct: Number(metadata.bankDiscountPct) || 0,
      cgstPct: Number(invoice.cgstRate) || 0,
      sgstPct: Number(invoice.sgstRate) || 0,
      paymentDate: invoice.paymentDate
        ? new Date(invoice.paymentDate).toISOString().slice(0, 10)
        : metadata.paymentDate || "",
      paidAmount: Number(invoice.paidAmount) || 0,
      remarks: metadata.remarks || "",
      createdAt: invoice.createdAt,
      lineItems: items,
      items,
    };
  }

  async createInvoice(data: any) {
    const id = data.id || `inv_${Date.now()}`;
    const subtotal = Number(data.subtotal) || 0;
    const cgstAmount = Number(data.cgstAmount) || 0;
    const sgstAmount = Number(data.sgstAmount) || 0;
    const igstAmount = Number(data.igstAmount) || 0;
    const grandTotal = Number(data.grandTotal) || Number(data.totalAmount) || (subtotal + cgstAmount + sgstAmount + igstAmount);

    const metadata = JSON.stringify({
      brandName: data.brandName || "",
      hsnCode: data.hsnCode || "9988",
      invoiceTo: data.invoiceTo || {},
      commissionRows: data.commissionRows || [],
      bankDiscountPct: Number(data.bankDiscountPct) || 0,
      paymentDate: data.paymentDate || "",
      remarks: data.remarks || "",
    });
    const invoice = await db.invoices.create({
      id,
      invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      invoiceType: data.invoiceType || "Tax Invoice",
      partyType: data.partyType || "Buyer",
      partyName: data.partyName || data.brandName || "Buyer Client",
      partyGstin: data.partyGstin || data.gstin || null,
      partyAddress: data.partyAddress || data.address || null,
      partyEmail: data.partyEmail || data.email || null,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      currency: data.currency || "INR",
      subtotal,
      cgstRate: Number(data.cgstRate) || 0,
      cgstAmount,
      sgstRate: Number(data.sgstRate) || 0,
      sgstAmount,
      igstRate: Number(data.igstRate) || 0,
      igstAmount,
      grandTotal,
      paidAmount: Number(data.paidAmount) || 0,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
      balanceAmount: Number(data.balanceAmount) || grandTotal,
      paymentStatus: data.paymentStatus || "Unpaid",
      notes: metadata,
    });
    if (Array.isArray(data.lineItems)) {
      for (const item of data.lineItems) {
        await db.invoiceItems.create({
          id: item.id || `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          invoiceId: id,
          itemDescription: item.description || item.itemDescription || "Item",
          hsnCode: item.hsnCode || null,
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "PCS",
          rate: Number(item.price ?? item.rate) || 0,
          amount: Number(item.amount) || (Number(item.quantity) || 1) * (Number(item.price ?? item.rate) || 0),
        });
      }
    }
    return await this.formatInvoice(invoice);
  }

  async updateInvoice(id: string, data: any) {
    const existing = await db.invoices.findOne(id);
    if (!existing) return null;
    let oldMetadata: any = {};
    try {
      oldMetadata = existing.notes ? JSON.parse(existing.notes) : {};
    } catch {
      oldMetadata = {};
    }
    const invoicePatch: Record<string, any> = {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate
        ? new Date(data.invoiceDate)
        : data.date
          ? new Date(data.date)
          : undefined,
      partyName: data.invoiceTo?.company ?? data.brandName,
      partyGstin: data.invoiceTo?.gstin,
      partyAddress: data.invoiceTo?.address,
      cgstRate: data.cgstPct,
      sgstRate: data.sgstPct,
      paidAmount: data.paidAmount,
      notes: JSON.stringify({ ...oldMetadata, ...data, lineItems: undefined }),
    };
    if (Object.prototype.hasOwnProperty.call(data, "paymentDate")) {
      invoicePatch.paymentDate = data.paymentDate ? new Date(data.paymentDate) : null;
    }
    const updated = await db.invoices.update(id, invoicePatch);
    if (Array.isArray(data.lineItems)) {
      await db.invoiceItems.deleteMany({ invoiceId: id });
      for (const item of data.lineItems) {
        await db.invoiceItems.create({
          id: item.id || `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          invoiceId: id,
          itemDescription: item.description || item.itemDescription || "Item",
          hsnCode: item.hsnCode || null,
          quantity: Number(item.quantity) || 1,
          unit: item.unit || "PCS",
          rate: Number(item.price ?? item.rate) || 0,
          amount: Number(item.amount) || (Number(item.quantity) || 1) * (Number(item.price ?? item.rate) || 0),
        });
      }
    }
    return updated ? await this.formatInvoice(updated) : null;
  }

  async deleteInvoice(id: string) {
    await db.invoiceItems.deleteMany({ invoiceId: id });
    return await db.invoices.delete(id);
  }

  // ── Factory Ledger ───────────────────────────────────────────────────────
  async getLedgerTransactions(factoryName?: string, fromDate?: string, toDate?: string) {
    const query: Record<string, any> = {};
    if (factoryName) query.factoryName = factoryName;
    if (fromDate || toDate) {
      query.transactionDate = {
        ...(fromDate ? { gte: new Date(`${fromDate}T00:00:00.000Z`) } : {}),
        ...(toDate ? { lt: new Date(`${toDate}T00:00:00.000Z`) } : {}),
      };
    }
    const [transactions, invoices] = await Promise.all([
      db.ledgerTransactions.findMany(Object.keys(query).length ? query : undefined),
      db.invoices.findMany(),
    ]);
    const factory = (factoryName || "").trim().toLowerCase();
    const from = fromDate ? new Date(`${fromDate}T00:00:00.000Z`) : null;
    const to = toDate ? new Date(`${toDate}T00:00:00.000Z`) : null;
    const inRange = (value: any) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && (!from || date >= from) && (!to || date < to);
    };
    const invoiceEntries = invoices.flatMap((invoice: any) => {
      let metadata: any = {};
      try { metadata = invoice.notes ? JSON.parse(invoice.notes) : {}; } catch { metadata = {}; }
      const invoiceFactory = String(metadata.invoiceTo?.company || "").trim();
      if (factory && invoiceFactory.toLowerCase() !== factory) return [];
      const entries: any[] = [];
      if (inRange(invoice.invoiceDate)) {
        entries.push({
          id: `invoice-${invoice.id}`,
          transactionDate: invoice.invoiceDate,
          factoryName: invoiceFactory,
          referenceNo: invoice.invoiceNumber,
          description: `Sales Invoice - ${invoice.invoiceNumber}`,
          debitAmount: Number(invoice.grandTotal) || 0,
          creditAmount: 0,
          paymentMode: "Invoice",
        });
      }
      if (invoice.paymentDate && Number(invoice.paidAmount) > 0 && inRange(invoice.paymentDate)) {
        entries.push({
          id: `receipt-${invoice.id}`,
          transactionDate: invoice.paymentDate,
          factoryName: invoiceFactory,
          referenceNo: `REC-${invoice.invoiceNumber}`,
          description: `Payment Received - ${invoice.invoiceNumber}`,
          debitAmount: 0,
          creditAmount: Number(invoice.paidAmount) || 0,
          paymentMode: "Invoice Payment",
        });
      }
      return entries;
    });
    return [...transactions, ...invoiceEntries];
  }

  async getLedgerOpeningBalance(factoryName: string, fiscalYear: string) {
    const records = await db.ledgerOpeningBalances.findMany({ factoryName, fiscalYear });
    return Number(records[0]?.openingBalance) || 0;
  }

  async saveLedgerOpeningBalance(factoryName: string, fiscalYear: string, openingBalance: number) {
    const existing = await db.ledgerOpeningBalances.findMany({ factoryName, fiscalYear });
    const payload = { factoryName, fiscalYear, openingBalance: Number(openingBalance) || 0 };
    if (existing[0]?.id) return await db.ledgerOpeningBalances.update(existing[0].id, payload);
    return await db.ledgerOpeningBalances.create({ id: `ledger-opening-${Date.now()}`, ...payload });
  }

  async createLedgerTransaction(data: any) {
    const id = data.id || `tx_${Date.now()}`;
    return await db.ledgerTransactions.create({
      id,
      factoryName: data.factoryName || "Factory A",
      transactionDate: data.transactionDate || data.date ? new Date(data.transactionDate || data.date) : new Date(),
      referenceNo: data.referenceNo || data.referenceNumber || `REF-${Date.now().toString().slice(-5)}`,
      description: data.description || data.particulars || "Production advance",
      debitAmount: Number(data.debitAmount || data.debit) || 0,
      creditAmount: Number(data.creditAmount || data.credit) || 0,
      runningBalance: Number(data.runningBalance || data.balance) || 0,
      paymentMode: data.paymentMode || "Bank Transfer",
      notes: data.notes || data.remarks || null,
    });
  }

  async deleteLedgerTransaction(id: string) {
    return await db.ledgerTransactions.delete(id);
  }

  // ── Income & Expenses ────────────────────────────────────────────────────
  async getIncomeEntries(monthKey?: string) {
    const query = monthKey ? { monthKey } : undefined;
    return await db.incomeEntries.findMany(query);
  }

  async createIncomeEntry(data: any) {
    const id = data.id || `inc_${Date.now()}`;
    return await db.incomeEntries.create({
      id,
      monthKey: data.entryDate ? String(data.entryDate).slice(0, 7) : data.monthKey || new Date().toISOString().slice(0, 7),
      sourceName: data.sourceName || data.category || "Income Source",
      category: data.category || "Commission",
      amount: Number(data.amount) || 0,
      entryDate: data.entryDate || data.date ? new Date(data.entryDate || data.date) : new Date(),
      referenceNo: data.referenceNo || null,
      remarks: data.remarks || data.description || null,
    });
  }

  async deleteIncomeEntry(id: string) {
    return await db.incomeEntries.delete(id);
  }

  async updateIncomeEntry(id: string, data: any) {
    return await db.incomeEntries.update(id, data);
  }

  async getExpenseEntries(monthKey?: string) {
    const query = monthKey ? { monthKey } : undefined;
    return await db.expenseEntries.findMany(query);
  }

  async createExpenseEntry(data: any) {
    const id = data.id || `exp_${Date.now()}`;
    return await db.expenseEntries.create({
      id,
      monthKey: data.entryDate ? String(data.entryDate).slice(0, 7) : data.monthKey || new Date().toISOString().slice(0, 7),
      expenseName: data.expenseName || data.category || "Expense",
      category: data.category || "Office",
      amount: Number(data.amount) || 0,
      entryDate: data.entryDate || data.date ? new Date(data.entryDate || data.date) : new Date(),
      paidTo: data.paidTo || null,
      receiptUrl: data.receiptUrl || null,
      remarks: data.remarks || data.description || null,
    });
  }

  async deleteExpenseEntry(id: string) {
    return await db.expenseEntries.delete(id);
  }

  async updateExpenseEntry(id: string, data: any) {
    return await db.expenseEntries.update(id, data);
  }

  // ── Commissions ──────────────────────────────────────────────────────────
  async getCommissions() {
    const [commissionRecords, orders, brands, models, factories] = await Promise.all([
      db.commissions.findMany(),
      db.purchaseOrders.findMany(),
      db.brands.findMany(),
      db.models.findMany(),
      db.factories.findMany(),
    ]);

    const brandMap = new Map((brands || []).map((brand: any) => [brand.id, brand.name]));
    const modelMap = new Map((models || []).map((model: any) => [model.id, model]));
    const factoryMap = new Map((factories || []).map((factory: any) => [factory.id, factory]));
    const orderMap = new Map((orders || []).map((order: any) => [order.id, order]));

    const mergedByOrder = (orders || []).map((order: any) => {
      const model = modelMap.get(order.modelId);
      const commission = commissionRecords.find((record: any) => record.orderNumber === order.poNumber || record.id === `commission-po-${order.id}`)
        || commissionRecords.find((record: any) => record.orderNumber === order.poNumber && record.buyerBrand === (order.brandId || ""));

      const parsedRemarks = (() => {
        if (!commission?.remarks) return {};
        try {
          return typeof commission.remarks === "string" ? JSON.parse(commission.remarks) : commission.remarks;
        } catch {
          return {};
        }
      })();

      const rateInrUsd = Number(parsedRemarks.rateInrUsd ?? parsedRemarks.rate ?? 90) || 90;
      const commissionRatePct = Number(commission?.commissionRatePct ?? 0) || 0;
      const status = commission?.paymentStatus === "Paid" ? "paid" : "unpaid";

      return {
        id: commission?.id || `commission-po-${order.id}`,
        brandId: order.brandId || "",
        brandName: brandMap.get(order.brandId) || commission?.buyerBrand || "Brand",
        styleNo: model?.code || model?.name || order.poNumber || "",
        poNo: order.poNumber || "",
        factory: factoryMap.get(order.factoryId)?.name || model?.factoryName || commission?.factoryName || order.factoryId || "Factory",
        season: order.season || model?.season || "",
        intake: order.department || "",
        shipmentDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().slice(0, 10) : order.orderDate ? new Date(order.orderDate).toISOString().slice(0, 10) : "",
        poValueUsd: Number(order.totalAmount || commission?.orderValue || 0) || 0,
        quantity: Number(order.totalQty) || 0,
        commissionPct: commissionRatePct,
        rateInrUsd,
        status,
        invoice: null,
        orderNumber: order.poNumber || commission?.orderNumber || "",
        paymentStatus: status === "paid" ? "Paid" : "Pending",
      };
    });

    const orphanCommissions = (commissionRecords || [])
      .filter((record: any) => !orderMap.has(record.id.replace("commission-po-", "")))
      .filter((record: any) => !orders.some((order: any) => order.poNumber === record.orderNumber))
      .map((record: any) => {
        const parsedRemarks = (() => {
          if (!record.remarks) return {};
          try {
            return typeof record.remarks === "string" ? JSON.parse(record.remarks) : record.remarks;
          } catch {
            return {};
          }
        })();

        return {
          id: record.id,
          brandId: record.buyerBrand || "",
          brandName: record.buyerBrand || "Brand",
          styleNo: record.orderNumber || "",
          poNo: record.orderNumber || "",
          factory: record.factoryName || "Factory",
          season: "",
          intake: "",
          shipmentDate: record.invoiceDate ? new Date(record.invoiceDate).toISOString().slice(0, 10) : "",
          poValueUsd: Number(record.orderValue) || 0,
          quantity: 0,
          commissionPct: Number(record.commissionRatePct) || 0,
          rateInrUsd: Number(parsedRemarks.rateInrUsd ?? parsedRemarks.rate ?? 90) || 90,
          status: record.paymentStatus === "Paid" ? "paid" : "unpaid",
          invoice: null,
          orderNumber: record.orderNumber || "",
          paymentStatus: record.paymentStatus || "Pending",
        };
      });

    return [...mergedByOrder, ...orphanCommissions];
  }

  async createCommission(data: any) {
    const id = data.id || `comm_${Date.now()}`;
    const orderValue = Number(data.orderValue) || 0;
    const commissionRatePct = Number(data.commissionRatePct || data.rate) || 5;
    const commissionAmount = Number(data.commissionAmount) || (orderValue * commissionRatePct / 100);

    return await db.commissions.create({
      id,
      buyerBrand: data.buyerBrand || data.brand || "Brand",
      factoryName: data.factoryName || data.factory || "Factory",
      orderNumber: data.orderNumber || data.poNumber || `ORD-${Date.now().toString().slice(-5)}`,
      orderValue,
      commissionRatePct,
      commissionAmount,
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
      paymentStatus: data.paymentStatus || "Pending",
      remarks: data.remarks || null,
    });
  }

  async updateCommission(id: string, data: any) {
    const existing = await db.commissions.selectById(id);
    if (!existing) {
      const orderValue = Number(data.orderValue ?? data.poValueUsd ?? 0) || 0;
      const commissionRate = Number(data.commissionRatePct ?? data.commissionPct ?? 0) || 0;
      const computedCommissionAmount = data.commissionAmount !== undefined && data.commissionAmount !== null
        ? Number(data.commissionAmount)
        : orderValue * (commissionRate / 100);
      const payload = {
        id,
        buyerBrand: data.buyerBrand || data.brandId || data.brandName || "Brand",
        factoryName: data.factoryName || data.factory || "Factory",
        orderNumber: data.orderNumber || data.poNo || data.poNumber || `PO-${Date.now().toString().slice(-6)}`,
        orderValue,
        commissionRatePct: commissionRate,
        commissionAmount: computedCommissionAmount || 0,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : null,
        paymentStatus: data.paymentStatus || (data.status === "paid" ? "Paid" : "Pending"),
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : null,
        remarks: data.remarks || null,
      };
      return await db.commissions.insert(payload);
    }

    return await db.commissions.update(id, data);
  }

  async deleteCommission(id: string) {
    return await db.commissions.delete(id);
  }

  // ── Staff Members ────────────────────────────────────────────────────────
  async getStaffMembers() {
    return await db.staffMembers.findMany({ isActive: true });
  }

  async createStaffMember(data: any) {
    const id = data.id || `stf_${Date.now()}`;
    return await db.staffMembers.create({
      id,
      staffCode: data.staffCode || `EMP-${Date.now().toString().slice(-4)}`,
      fullName: data.fullName || data.name || "Staff Member",
      designation: data.designation || data.role || "Merchandiser",
      department: data.department || "Merchandising",
      dateOfJoining: data.dateOfJoining ? new Date(data.dateOfJoining) : new Date(),
      phone: data.phone || null,
      email: data.email || null,
      baseSalary: Number(data.baseSalary || data.fixedSalary) || 0,
      hra: Number(data.hra) || 0,
      allowances: Number(data.allowances) || 0,
      fuelAllowance: Boolean(data.fuelAllowance),
      vehicleMileage: Number(data.vehicleMileage) || 15,
      bankAccount: data.bankAccount || null,
      panNumber: data.panNumber || null,
      isActive: true,
    });
  }

  async updateStaffMember(id: string, data: any) {
    return await db.staffMembers.update(id, data);
  }

  async deleteStaffMember(id: string) {
    return await db.staffMembers.delete(id);
  }

  // ── Attendance ───────────────────────────────────────────────────────────
  async getAttendanceRecords(year?: number, month?: number) {
    const records = await db.attendanceRecords.findMany();
    return records.filter((record: any) => {
      if (!record.attendanceDate) return false;
      const date = new Date(record.attendanceDate);
      if (Number.isNaN(date.getTime())) return false;
      if (year !== undefined && date.getUTCFullYear() !== year) return false;
      if (month !== undefined && date.getUTCMonth() + 1 !== month) return false;
      return true;
    });
  }

  async saveAttendanceRecord(data: any) {
    const id = data.id || `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const attendanceDate = data.attendanceDate ? new Date(data.attendanceDate) : new Date();
    const payload = {
      staffId: data.staffId,
      attendanceDate,
      status: data.status || "Present",
      overtimeHours: Number(data.overtimeHours) || 0,
      notes: data.notes || null,
    };
    const existing = await db.attendanceRecords.findMany({
      staffId: data.staffId,
      attendanceDate,
    });
    if (existing[0]?.id) {
      return await db.attendanceRecords.update(existing[0].id, payload);
    }
    return await db.attendanceRecords.create({
      id,
      ...payload,
    });
  }

  async updateAttendanceRecord(id: string, data: any) {
    return await db.attendanceRecords.update(id, {
      status: data.status,
      overtimeHours: Number(data.overtimeHours) || 0,
      notes: data.notes || null,
      ...(data.attendanceDate ? { attendanceDate: new Date(data.attendanceDate) } : {}),
    });
  }

  // ── Salary Slips & Salaries ──────────────────────────────────────────────
  async getSalarySlips(salaryMonth?: string) {
    const query = salaryMonth ? { salaryMonth } : undefined;
    const [slips, staff] = await Promise.all([
      db.salarySlips.findMany(query),
      db.staffMembers.findMany({ isActive: true }),
    ]);
    const staffMap = new Map(staff.map((member: any) => [member.id, member]));
    return slips.map((slip: any) => ({
      ...slip,
      fullName: staffMap.get(slip.staffId)?.fullName || "Staff",
      staffCode: staffMap.get(slip.staffId)?.staffCode || slip.staffId,
      designation: staffMap.get(slip.staffId)?.designation || "Staff",
      department: staffMap.get(slip.staffId)?.department || "",
    }));
  }

  async createSalarySlip(data: any) {
    const id = data.id || `slip_${Date.now()}`;
    const basicPay = Number(data.basicPay || data.basicSalary) || 0;
    const hra = Number(data.hra) || 0;
    const allowances = Number(data.allowances) || 0;
    const mileageKm = Number(data.mileageKm) || 0;
    const fuelRate = Number(data.fuelRate) || 0;
    const fuelCharge = Number(data.fuelCharge) || 0;
    const overtimePay = Number(data.overtimePay) || 0;
    const grossSalary = Number(data.grossSalary) || (basicPay + hra + allowances + overtimePay);
    const pfDeduction = Number(data.pfDeduction) || 0;
    const esiDeduction = Number(data.esiDeduction) || 0;
    const tdsDeduction = Number(data.tdsDeduction) || 0;
    const advanceRecovery = Number(data.advanceRecovery || data.advanceDeduction) || 0;
    const totalDeductions = pfDeduction + esiDeduction + tdsDeduction + advanceRecovery;
    const netSalary = Number(data.netSalary || data.netPay) || (grossSalary - totalDeductions);

    const salaryMonth = data.salaryMonth || data.month || new Date().toISOString().slice(0, 7);
    const payload = {
      staffId: data.staffId,
      salaryMonth,
      workingDays: Number(data.workingDays) || 26,
      presentDays: Number(data.presentDays) || 26,
      basicPay,
      hra,
      allowances,
      mileageKm,
      fuelRate,
      fuelCharge,
      overtimePay,
      grossSalary,
      pfDeduction,
      esiDeduction,
      tdsDeduction,
      advanceRecovery,
      totalDeductions,
      netSalary,
      paymentStatus: data.paymentStatus || "Paid",
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
    };
    const existing = await db.salarySlips.findMany({ staffId: data.staffId, salaryMonth });
    if (existing[0]?.id) {
      return await db.salarySlips.update(existing[0].id, payload);
    }
    return await db.salarySlips.create({ id, ...payload });
  }

  async deleteSalarySlip(id: string) {
    return await db.salarySlips.delete(id);
  }

  async updateSalarySlip(id: string, data: any) {
    const basicPay = Number(data.basicPay || data.basicSalary) || 0;
    const hra = Number(data.hra) || 0;
    const allowances = Number(data.allowances) || 0;
    const mileageKm = Number(data.mileageKm) || 0;
    const fuelRate = Number(data.fuelRate) || 0;
    const fuelCharge = Number(data.fuelCharge) || 0;
    const overtimePay = Number(data.overtimePay) || 0;
    const grossSalary = Number(data.grossSalary) || basicPay + hra + allowances + overtimePay;
    const pfDeduction = Number(data.pfDeduction) || 0;
    const esiDeduction = Number(data.esiDeduction) || 0;
    const tdsDeduction = Number(data.tdsDeduction) || 0;
    const advanceRecovery = Number(data.advanceRecovery || data.advanceDeduction) || 0;
    const totalDeductions = pfDeduction + esiDeduction + tdsDeduction + advanceRecovery;
    const netSalary = Number(data.netSalary || data.netPay) || grossSalary - totalDeductions;

    return await db.salarySlips.update(id, {
      workingDays: Number(data.workingDays) || 26,
      presentDays: Number(data.presentDays) || 26,
      basicPay,
      hra,
      allowances,
      mileageKm,
      fuelRate,
      fuelCharge,
      overtimePay,
      grossSalary,
      pfDeduction,
      esiDeduction,
      tdsDeduction,
      advanceRecovery,
      totalDeductions,
      netSalary,
      paymentStatus: data.paymentStatus || "Paid",
      ...(data.paymentDate ? { paymentDate: new Date(data.paymentDate) } : {}),
    });
  }

  // ── Advance Payments ─────────────────────────────────────────────────────
  async getAdvances(staffId?: string) {
    const query = staffId ? { staffId } : undefined;
    return await db.advancePayments.findMany(query);
  }

  async createAdvance(data: any) {
    const id = data.id || `adv_${Date.now()}`;
    const amount = Number(data.amount || data.totalAmount) || 0;
    const monthlyDeduction = Number(data.monthlyDeduction) || 0;

    return await db.advancePayments.create({
      id,
      staffId: data.staffId || data.employeeId,
      amount,
      balanceAmount: Number(data.balanceAmount || data.balanceRemaining) || amount,
      monthlyDeduction,
      advanceDate: data.advanceDate || data.disbursedDate || data.date
        ? new Date(data.advanceDate || data.disbursedDate || data.date)
        : new Date(),
      status: data.status || "Active",
      reason: data.reason || data.purpose || data.description || null,
      deductionHistory: Array.isArray(data.deductionHistory) ? data.deductionHistory : [],
    });
  }

  async updateAdvance(id: string, data: any) {
    const current = await db.advancePayments.findOne(id);
    if (!current) return null;

    const amount = Number(data.amount ?? current.amount) || 0;
    const repaidAmount = Math.min(
      amount,
      Math.max(0, Number(data.repaidAmount ?? current.repaidAmount) || 0),
    );
    const balanceAmount = Math.max(0, amount - repaidAmount);
    const deductionHistory = Array.isArray(data.deductionHistory)
      ? data.deductionHistory
      : Array.isArray((current as any).deductionHistory) ? (current as any).deductionHistory : [];

    return await db.advancePayments.update(id, {
      repaidAmount,
      balanceAmount,
      status: balanceAmount === 0 ? "Completed" : (data.status || "Active"),
      deductionHistory,
    });
  }

  async deleteAdvance(id: string) {
    return await db.advancePayments.delete(id);
  }

  // ── Company Settings ─────────────────────────────────────────────────────
  async getCompanySettings() {
    const settings = await db.companySettings.findMany();
    return settings[0] || null;
  }

  async saveCompanySettings(data: any) {
    const existing = await this.getCompanySettings();
    if (existing && existing.id) {
      return await db.companySettings.update(existing.id, data);
    }
    return await db.companySettings.create({
      id: "company_setting_default",
      ...data,
    });
  }

  async getFactoryCommissionRates() {
    const rates = await db.factoryCommissionRates.findMany();
    return (rates || []).map((rate: any) => ({
      id: rate.id,
      factory: rate.factoryName || "",
      factoryName: rate.factoryName || "",
      commissionPct: Number(rate.commissionRatePct) || 0,
      commissionRatePct: Number(rate.commissionRatePct) || 0,
    }));
  }

  async saveFactoryCommissionRate(data: any) {
    const factoryName = String(data.factoryName || data.factory || "").trim();
    const commissionRatePct = Number(data.commissionRatePct ?? data.commissionPct ?? 0) || 0;

    if (!factoryName) {
      throw new Error("Factory name is required");
    }

    const existing = data.id ? await db.factoryCommissionRates.findOne(data.id) : await db.factoryCommissionRates.findMany({ factoryName });
    const target = existing && typeof existing === "object" && "id" in existing ? existing : Array.isArray(existing) ? existing[0] : null;

    const payload = {
      factoryName,
      commissionRatePct,
    };

    if (target && target.id) {
      return await db.factoryCommissionRates.update(target.id, payload);
    }

    return await db.factoryCommissionRates.create({
      id: data.id || `factory-rate-${Date.now()}`,
      ...payload,
    });
  }

  async deleteFactoryCommissionRate(id: string) {
    return await db.factoryCommissionRates.delete(id);
  }
}

export const financeService = new FinanceService();

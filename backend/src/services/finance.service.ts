import { db } from "../config/db.js";

export class FinanceService {
  // ── Invoices ─────────────────────────────────────────────────────────────
  async getInvoices() {
    return await db.invoices.findMany();
  }

  async getInvoiceById(id: string) {
    return await db.invoices.findOne(id);
  }

  async createInvoice(data: any) {
    const id = data.id || `inv_${Date.now()}`;
    const subtotal = Number(data.subtotal) || 0;
    const cgstAmount = Number(data.cgstAmount) || 0;
    const sgstAmount = Number(data.sgstAmount) || 0;
    const igstAmount = Number(data.igstAmount) || 0;
    const grandTotal = Number(data.grandTotal) || Number(data.totalAmount) || (subtotal + cgstAmount + sgstAmount + igstAmount);

    return await db.invoices.create({
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
      balanceAmount: Number(data.balanceAmount) || grandTotal,
      paymentStatus: data.paymentStatus || "Unpaid",
      notes: data.notes || null,
    });
  }

  async updateInvoice(id: string, data: any) {
    return await db.invoices.update(id, data);
  }

  async deleteInvoice(id: string) {
    return await db.invoices.delete(id);
  }

  // ── Factory Ledger ───────────────────────────────────────────────────────
  async getLedgerTransactions(factoryName?: string) {
    const query = factoryName ? { factoryName } : undefined;
    return await db.ledgerTransactions.findMany(query);
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
      monthKey: data.monthKey || new Date().toISOString().slice(0, 7),
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
      monthKey: data.monthKey || new Date().toISOString().slice(0, 7),
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
    return await db.commissions.findMany();
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
    return await db.attendanceRecords.create({
      id,
      staffId: data.staffId,
      attendanceDate: data.attendanceDate ? new Date(data.attendanceDate) : new Date(),
      status: data.status || "Present",
      overtimeHours: Number(data.overtimeHours) || 0,
      notes: data.notes || null,
    });
  }

  // ── Salary Slips & Salaries ──────────────────────────────────────────────
  async getSalarySlips(salaryMonth?: string) {
    const query = salaryMonth ? { salaryMonth } : undefined;
    return await db.salarySlips.findMany(query);
  }

  async createSalarySlip(data: any) {
    const id = data.id || `slip_${Date.now()}`;
    const basicPay = Number(data.basicPay || data.basicSalary) || 0;
    const hra = Number(data.hra) || 0;
    const allowances = Number(data.allowances) || 0;
    const overtimePay = Number(data.overtimePay) || 0;
    const grossSalary = Number(data.grossSalary) || (basicPay + hra + allowances + overtimePay);
    const pfDeduction = Number(data.pfDeduction) || 0;
    const esiDeduction = Number(data.esiDeduction) || 0;
    const tdsDeduction = Number(data.tdsDeduction) || 0;
    const advanceRecovery = Number(data.advanceRecovery || data.advanceDeduction) || 0;
    const totalDeductions = pfDeduction + esiDeduction + tdsDeduction + advanceRecovery;
    const netSalary = Number(data.netSalary || data.netPay) || (grossSalary - totalDeductions);

    return await db.salarySlips.create({
      id,
      staffId: data.staffId,
      salaryMonth: data.salaryMonth || data.month || new Date().toISOString().slice(0, 7),
      workingDays: Number(data.workingDays) || 26,
      presentDays: Number(data.presentDays) || 26,
      basicPay,
      hra,
      allowances,
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
    });
  }

  async deleteSalarySlip(id: string) {
    return await db.salarySlips.delete(id);
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

    return await db.advancePayments.update(id, {
      repaidAmount,
      balanceAmount,
      status: balanceAmount === 0 ? "Completed" : (data.status || "Active"),
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
}

export const financeService = new FinanceService();

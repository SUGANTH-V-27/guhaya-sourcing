import { db } from "../config/db.js";
import {
  Invoice,
  FactoryLedgerTransaction,
  IncomeExpenseEntry,
  StaffSalary,
} from "../types/index.js";

export class FinanceService {
  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return (await db.invoices.select()) as Invoice[];
  }

  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    const id = data.id || `inv_${Date.now()}`;
    const items = data.items || [];
    const subtotal = data.subtotal || items.reduce((sum: number, item: any) => sum + (Number(item.total) || 0), 0);
    const taxAmount = data.taxAmount || 0;
    const totalAmount = data.totalAmount || (subtotal + taxAmount);

    return (await db.invoices.insert({
      ...data,
      id,
      invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      brandName: data.brandName || "Brand Client",
      invoiceDate: data.invoiceDate || new Date().toISOString().split("T")[0],
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
      items,
      subtotal,
      taxAmount,
      totalAmount,
      currency: data.currency || "USD",
      status: data.status || "Sent",
    })) as Invoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return await db.invoices.delete(id);
  }

  // Factory Ledger
  async getLedgerTransactions(factoryName?: string): Promise<FactoryLedgerTransaction[]> {
    const query = factoryName ? { factoryName } : undefined;
    return (await db.ledgerTransactions.select(query)) as FactoryLedgerTransaction[];
  }

  async createLedgerTransaction(data: Partial<FactoryLedgerTransaction>): Promise<FactoryLedgerTransaction> {
    const id = data.id || `tx_${Date.now()}`;
    return (await db.ledgerTransactions.insert({
      ...data,
      id,
      factoryName: data.factoryName || "Factory A",
      date: data.date || new Date().toISOString().split("T")[0],
      referenceNumber: data.referenceNumber || `REF-${Date.now().toString().slice(-5)}`,
      description: data.description || "Production advance",
      debit: Number(data.debit) || 0,
      credit: Number(data.credit) || 0,
      balance: Number(data.balance) || 0,
      type: data.type || "Invoice",
    })) as FactoryLedgerTransaction;
  }

  // Income / Expenses
  async getIncomeExpenses(): Promise<IncomeExpenseEntry[]> {
    return (await db.incomeExpenses.select()) as IncomeExpenseEntry[];
  }

  async createIncomeExpense(data: Partial<IncomeExpenseEntry>): Promise<IncomeExpenseEntry> {
    const id = data.id || `ie_${Date.now()}`;
    return (await db.incomeExpenses.insert({
      ...data,
      id,
      date: data.date || new Date().toISOString().split("T")[0],
      type: data.type || "Expense",
      category: data.category || "General",
      amount: Number(data.amount) || 0,
      paymentMode: data.paymentMode || "Bank Transfer",
      description: data.description || "Operating expense",
    })) as IncomeExpenseEntry;
  }

  async deleteIncomeExpense(id: string): Promise<boolean> {
    return await db.incomeExpenses.delete(id);
  }

  // Commissions
  async getCommissions() {
    return await db.commissions.select();
  }

  async createCommission(data: any) {
    return await db.commissions.insert(data);
  }

  // Attendance & Salaries
  async getAttendance() {
    return await db.attendanceRecords.select();
  }

  async saveAttendance(data: any) {
    return await db.attendanceRecords.insert(data);
  }

  async getSalaries(): Promise<StaffSalary[]> {
    return (await db.staffSalaries.select()) as StaffSalary[];
  }

  async createSalary(data: Partial<StaffSalary>): Promise<StaffSalary> {
    const id = data.id || `sal_${Date.now()}`;
    const basicSalary = Number(data.basicSalary) || 0;
    const allowances = Number(data.allowances) || 0;
    const deductions = Number(data.deductions) || 0;
    const netSalary = data.netSalary || (basicSalary + allowances - deductions);

    return (await db.staffSalaries.insert({
      ...data,
      id,
      staffName: data.staffName || "Staff Member",
      designation: data.designation || "Merchandiser",
      month: data.month || new Date().toISOString().slice(0, 7),
      basicSalary,
      allowances,
      deductions,
      netSalary,
      paymentStatus: data.paymentStatus || "Pending",
    })) as StaffSalary;
  }

  // Company Settings
  async getCompanySettings() {
    const settings = await db.companySettings.select();
    return settings[0] || null;
  }

  async saveCompanySettings(data: any) {
    const existing = await this.getCompanySettings();
    if (existing && existing.id) {
      return await db.companySettings.update(existing.id, data);
    }
    return await db.companySettings.insert(data);
  }
}

export const financeService = new FinanceService();

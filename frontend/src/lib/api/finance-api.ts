import { db } from "../db/db-client";

export const FinanceApi = {
  // Invoices
  async getInvoices() {
    return await db.invoices.getAll();
  },

  async getInvoiceById(id: string) {
    return await db.invoices.getById(id);
  },

  async saveInvoice(invoice: any) {
    if (invoice.id) {
      return await db.invoices.update(invoice.id, invoice);
    }
    return await db.invoices.insert(invoice);
  },

  async deleteInvoice(id: string) {
    return await db.invoices.delete(id);
  },

  // Company Settings
  async getCompanySettings() {
    const settings = await db.companySettings.getAll();
    return settings[0] || null;
  },

  async saveCompanySettings(settings: any) {
    const existing = await this.getCompanySettings();
    if (existing) {
      return await db.companySettings.update(existing.id, settings);
    }
    return await db.companySettings.insert(settings);
  },

  // Factory Ledger
  async getFactoryLedgers(factoryName?: string) {
    if (factoryName && factoryName !== "all") {
      return await db.factoryLedgers.query(
        (t) => t.factoryName?.toLowerCase() === factoryName.toLowerCase()
      );
    }
    return await db.factoryLedgers.getAll();
  },

  async saveLedgerTransaction(tx: any) {
    if (tx.id) {
      return await db.factoryLedgers.update(tx.id, tx);
    }
    return await db.factoryLedgers.insert(tx);
  },

  // Income & Expenses
  async getMonthlyLedgers() {
    return await db.monthlyLedgers.getAll();
  },

  async getMonthlyLedgerByKey(monthKey: string) {
    const ledgers = await db.monthlyLedgers.query((m) => m.monthKey === monthKey);
    return ledgers[0] || null;
  },

  async getIncomeEntries(monthKey?: string) {
    if (monthKey) {
      return await db.incomeEntries.query((e) => e.monthKey === monthKey);
    }
    return await db.incomeEntries.getAll();
  },

  async saveIncomeEntry(entry: any) {
    if (entry.id) {
      return await db.incomeEntries.update(entry.id, entry);
    }
    return await db.incomeEntries.insert(entry);
  },

  async getExpenseEntries(monthKey?: string) {
    if (monthKey) {
      return await db.expenseEntries.query((e) => e.monthKey === monthKey);
    }
    return await db.expenseEntries.getAll();
  },

  async saveExpenseEntry(entry: any) {
    if (entry.id) {
      return await db.expenseEntries.update(entry.id, entry);
    }
    return await db.expenseEntries.insert(entry);
  },

  // Commissions
  async getCommissions() {
    return await db.commissionRecords.getAll();
  },

  async saveCommission(commission: any) {
    if (commission.id) {
      return await db.commissionRecords.update(commission.id, commission);
    }
    return await db.commissionRecords.insert(commission);
  },

  async deleteCommission(id: string) {
    return await db.commissionRecords.delete(id);
  },

  // Salary & Staff
  async getStaffMembers() {
    return await db.staffMembers.getAll();
  },

  async saveStaffMember(staff: any) {
    if (staff.id) {
      return await db.staffMembers.update(staff.id, staff);
    }
    return await db.staffMembers.insert(staff);
  },

  async deleteStaffMember(id: string) {
    return await db.staffMembers.delete(id);
  },

  async getAttendanceRecords(staffId?: string, monthKey?: string) {
    return await db.attendanceRecords.query((att) => {
      if (staffId && att.staffId !== staffId) return false;
      if (monthKey && !att.attendanceDate?.startsWith(monthKey)) return false;
      return true;
    });
  },

  async saveAttendanceRecord(record: any) {
    if (record.id) {
      return await db.attendanceRecords.update(record.id, record);
    }
    return await db.attendanceRecords.insert(record);
  },

  async getSalarySlips(monthKey?: string) {
    if (monthKey) {
      return await db.salarySlips.query((s) => s.salaryMonth === monthKey);
    }
    return await db.salarySlips.getAll();
  },

  async saveSalarySlip(slip: any) {
    if (slip.id) {
      return await db.salarySlips.update(slip.id, slip);
    }
    return await db.salarySlips.insert(slip);
  },

  async getAdvancePayments(staffId?: string) {
    if (staffId) {
      return await db.advancePayments.query((a) => a.staffId === staffId);
    }
    return await db.advancePayments.getAll();
  },

  async saveAdvancePayment(adv: any) {
    if (adv.id) {
      return await db.advancePayments.update(adv.id, adv);
    }
    return await db.advancePayments.insert(adv);
  },
};

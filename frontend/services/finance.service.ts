import { api } from "./api";

export const financeService = {
  // Invoices
  async getInvoices() {
    return await api.get<any[]>("/finance/invoices");
  },
  async createInvoice(data: any) {
    return await api.post<any>("/finance/invoices", data);
  },
  async updateInvoice(id: string, data: any) {
    return await api.put<any>(`/finance/invoices/${id}`, data);
  },
  async deleteInvoice(id: string) {
    return await api.delete(`/finance/invoices/${id}`);
  },

  // Factory Ledger
  async getLedger(factory?: string) {
    const url = factory ? `/finance/ledger?factory=${encodeURIComponent(factory)}` : "/finance/ledger";
    return await api.get<any[]>(url);
  },
  async createLedgerEntry(data: any) {
    return await api.post<any>("/finance/ledger", data);
  },
  async deleteLedgerEntry(id: string) {
    return await api.delete(`/finance/ledger/${id}`);
  },

  // Income & Expenses
  async getIncomeExpenses(month?: string) {
    const url = month ? `/finance/income-expenses?month=${encodeURIComponent(month)}` : "/finance/income-expenses";
    return await api.get<{ income: any[]; expenses: any[] }>(url);
  },
  async createIncome(data: any) {
    return await api.post<any>("/finance/income", data);
  },
  async createExpense(data: any) {
    return await api.post<any>("/finance/expense", data);
  },
  async deleteIncome(id: string) {
    return await api.delete(`/finance/income/${id}`);
  },
  async deleteExpense(id: string) {
    return await api.delete(`/finance/expense/${id}`);
  },

  // Commissions
  async getCommissions() {
    return await api.get<any[]>("/finance/commissions");
  },
  async createCommission(data: any) {
    return await api.post<any>("/finance/commissions", data);
  },
  async updateCommission(id: string, data: any) {
    return await api.put<any>(`/finance/commissions/${id}`, data);
  },
  async deleteCommission(id: string) {
    return await api.delete(`/finance/commissions/${id}`);
  },

  // Staff Members
  async getStaff() {
    return await api.get<any[]>("/finance/staff");
  },
  async createStaff(data: any) {
    return await api.post<any>("/finance/staff", data);
  },
  async updateStaff(id: string, data: any) {
    return await api.put<any>(`/finance/staff/${id}`, data);
  },
  async deleteStaff(id: string) {
    return await api.delete(`/finance/staff/${id}`);
  },

  // Attendance
  async getAttendance(year?: number, month?: number) {
    const q = year && month ? `?year=${year}&month=${month}` : "";
    return await api.get<any[]>(`/finance/attendance${q}`);
  },
  async saveAttendance(data: any) {
    return await api.post<any>("/finance/attendance", data);
  },

  // Salaries
  async getSalaries(month?: string) {
    const q = month ? `?month=${encodeURIComponent(month)}` : "";
    return await api.get<any[]>(`/finance/salaries${q}`);
  },
  async createSalary(data: any) {
    return await api.post<any>("/finance/salaries", data);
  },
  async deleteSalary(id: string) {
    return await api.delete(`/finance/salaries/${id}`);
  },

  // Advances
  async getAdvances(staffId?: string) {
    const q = staffId ? `?staffId=${encodeURIComponent(staffId)}` : "";
    return await api.get<any[]>(`/finance/advances${q}`);
  },
  async createAdvance(data: any) {
    return await api.post<any>("/finance/advances", data);
  },
  async updateAdvance(id: string, data: any) {
    return await api.put<any>(`/finance/advances/${id}`, data);
  },
  async deleteAdvance(id: string) {
    return await api.delete(`/finance/advances/${id}`);
  },

  // Settings
  async getCompanySettings() {
    return await api.get<any>("/finance/settings");
  },
  async saveCompanySettings(data: any) {
    return await api.post<any>("/finance/settings", data);
  },
};

export default financeService;

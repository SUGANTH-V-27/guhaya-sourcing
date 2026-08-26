import { Request, Response } from "express";
import { financeService } from "../services/finance.service.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

// Invoices
export const getInvoices = async (_req: Request, res: Response) => {
  try {
    const data = await financeService.getInvoices();
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch invoices", 500, error);
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const data = await financeService.createInvoice(req.body);
    return sendSuccess(res, data, "Invoice created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create invoice", 400, error);
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await financeService.updateInvoice(id, req.body);
    return sendSuccess(res, data, "Invoice updated successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update invoice", 400, error);
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await financeService.deleteInvoice(id);
    return sendSuccess(res, { id }, "Invoice deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete invoice", 500, error);
  }
};

// Factory Ledger
export const getLedger = async (req: Request, res: Response) => {
  try {
    const { factory } = req.query;
    const data = await financeService.getLedgerTransactions(factory as string);
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch ledger transactions", 500, error);
  }
};

export const createLedgerEntry = async (req: Request, res: Response) => {
  try {
    const data = await financeService.createLedgerTransaction(req.body);
    return sendSuccess(res, data, "Ledger transaction recorded successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to record ledger transaction", 400, error);
  }
};

export const deleteLedgerEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await financeService.deleteLedgerTransaction(id);
    return sendSuccess(res, { id }, "Ledger entry deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete ledger entry", 500, error);
  }
};

// Income & Expenses
export const getIncomeExpenses = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    const income = await financeService.getIncomeEntries(month as string);
    const expenses = await financeService.getExpenseEntries(month as string);
    return sendSuccess(res, { income, expenses });
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch income/expenses", 500, error);
  }
};

export const createIncome = async (req: Request, res: Response) => {
  try {
    const data = await financeService.createIncomeEntry(req.body);
    return sendSuccess(res, data, "Income entry recorded", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to record income", 400, error);
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const data = await financeService.createExpenseEntry(req.body);
    return sendSuccess(res, data, "Expense entry recorded", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to record expense", 400, error);
  }
};

export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await financeService.deleteIncomeEntry(id);
    return sendSuccess(res, { id }, "Income deleted");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete income", 500, error);
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await financeService.deleteExpenseEntry(id);
    return sendSuccess(res, { id }, "Expense deleted");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete expense", 500, error);
  }
};

// Commissions
export const getCommissions = async (_req: Request, res: Response) => {
  try {
    const data = await financeService.getCommissions();
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch commissions", 500, error);
  }
};

export const createCommission = async (req: Request, res: Response) => {
  try {
    const data = await financeService.createCommission(req.body);
    return sendSuccess(res, data, "Commission created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create commission", 400, error);
  }
};

export const updateCommission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await financeService.updateCommission(id, req.body);
    return sendSuccess(res, data, "Commission updated");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update commission", 400, error);
  }
};

export const deleteCommission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await financeService.deleteCommission(id);
    return sendSuccess(res, { id }, "Commission deleted");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete commission", 500, error);
  }
};

// Staff Members
export const getStaff = async (_req: Request, res: Response) => {
  try {
    const data = await financeService.getStaffMembers();
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch staff members", 500, error);
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const data = await financeService.createStaffMember(req.body);
    return sendSuccess(res, data, "Staff member created", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create staff member", 400, error);
  }
};

export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await financeService.updateStaffMember(id, req.body);
    return sendSuccess(res, data, "Staff member updated");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to update staff member", 400, error);
  }
};

export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await financeService.deleteStaffMember(id);
    return sendSuccess(res, { id }, "Staff member deleted");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete staff member", 500, error);
  }
};

// Attendance
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;
    const data = await financeService.getAttendanceRecords(
      year ? Number(year) : undefined,
      month ? Number(month) : undefined
    );
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch attendance records", 500, error);
  }
};

export const saveAttendance = async (req: Request, res: Response) => {
  try {
    const data = await financeService.saveAttendanceRecord(req.body);
    return sendSuccess(res, data, "Attendance record saved", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to save attendance", 400, error);
  }
};

// Salaries
export const getSalaries = async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    const data = await financeService.getSalarySlips(month as string);
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch salary slips", 500, error);
  }
};

export const createSalary = async (req: Request, res: Response) => {
  try {
    const data = await financeService.createSalarySlip(req.body);
    return sendSuccess(res, data, "Salary record created", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create salary record", 400, error);
  }
};

export const deleteSalary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await financeService.deleteSalarySlip(id);
    return sendSuccess(res, { id }, "Salary deleted");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete salary", 500, error);
  }
};

// Advances
export const getAdvances = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.query;
    const data = await financeService.getAdvances(staffId as string);
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch advances", 500, error);
  }
};

export const createAdvance = async (req: Request, res: Response) => {
  try {
    const data = await financeService.createAdvance(req.body);
    return sendSuccess(res, data, "Advance recorded", 201);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to create advance", 400, error);
  }
};

export const deleteAdvance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await financeService.deleteAdvance(id);
    return sendSuccess(res, { id }, "Advance deleted");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to delete advance", 500, error);
  }
};

// Settings
export const getCompanySettings = async (_req: Request, res: Response) => {
  try {
    const data = await financeService.getCompanySettings();
    return sendSuccess(res, data);
  } catch (error: any) {
    return sendError(res, error.message || "Failed to fetch company settings", 500, error);
  }
};

export const saveCompanySettings = async (req: Request, res: Response) => {
  try {
    const data = await financeService.saveCompanySettings(req.body);
    return sendSuccess(res, data, "Settings saved successfully");
  } catch (error: any) {
    return sendError(res, error.message || "Failed to save company settings", 400, error);
  }
};

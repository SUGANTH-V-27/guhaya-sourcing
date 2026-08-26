import { Request, Response } from "express";
import { financeService } from "../services/finance.service.js";
import { sendSuccess, sendError } from "../utils/helpers.js";

// Invoices
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await financeService.getInvoices();
    return sendSuccess(res, invoices);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const newInvoice = await financeService.createInvoice(req.body);
    return sendSuccess(res, newInvoice, "Invoice created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await financeService.deleteInvoice(id);
    return sendSuccess(res, { deleted }, "Invoice deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

// Factory Ledger Transactions
export const getLedgerTransactions = async (req: Request, res: Response) => {
  try {
    const { factory } = req.query;
    const txs = await financeService.getLedgerTransactions(factory as string);
    return sendSuccess(res, txs);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createLedgerTransaction = async (req: Request, res: Response) => {
  try {
    const newTx = await financeService.createLedgerTransaction(req.body);
    return sendSuccess(res, newTx, "Ledger transaction created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

// Income/Expenses
export const getIncomeExpenses = async (req: Request, res: Response) => {
  try {
    const entries = await financeService.getIncomeExpenses();
    return sendSuccess(res, entries);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createIncomeExpense = async (req: Request, res: Response) => {
  try {
    const newEntry = await financeService.createIncomeExpense(req.body);
    return sendSuccess(res, newEntry, "Income/Expense entry created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const deleteIncomeExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await financeService.deleteIncomeExpense(id);
    return sendSuccess(res, { deleted }, "Entry deleted successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

// Commissions
export const getCommissions = async (req: Request, res: Response) => {
  try {
    const commissions = await financeService.getCommissions();
    return sendSuccess(res, commissions);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createCommission = async (req: Request, res: Response) => {
  try {
    const newCommission = await financeService.createCommission(req.body);
    return sendSuccess(res, newCommission, "Commission created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

// Attendance & Salaries
export const getAttendance = async (req: Request, res: Response) => {
  try {
    const attendance = await financeService.getAttendance();
    return sendSuccess(res, attendance);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const saveAttendance = async (req: Request, res: Response) => {
  try {
    const saved = await financeService.saveAttendance(req.body);
    return sendSuccess(res, saved, "Attendance saved successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const getSalaries = async (req: Request, res: Response) => {
  try {
    const salaries = await financeService.getSalaries();
    return sendSuccess(res, salaries);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const createSalary = async (req: Request, res: Response) => {
  try {
    const newSalary = await financeService.createSalary(req.body);
    return sendSuccess(res, newSalary, "Salary record created successfully", 201);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

// Company Settings
export const getCompanySettings = async (req: Request, res: Response) => {
  try {
    const settings = await financeService.getCompanySettings();
    return sendSuccess(res, settings);
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

export const saveCompanySettings = async (req: Request, res: Response) => {
  try {
    const saved = await financeService.saveCompanySettings(req.body);
    return sendSuccess(res, saved, "Company settings saved successfully");
  } catch (error: any) {
    return sendError(res, error.message, 500, error);
  }
};

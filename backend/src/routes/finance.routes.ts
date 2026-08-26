import { Router } from "express";
import {
  getInvoices,
  createInvoice,
  deleteInvoice,
  getLedgerTransactions,
  createLedgerTransaction,
  getIncomeExpenses,
  createIncomeExpense,
  deleteIncomeExpense,
  getCommissions,
  createCommission,
  getAttendance,
  saveAttendance,
  getSalaries,
  createSalary,
  getCompanySettings,
  saveCompanySettings,
} from "../controllers/finance.controller.js";

const router = Router();

// Invoices
router.get("/invoices", getInvoices);
router.post("/invoices", createInvoice);
router.delete("/invoices/:id", deleteInvoice);

// Factory Ledger
router.get("/ledger", getLedgerTransactions);
router.post("/ledger", createLedgerTransaction);

// Income & Expenses
router.get("/income-expenses", getIncomeExpenses);
router.post("/income-expenses", createIncomeExpense);
router.delete("/income-expenses/:id", deleteIncomeExpense);

// Commissions
router.get("/commissions", getCommissions);
router.post("/commissions", createCommission);

// HR / Attendance & Salaries
router.get("/attendance", getAttendance);
router.post("/attendance", saveAttendance);
router.get("/salaries", getSalaries);
router.post("/salaries", createSalary);

// Company Settings
router.get("/company-settings", getCompanySettings);
router.post("/company-settings", saveCompanySettings);

export default router;

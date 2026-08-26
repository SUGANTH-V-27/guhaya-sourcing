import { Router } from "express";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getLedger,
  createLedgerEntry,
  deleteLedgerEntry,
  getIncomeExpenses,
  createIncome,
  createExpense,
  deleteIncome,
  deleteExpense,
  getCommissions,
  createCommission,
  updateCommission,
  deleteCommission,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getAttendance,
  saveAttendance,
  getSalaries,
  createSalary,
  deleteSalary,
  getAdvances,
  createAdvance,
  deleteAdvance,
  getCompanySettings,
  saveCompanySettings,
} from "../controllers/finance.controller.js";

const router = Router();

// Invoices
router.get("/invoices", getInvoices);
router.post("/invoices", createInvoice);
router.put("/invoices/:id", updateInvoice);
router.delete("/invoices/:id", deleteInvoice);

// Factory Ledger
router.get("/ledger", getLedger);
router.post("/ledger", createLedgerEntry);
router.delete("/ledger/:id", deleteLedgerEntry);

// Income & Expenses
router.get("/income-expenses", getIncomeExpenses);
router.post("/income", createIncome);
router.post("/expense", createExpense);
router.delete("/income/:id", deleteIncome);
router.delete("/expense/:id", deleteExpense);

// Commissions
router.get("/commissions", getCommissions);
router.post("/commissions", createCommission);
router.put("/commissions/:id", updateCommission);
router.delete("/commissions/:id", deleteCommission);

// Staff Members
router.get("/staff", getStaff);
router.post("/staff", createStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

// Attendance
router.get("/attendance", getAttendance);
router.post("/attendance", saveAttendance);

// Salaries
router.get("/salaries", getSalaries);
router.post("/salaries", createSalary);
router.delete("/salaries/:id", deleteSalary);

// Advances
router.get("/advances", getAdvances);
router.post("/advances", createAdvance);
router.delete("/advances/:id", deleteAdvance);

// Company Settings
router.get("/settings", getCompanySettings);
router.post("/settings", saveCompanySettings);

export default router;

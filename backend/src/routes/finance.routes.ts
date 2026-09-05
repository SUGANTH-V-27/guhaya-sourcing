import { Router } from "express";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getLedger,
  getLedgerOpeningBalance,
  saveLedgerOpeningBalance,
  createLedgerEntry,
  deleteLedgerEntry,
  getIncomeExpenses,
  createIncome,
  createExpense,
  deleteIncome,
  updateIncome,
  deleteExpense,
  updateExpense,
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
  updateAttendance,
  getSalaries,
  createSalary,
  updateSalary,
  deleteSalary,
  getAdvances,
  createAdvance,
  updateAdvance,
  deleteAdvance,
  getCompanySettings,
  saveCompanySettings,
  getFactoryCommissionRates,
  saveFactoryCommissionRate,
  deleteFactoryCommissionRate,
} from "../controllers/finance.controller.js";
import { authorize } from "../middlewares/auth.middleware.js";

const router = Router();
const financeWrite = authorize(["Admin", "Finance Manager"]);
const staffWrite = authorize(["Admin"]);

// Invoices
router.get("/invoices", getInvoices);
router.get("/invoices/:id", getInvoiceById);
router.post("/invoices", financeWrite, createInvoice);
router.put("/invoices/:id", financeWrite, updateInvoice);
router.delete("/invoices/:id", financeWrite, deleteInvoice);

// Factory Ledger
router.get("/ledger", getLedger);
router.get("/ledger/opening-balance", getLedgerOpeningBalance);
router.put("/ledger/opening-balance", financeWrite, saveLedgerOpeningBalance);
router.post("/ledger", financeWrite, createLedgerEntry);
router.delete("/ledger/:id", financeWrite, deleteLedgerEntry);

// Income & Expenses
router.get("/income-expenses", getIncomeExpenses);
router.post("/income", financeWrite, createIncome);
router.put("/income/:id", financeWrite, updateIncome);
router.post("/expense", financeWrite, createExpense);
router.put("/expense/:id", financeWrite, updateExpense);
router.delete("/income/:id", financeWrite, deleteIncome);
router.delete("/expense/:id", financeWrite, deleteExpense);

// Commissions
router.get("/commissions", getCommissions);
router.post("/commissions", financeWrite, createCommission);
router.put("/commissions/:id", financeWrite, updateCommission);
router.delete("/commissions/:id", financeWrite, deleteCommission);

// Staff Members
router.get("/staff", getStaff);
router.post("/staff", staffWrite, createStaff);
router.put("/staff/:id", staffWrite, updateStaff);
router.delete("/staff/:id", staffWrite, deleteStaff);

// Attendance
router.get("/attendance", getAttendance);
router.post("/attendance", staffWrite, saveAttendance);
router.put("/attendance/:id", staffWrite, updateAttendance);

// Salaries
router.get("/salaries", getSalaries);
router.post("/salaries", financeWrite, createSalary);
router.put("/salaries/:id", financeWrite, updateSalary);
router.delete("/salaries/:id", financeWrite, deleteSalary);

// Advances
router.get("/advances", getAdvances);
router.post("/advances", financeWrite, createAdvance);
router.put("/advances/:id", financeWrite, updateAdvance);
router.delete("/advances/:id", financeWrite, deleteAdvance);

// Company Settings
router.get("/settings", getCompanySettings);
router.post("/settings", staffWrite, saveCompanySettings);
router.put("/settings", staffWrite, saveCompanySettings);

// Factory Commission Rates
router.get("/factory-rates", getFactoryCommissionRates);
router.post("/factory-rates", financeWrite, saveFactoryCommissionRate);
router.put("/factory-rates/:id", financeWrite, saveFactoryCommissionRate);
router.delete("/factory-rates/:id", financeWrite, deleteFactoryCommissionRate);

export default router;

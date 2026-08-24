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
} from "../controllers/finance.controller.js";

const router = Router();

router.get("/invoices", getInvoices);
router.post("/invoices", createInvoice);
router.delete("/invoices/:id", deleteInvoice);

router.get("/ledger", getLedgerTransactions);
router.post("/ledger", createLedgerTransaction);

router.get("/income-expenses", getIncomeExpenses);
router.post("/income-expenses", createIncomeExpense);
router.delete("/income-expenses/:id", deleteIncomeExpense);

export default router;

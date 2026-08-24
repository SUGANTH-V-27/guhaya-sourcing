import { Request, Response } from "express";
import { db } from "../config/db.js";

// Invoices
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await db.invoices.select();
    res.json({ success: true, data: invoices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const newInvoice = await db.invoices.insert(req.body);
    res.status(201).json({ success: true, data: newInvoice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.invoices.delete(id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Factory Ledger Transactions
export const getLedgerTransactions = async (req: Request, res: Response) => {
  try {
    const { factory } = req.query;
    const query = factory ? { factory_name: factory } : undefined;
    const txs = await db.ledgerTransactions.select(query);
    res.json({ success: true, data: txs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLedgerTransaction = async (req: Request, res: Response) => {
  try {
    const newTx = await db.ledgerTransactions.insert(req.body);
    res.status(201).json({ success: true, data: newTx });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Manual Income/Expenses
export const getIncomeExpenses = async (req: Request, res: Response) => {
  try {
    const entries = await db.incomeExpenses.select();
    res.json({ success: true, data: entries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createIncomeExpense = async (req: Request, res: Response) => {
  try {
    const newEntry = await db.incomeExpenses.insert(req.body);
    res.status(201).json({ success: true, data: newEntry });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteIncomeExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await db.incomeExpenses.delete(id);
    res.json({ success: true, deleted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

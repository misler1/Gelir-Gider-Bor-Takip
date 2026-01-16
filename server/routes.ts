
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { startOfMonth, endOfMonth, parse } from "date-fns";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === INCOMES ===
  app.get(api.incomes.list.path, async (req, res) => {
    const incomes = await storage.getIncomes();
    res.json(incomes);
  });

  app.post(api.incomes.create.path, async (req, res) => {
    try {
      // Coerce string dates to Date objects in the input
      const input = api.incomes.create.input.parse(req.body);
      const income = await storage.createIncome(input);
      res.status(201).json(income);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.incomes.delete.path, async (req, res) => {
    await storage.deleteIncome(Number(req.params.id));
    res.sendStatus(204);
  });

  app.get(api.incomeEntries.list.path, async (req, res) => {
    const { month, startDate, endDate } = req.query;
    
    let start: Date | undefined;
    let end: Date | undefined;

    if (typeof month === 'string') {
      const date = parse(month, 'yyyy-MM', new Date());
      start = startOfMonth(date);
      end = endOfMonth(date);
    } else if (typeof startDate === 'string' && typeof endDate === 'string') {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    const entries = await storage.getIncomeEntries(undefined, start, end);
    res.json(entries);
  });

  app.put(api.incomeEntries.update.path, async (req, res) => {
    try {
      const input = api.incomeEntries.update.input.parse(req.body);
      const updated = await storage.updateIncomeEntry(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === EXPENSES ===
  app.get(api.expenses.list.path, async (req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  app.post(api.expenses.create.path, async (req, res) => {
    try {
      const input = api.expenses.create.input.parse(req.body);
      const expense = await storage.createExpense(input);
      res.status(201).json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.expenses.delete.path, async (req, res) => {
    await storage.deleteExpense(Number(req.params.id));
    res.sendStatus(204);
  });

  app.get(api.expenseEntries.list.path, async (req, res) => {
    const { month, startDate, endDate } = req.query;
    
    let start: Date | undefined;
    let end: Date | undefined;

    if (typeof month === 'string') {
      const date = parse(month, 'yyyy-MM', new Date());
      start = startOfMonth(date);
      end = endOfMonth(date);
    } else if (typeof startDate === 'string' && typeof endDate === 'string') {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    const entries = await storage.getExpenseEntries(undefined, start, end);
    res.json(entries);
  });

  app.put(api.expenseEntries.update.path, async (req, res) => {
    try {
      const input = api.expenseEntries.update.input.parse(req.body);
      const updated = await storage.updateExpenseEntry(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === BANKS ===
  app.get(api.banks.list.path, async (req, res) => {
    const banks = await storage.getBanks();
    res.json(banks);
  });

  app.post(api.banks.create.path, async (req, res) => {
    try {
      const input = api.banks.create.input.parse(req.body);
      const bank = await storage.createBank(input);
      res.status(201).json(bank);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.banks.update.path, async (req, res) => {
    try {
      const input = api.banks.update.input.parse(req.body);
      const bank = await storage.updateBank(Number(req.params.id), input);
      res.json(bank);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.banks.delete.path, async (req, res) => {
    await storage.deleteBank(Number(req.params.id));
    res.sendStatus(204);
  });

  // === BANK PAYMENTS ===
  app.get(api.bankPayments.list.path, async (req, res) => {
    const bankId = req.query.bankId ? Number(req.query.bankId) : undefined;
    const payments = await storage.getBankPayments(bankId);
    res.json(payments);
  });

  app.put(api.bankPayments.update.path, async (req, res) => {
    try {
      const input = api.bankPayments.update.input.parse(req.body);
      const updated = await storage.updateBankPayment(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}

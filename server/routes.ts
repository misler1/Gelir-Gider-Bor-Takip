
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === INCOMES ===
  app.get(api.incomes.list.path, async (req, res) => {
    const incomes = await storage.getIncomes();
    res.json(incomes);
  });

  app.get(api.incomes.get.path, async (req, res) => {
    const income = await storage.getIncome(Number(req.params.id));
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.json(income);
  });

  app.post(api.incomes.create.path, async (req, res) => {
    try {
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
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.incomes.update.path, async (req, res) => {
    try {
      const input = api.incomes.update.input.parse(req.body);
      const updated = await storage.updateIncome(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.incomes.delete.path, async (req, res) => {
    await storage.deleteIncome(Number(req.params.id));
    res.sendStatus(204);
  });

  // === EXPENSES ===
  app.get(api.expenses.list.path, async (req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  app.get(api.expenses.get.path, async (req, res) => {
    const expense = await storage.getExpense(Number(req.params.id));
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
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
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.expenses.update.path, async (req, res) => {
    try {
      const input = api.expenses.update.input.parse(req.body);
      const updated = await storage.updateExpense(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.expenses.delete.path, async (req, res) => {
    await storage.deleteExpense(Number(req.params.id));
    res.sendStatus(204);
  });

  // === BANKS ===
  app.get(api.banks.list.path, async (req, res) => {
    const banks = await storage.getBanks();
    res.json(banks);
  });

  app.get(api.banks.get.path, async (req, res) => {
    const bank = await storage.getBank(Number(req.params.id));
    if (!bank) return res.status(404).json({ message: "Bank not found" });
    res.json(bank);
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
      res.status(500).json({ message: "Internal server error" });
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
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.banks.delete.path, async (req, res) => {
    await storage.deleteBank(Number(req.params.id));
    res.sendStatus(204);
  });

  return httpServer;
}


import { db } from "./db";
import { 
  incomes, expenses, banks,
  type Income, type Expense, type Bank,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Income
  getIncomes(): Promise<Income[]>;
  getIncome(id: number): Promise<Income | undefined>;
  createIncome(income: any): Promise<Income>;
  updateIncome(id: number, updates: any): Promise<Income>;
  deleteIncome(id: number): Promise<void>;

  // Expense
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: any): Promise<Expense>;
  updateExpense(id: number, updates: any): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;

  // Banks
  getBanks(): Promise<Bank[]>;
  getBank(id: number): Promise<Bank | undefined>;
  createBank(bank: any): Promise<Bank>;
  updateBank(id: number, updates: any): Promise<Bank>;
  deleteBank(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // === INCOME ===
  async getIncomes(): Promise<Income[]> {
    return await db.select().from(incomes);
  }

  async getIncome(id: number): Promise<Income | undefined> {
    const [income] = await db.select().from(incomes).where(eq(incomes.id, id));
    return income;
  }

  async createIncome(data: any): Promise<Income> {
    const [newIncome] = await db.insert(incomes).values({
      ...data,
      baseDate: new Date(data.baseDate),
      monthlySchedule: data.monthlySchedule || []
    }).returning();
    return newIncome;
  }

  async updateIncome(id: number, updates: any): Promise<Income> {
    const [updated] = await db.update(incomes)
      .set({
        ...updates,
        baseDate: updates.baseDate ? new Date(updates.baseDate) : undefined,
      })
      .where(eq(incomes.id, id))
      .returning();
    return updated;
  }

  async deleteIncome(id: number): Promise<void> {
    await db.delete(incomes).where(eq(incomes.id, id));
  }

  // === EXPENSE ===
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses);
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(data: any): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values({
      ...data,
      date: new Date(data.date),
      monthlySchedule: data.monthlySchedule || []
    }).returning();
    return newExpense;
  }

  async updateExpense(id: number, updates: any): Promise<Expense> {
    const [updated] = await db.update(expenses)
      .set({
        ...updates,
        date: updates.date ? new Date(updates.date) : undefined,
      })
      .where(eq(expenses.id, id))
      .returning();
    return updated;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  // === BANKS ===
  async getBanks(): Promise<Bank[]> {
    return await db.select().from(banks);
  }

  async getBank(id: number): Promise<Bank | undefined> {
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank;
  }

  async createBank(data: any): Promise<Bank> {
    const [newBank] = await db.insert(banks).values({
      ...data,
      paymentPlan: data.paymentPlan || []
    }).returning();
    return newBank;
  }

  async updateBank(id: number, updates: any): Promise<Bank> {
    const [updated] = await db.update(banks)
      .set(updates)
      .where(eq(banks.id, id))
      .returning();
    return updated;
  }

  async deleteBank(id: number): Promise<void> {
    await db.delete(banks).where(eq(banks.id, id));
  }
}

export const storage = new DatabaseStorage();

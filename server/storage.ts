
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
    return await db.transaction(async (tx) => {
      const [newIncome] = await tx.insert(incomes).values({
        ...data,
        baseDate: new Date(data.baseDate),
        monthlySchedule: data.monthlySchedule || []
      }).returning();

      // Create entries for each month in the schedule to satisfy useIncomeEntries
      if (data.monthlySchedule && data.monthlySchedule.length > 0) {
        await tx.insert(incomeEntries).values(
          data.monthlySchedule.map((entry: any) => ({
            incomeId: newIncome.id,
            date: new Date(entry.date),
            amount: entry.amount,
            isReceived: entry.approved || false
          }))
        );
      }

      return newIncome;
    });
  }

  async updateIncome(id: number, updates: any): Promise<Income> {
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(incomes)
        .set({
          ...updates,
          baseDate: updates.baseDate ? new Date(updates.baseDate) : undefined,
        })
        .where(eq(incomes.id, id))
        .returning();

      if (updates.monthlySchedule) {
        // Sync entries
        await tx.delete(incomeEntries).where(eq(incomeEntries.incomeId, id));
        await tx.insert(incomeEntries).values(
          updates.monthlySchedule.map((entry: any) => ({
            incomeId: id,
            date: new Date(entry.date),
            amount: entry.amount,
            isReceived: entry.approved || false
          }))
        );
      }

      return updated;
    });
  }

  async deleteIncome(id: number): Promise<void> {
    await db.delete(incomes).where(eq(incomes.id, id));
  }

  async getIncomeEntries(): Promise<(IncomeEntry & { incomeName: string })[]> {
    return await db.select({
      id: incomeEntries.id,
      incomeId: incomeEntries.incomeId,
      date: incomeEntries.date,
      amount: incomeEntries.amount,
      isReceived: incomeEntries.isReceived,
      incomeName: incomes.name
    })
    .from(incomeEntries)
    .innerJoin(incomes, eq(incomeEntries.incomeId, incomes.id))
    .orderBy(incomeEntries.date);
  }

  async updateIncomeEntry(id: number, updates: any): Promise<IncomeEntry> {
    const [updated] = await db.update(incomeEntries)
      .set(updates)
      .where(eq(incomeEntries.id, id))
      .returning();
    return updated;
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
    return await db.transaction(async (tx) => {
      const [newExpense] = await tx.insert(expenses).values({
        ...data,
        date: new Date(data.date),
        monthlySchedule: data.monthlySchedule || []
      }).returning();

      if (data.monthlySchedule && data.monthlySchedule.length > 0) {
        await tx.insert(expenseEntries).values(
          data.monthlySchedule.map((entry: any) => ({
            expenseId: newExpense.id,
            date: new Date(entry.date),
            amount: entry.amount,
            isPaid: entry.paid || false
          }))
        );
      }

      return newExpense;
    });
  }

  async updateExpense(id: number, updates: any): Promise<Expense> {
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(expenses)
        .set({
          ...updates,
          date: updates.date ? new Date(updates.date) : undefined,
        })
        .where(eq(expenses.id, id))
        .returning();

      if (updates.monthlySchedule) {
        await tx.delete(expenseEntries).where(eq(expenseEntries.expenseId, id));
        await tx.insert(expenseEntries).values(
          updates.monthlySchedule.map((entry: any) => ({
            expenseId: id,
            date: new Date(entry.date),
            amount: entry.amount,
            isPaid: entry.paid || false
          }))
        );
      }

      return updated;
    });
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getExpenseEntries(): Promise<(ExpenseEntry & { expenseName: string })[]> {
    return await db.select({
      id: expenseEntries.id,
      expenseId: expenseEntries.expenseId,
      date: expenseEntries.date,
      amount: expenseEntries.amount,
      isPaid: expenseEntries.isPaid,
      expenseName: expenses.name
    })
    .from(expenseEntries)
    .innerJoin(expenses, eq(expenseEntries.expenseId, expenses.id))
    .orderBy(expenseEntries.date);
  }

  async updateExpenseEntry(id: number, updates: any): Promise<ExpenseEntry> {
    const [updated] = await db.update(expenseEntries)
      .set(updates)
      .where(eq(expenseEntries.id, id))
      .returning();
    return updated;
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

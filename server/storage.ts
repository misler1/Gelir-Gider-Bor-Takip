
import { db } from "./db";
import { 
  incomes, incomeEntries, expenses, expenseEntries, banks, bankPayments,
  type Income, type IncomeEntry, type Expense, type ExpenseEntry, type Bank, type BankPayment,
  type CreateIncomeRequest, type CreateExpenseRequest, type CreateBankRequest,
  type UpdateIncomeEntryRequest, type UpdateExpenseEntryRequest
} from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Income
  getIncomes(): Promise<Income[]>;
  createIncome(income: CreateIncomeRequest): Promise<Income>;
  deleteIncome(id: number): Promise<void>;
  getIncomeEntries(month?: string, startDate?: Date, endDate?: Date): Promise<(IncomeEntry & { incomeName: string })[]>;
  updateIncomeEntry(id: number, updates: UpdateIncomeEntryRequest): Promise<IncomeEntry>;

  // Expense
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: CreateExpenseRequest): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  getExpenseEntries(month?: string, startDate?: Date, endDate?: Date): Promise<(ExpenseEntry & { expenseName: string })[]>;
  updateExpenseEntry(id: number, updates: UpdateExpenseEntryRequest): Promise<ExpenseEntry>;

  // Banks
  getBanks(): Promise<Bank[]>;
  createBank(bank: CreateBankRequest): Promise<Bank>;
  updateBank(id: number, updates: Partial<CreateBankRequest>): Promise<Bank>;
  deleteBank(id: number): Promise<void>;
  
  // Bank Payments
  getBankPayments(bankId?: number): Promise<BankPayment[]>;
  updateBankPayment(id: number, updates: Partial<BankPayment>): Promise<BankPayment>;
}

export class DatabaseStorage implements IStorage {
  // === INCOME ===
  async getIncomes(): Promise<Income[]> {
    return await db.select().from(incomes);
  }

  async createIncome(req: CreateIncomeRequest): Promise<Income> {
    const { entries, ...incomeData } = req;
    
    // Transaction to create income and its entries
    return await db.transaction(async (tx) => {
      const [newIncome] = await tx.insert(incomes).values(incomeData).returning();
      
      if (entries.length > 0) {
        await tx.insert(incomeEntries).values(
          entries.map(e => ({ ...e, incomeId: newIncome.id }))
        );
      }
      
      return newIncome;
    });
  }

  async deleteIncome(id: number): Promise<void> {
    await db.delete(incomes).where(eq(incomes.id, id));
  }

  async getIncomeEntries(month?: string, startDate?: Date, endDate?: Date): Promise<(IncomeEntry & { incomeName: string })[]> {
    let query = db.select({
      id: incomeEntries.id,
      incomeId: incomeEntries.incomeId,
      date: incomeEntries.date,
      amount: incomeEntries.amount,
      isReceived: incomeEntries.isReceived,
      incomeName: incomes.name
    })
    .from(incomeEntries)
    .innerJoin(incomes, eq(incomeEntries.incomeId, incomes.id));

    if (startDate && endDate) {
      query.where(and(gte(incomeEntries.date, startDate), lte(incomeEntries.date, endDate)));
    }

    return await query.orderBy(incomeEntries.date);
  }

  async updateIncomeEntry(id: number, updates: UpdateIncomeEntryRequest): Promise<IncomeEntry> {
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

  async createExpense(req: CreateExpenseRequest): Promise<Expense> {
    const { entries, ...expenseData } = req;
    
    return await db.transaction(async (tx) => {
      const [newExpense] = await tx.insert(expenses).values(expenseData).returning();
      
      if (entries.length > 0) {
        await tx.insert(expenseEntries).values(
          entries.map(e => ({ ...e, expenseId: newExpense.id }))
        );
      }
      
      return newExpense;
    });
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getExpenseEntries(month?: string, startDate?: Date, endDate?: Date): Promise<(ExpenseEntry & { expenseName: string })[]> {
    let query = db.select({
      id: expenseEntries.id,
      expenseId: expenseEntries.expenseId,
      date: expenseEntries.date,
      amount: expenseEntries.amount,
      isPaid: expenseEntries.isPaid,
      expenseName: expenses.name
    })
    .from(expenseEntries)
    .innerJoin(expenses, eq(expenseEntries.expenseId, expenses.id));

    if (startDate && endDate) {
      query.where(and(gte(expenseEntries.date, startDate), lte(expenseEntries.date, endDate)));
    }

    return await query.orderBy(expenseEntries.date);
  }

  async updateExpenseEntry(id: number, updates: UpdateExpenseEntryRequest): Promise<ExpenseEntry> {
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

  async createBank(bank: CreateBankRequest): Promise<Bank> {
    const [newBank] = await db.insert(banks).values(bank).returning();
    return newBank;
  }

  async updateBank(id: number, updates: Partial<CreateBankRequest>): Promise<Bank> {
    const [updated] = await db.update(banks)
      .set(updates)
      .where(eq(banks.id, id))
      .returning();
    return updated;
  }

  async deleteBank(id: number): Promise<void> {
    await db.delete(banks).where(eq(banks.id, id));
  }

  async getBankPayments(bankId?: number): Promise<BankPayment[]> {
    if (bankId) {
      return await db.select().from(bankPayments).where(eq(bankPayments.bankId, bankId));
    }
    return await db.select().from(bankPayments);
  }

  async updateBankPayment(id: number, updates: Partial<BankPayment>): Promise<BankPayment> {
    const [updated] = await db.update(bankPayments)
      .set(updates)
      .where(eq(bankPayments.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();

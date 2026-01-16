
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === INCOME MODULE ===
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  baseAmount: text("base_amount").notNull(),
  baseDate: timestamp("base_date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  frequency: text("frequency"),
  monthlySchedule: jsonb("monthly_schedule").$type<{
    month: string;
    amount: string;
    date: string;
    approved: boolean;
  }[]>().notNull().default([]),
});

// Income entries are derived from the schedule in the frontend
// We can keep these for legacy or specifically for "Approved" state
export const incomeEntries = pgTable("income_entries", {
  id: serial("id").primaryKey(),
  incomeId: integer("income_id").references(() => incomes.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  amount: text("amount").notNull(),
  isReceived: boolean("is_received").default(false),
});

// === EXPENSE MODULE ===
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: text("amount").notNull(),
  date: timestamp("date").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  frequency: text("frequency"),
  monthlySchedule: jsonb("monthly_schedule").$type<{
    month: string;
    amount: string;
    date: string;
    paid: boolean;
  }[]>().notNull().default([]),
});

export const expenseEntries = pgTable("expense_entries", {
  id: serial("id").primaryKey(),
  expenseId: integer("expense_id").references(() => expenses.id, { onDelete: 'cascade' }),
  date: timestamp("date").notNull(),
  amount: text("amount").notNull(),
  isPaid: boolean("is_paid").default(false),
});

// === BANKS & DEBTS MODULE ===
export const banks = pgTable("banks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  debtType: text("debt_type").notNull(),
  totalDebt: text("total_debt").notNull(),
  interestRate: text("interest_rate").notNull(),
  interestType: text("interest_type").notNull(),
  minPaymentAmount: text("min_payment_amount").notNull(),
  paymentDueDay: integer("payment_due_day").default(5),
  isActive: boolean("is_active").default(true),
  paymentPlan: jsonb("payment_plan").$type<{
    month: string;
    startingDebt: string;
    interest: string;
    payment: string;
    remainingDebt: string;
  }[]>().notNull().default([]),
});

// === SCHEMAS ===
export const insertIncomeSchema = createInsertSchema(incomes).omit({ id: true });
export const insertIncomeEntrySchema = createInsertSchema(incomeEntries).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });
export const insertExpenseEntrySchema = createInsertSchema(expenseEntries).omit({ id: true });
export const insertBankSchema = createInsertSchema(banks).omit({ id: true });

// === TYPES ===
export type Income = typeof incomes.$inferSelect;
export type IncomeEntry = typeof incomeEntries.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseEntry = typeof expenseEntries.$inferSelect;
export type Bank = typeof banks.$inferSelect;

export type CreateIncomeRequest = z.infer<typeof insertIncomeSchema>;
export type UpdateIncomeEntryRequest = Partial<z.infer<typeof insertIncomeEntrySchema>>;
export type CreateExpenseRequest = z.infer<typeof insertExpenseSchema>;
export type UpdateExpenseEntryRequest = Partial<z.infer<typeof insertExpenseEntrySchema>>;

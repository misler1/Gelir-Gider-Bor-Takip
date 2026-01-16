
import { db } from "./db";
import { incomes, incomeEntries, expenses, expenseEntries, banks } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // clear existing data
  await db.delete(incomeEntries);
  await db.delete(incomes);
  await db.delete(expenseEntries);
  await db.delete(expenses);
  await db.delete(banks);

  // 1. Create Income
  const [salary] = await db.insert(incomes).values({
    name: "Monthly Salary",
    amount: "5000.00",
    date: new Date(),
    isRecurring: true,
    frequency: "monthly"
  }).returning();

  // Create entries for next 6 months
  const salaryEntries = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    d.setDate(5); // 5th of month
    salaryEntries.push({
      incomeId: salary.id,
      date: d,
      amount: "5000.00",
      isReceived: false
    });
  }
  await db.insert(incomeEntries).values(salaryEntries);

  // 2. Create Expense
  const [rent] = await db.insert(expenses).values({
    name: "Rent",
    amount: "1500.00",
    date: new Date(),
    isRecurring: true,
    frequency: "monthly"
  }).returning();

  // Create entries for next 6 months
  const rentEntries = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    d.setDate(1); // 1st of month
    rentEntries.push({
      expenseId: rent.id,
      date: d,
      amount: "1500.00",
      isPaid: false
    });
  }
  await db.insert(expenseEntries).values(rentEntries);

  // 3. Create Banks
  await db.insert(banks).values([
    {
      name: "Chase Sapphire",
      debtType: "Credit Card",
      totalDebt: "2500.00",
      interestRate: "24.99",
      interestType: "Daily",
      minPaymentAmount: "75.00",
      paymentDueDay: 5,
      isActive: true
    },
    {
      name: "Citi Simplicity",
      debtType: "Credit Card",
      totalDebt: "500.00",
      interestRate: "0.00",
      interestType: "Monthly",
      minPaymentAmount: "25.00",
      paymentDueDay: 15,
      isActive: true
    },
    {
      name: "Bank of America KMH",
      debtType: "KMH",
      totalDebt: "1000.00",
      interestRate: "5.00", // Monthly
      interestType: "Monthly",
      minPaymentAmount: "50.00",
      paymentDueDay: 10,
      isActive: true
    }
  ]);

  console.log("Seeding complete!");
}

seed().catch(console.error);


import { z } from 'zod';
import { 
  insertIncomeSchema, 
  insertIncomeEntrySchema, 
  insertExpenseSchema, 
  insertExpenseEntrySchema, 
  insertBankSchema,
  insertBankPaymentSchema,
  incomes,
  incomeEntries,
  expenses,
  expenseEntries,
  banks,
  bankPayments
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  incomes: {
    list: {
      method: 'GET' as const,
      path: '/api/incomes',
      responses: {
        200: z.array(z.custom<typeof incomes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/incomes',
      input: insertIncomeSchema.extend({
        entries: z.array(insertIncomeEntrySchema.omit({ incomeId: true }))
      }),
      responses: {
        201: z.custom<typeof incomes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/incomes/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  incomeEntries: {
    list: {
      method: 'GET' as const,
      path: '/api/income-entries',
      input: z.object({
        month: z.string().optional(), // 'YYYY-MM'
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof incomeEntries.$inferSelect & { incomeName: string }>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/income-entries/:id',
      input: insertIncomeEntrySchema.partial(),
      responses: {
        200: z.custom<typeof incomeEntries.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/expenses',
      responses: {
        200: z.array(z.custom<typeof expenses.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses',
      input: insertExpenseSchema.extend({
        entries: z.array(insertExpenseEntrySchema.omit({ expenseId: true }))
      }),
      responses: {
        201: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/expenses/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  expenseEntries: {
    list: {
      method: 'GET' as const,
      path: '/api/expense-entries',
      input: z.object({
        month: z.string().optional(), // 'YYYY-MM'
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof expenseEntries.$inferSelect & { expenseName: string }>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/expense-entries/:id',
      input: insertExpenseEntrySchema.partial(),
      responses: {
        200: z.custom<typeof expenseEntries.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  banks: {
    list: {
      method: 'GET' as const,
      path: '/api/banks',
      responses: {
        200: z.array(z.custom<typeof banks.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/banks',
      input: insertBankSchema,
      responses: {
        201: z.custom<typeof banks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/banks/:id',
      input: insertBankSchema.partial(),
      responses: {
        200: z.custom<typeof banks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/banks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  bankPayments: {
    list: {
      method: 'GET' as const,
      path: '/api/bank-payments',
      input: z.object({
        bankId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof bankPayments.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/bank-payments/:id',
      input: insertBankPaymentSchema.partial(),
      responses: {
        200: z.custom<typeof bankPayments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

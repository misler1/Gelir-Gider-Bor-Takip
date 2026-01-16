
import { z } from 'zod';
import { 
  insertIncomeSchema, 
  insertIncomeEntrySchema,
  insertExpenseSchema, 
  insertExpenseEntrySchema,
  insertBankSchema,
  incomes,
  incomeEntries,
  expenses,
  expenseEntries,
  banks
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
    get: {
      method: 'GET' as const,
      path: '/api/incomes/:id',
      responses: {
        200: z.custom<typeof incomes.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/incomes',
      input: insertIncomeSchema,
      responses: {
        201: z.custom<typeof incomes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/incomes/:id',
      input: insertIncomeSchema.partial(),
      responses: {
        200: z.custom<typeof incomes.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
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
    get: {
      method: 'GET' as const,
      path: '/api/expenses/:id',
      responses: {
        200: z.custom<typeof expenses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses',
      input: insertExpenseSchema,
      responses: {
        201: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/expenses/:id',
      input: insertExpenseSchema.partial(),
      responses: {
        200: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
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
    get: {
      method: 'GET' as const,
      path: '/api/banks/:id',
      responses: {
        200: z.custom<typeof banks.$inferSelect>(),
        404: errorSchemas.notFound,
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
        400: errorSchemas.validation,
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

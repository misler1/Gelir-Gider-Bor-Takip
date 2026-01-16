import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateExpenseRequest, type UpdateExpenseEntryRequest } from "@shared/schema";

// === EXPENSES (Master Definitions) ===
export function useExpenses() {
  return useQuery({
    queryKey: [api.expenses.list.path],
    queryFn: async () => {
      const res = await fetch(api.expenses.list.path);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return api.expenses.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateExpenseRequest) => {
      const res = await fetch(api.expenses.create.path, {
        method: api.expenses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create expense");
      return api.expenses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.expenseEntries.list.path] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.expenses.delete.path, { id });
      const res = await fetch(url, { method: api.expenses.delete.method });
      if (!res.ok) throw new Error("Failed to delete expense");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.expenseEntries.list.path] });
    },
  });
}

// === EXPENSE ENTRIES (Monthly instances) ===
export function useExpenseEntries(params?: { month?: string; startDate?: string; endDate?: string }) {
  const queryKey = [api.expenseEntries.list.path, params?.month, params?.startDate, params?.endDate].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.expenseEntries.list.path;
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.month) queryParams.set("month", params.month);
        if (params.startDate) queryParams.set("startDate", params.startDate);
        if (params.endDate) queryParams.set("endDate", params.endDate);
        url += `?${queryParams.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch expense entries");
      return api.expenseEntries.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateExpenseEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateExpenseEntryRequest) => {
      const url = buildUrl(api.expenseEntries.update.path, { id });
      const res = await fetch(url, {
        method: api.expenseEntries.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update expense entry");
      return api.expenseEntries.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenseEntries.list.path] });
    },
  });
}

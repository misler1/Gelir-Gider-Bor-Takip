import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateIncomeRequest, type UpdateIncomeEntryRequest } from "@shared/schema";

// === INCOMES (Master Definitions) ===
export function useIncomes() {
  return useQuery({
    queryKey: [api.incomes.list.path],
    queryFn: async () => {
      const res = await fetch(api.incomes.list.path);
      if (!res.ok) throw new Error("Failed to fetch incomes");
      return api.incomes.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateIncomeRequest) => {
      const res = await fetch(api.incomes.create.path, {
        method: api.incomes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create income");
      return api.incomes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.incomes.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.incomeEntries.list.path] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.incomes.delete.path, { id });
      const res = await fetch(url, { method: api.incomes.delete.method });
      if (!res.ok) throw new Error("Failed to delete income");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.incomes.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.incomeEntries.list.path] });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & CreateIncomeRequest) => {
      const url = buildUrl(api.incomes.update.path, { id });
      const res = await fetch(url, {
        method: api.incomes.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update income");
      return api.incomes.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.incomes.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.incomeEntries.list.path] });
    },
  });
}

// === INCOME ENTRIES (Monthly instances) ===
export function useIncomeEntries(params?: { month?: string; startDate?: string; endDate?: string }) {
  const queryKey = [api.incomeEntries.list.path, params?.month, params?.startDate, params?.endDate].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.incomeEntries.list.path;
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.month) queryParams.set("month", params.month);
        if (params.startDate) queryParams.set("startDate", params.startDate);
        if (params.endDate) queryParams.set("endDate", params.endDate);
        url += `?${queryParams.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch income entries");
      return api.incomeEntries.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateIncomeEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateIncomeEntryRequest) => {
      const url = buildUrl(api.incomeEntries.update.path, { id });
      const res = await fetch(url, {
        method: api.incomeEntries.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update income entry");
      return api.incomeEntries.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.incomeEntries.list.path] });
    },
  });
}

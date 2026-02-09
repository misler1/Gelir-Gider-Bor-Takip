import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "../shared/routes";
import { type CreateBankRequest, type Bank } from "../shared/schema";

// === BANKS ===
export function useBanks() {
  return useQuery({
    queryKey: [api.banks.list.path],
    queryFn: async () => {
      const res = await fetch(api.banks.list.path);
      if (!res.ok) throw new Error("Failed to fetch banks");
      return api.banks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBankRequest) => {
      const res = await fetch(api.banks.create.path, {
        method: api.banks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create bank");
      return api.banks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [api.banks.list.path],
      });
    },
  });
}

export function useUpdateBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: number } & Partial<CreateBankRequest>) => {
      const url = buildUrl(api.banks.update.path, { id });
      const res = await fetch(url, {
        method: api.banks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update bank");
      return api.banks.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [api.banks.list.path],
      });
    },
  });
}

export function useDeleteBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.banks.delete.path, { id });
      const res = await fetch(url, {
        method: api.banks.delete.method,
      });
      if (!res.ok) throw new Error("Failed to delete bank");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [api.banks.list.path],
      });
    },
  });
}

// === BANK PAYMENTS ===
export function useBankPayments(bankId?: number) {
  const queryKey = [api.bankPayments.list.path, bankId].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.bankPayments.list.path;
      if (bankId) {
        url += `?bankId=${bankId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch bank payments");
      return api.bankPayments.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateBankPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: number;
      isCompleted?: boolean;
    }) => {
      const url = buildUrl(api.bankPayments.update.path, { id });
      const res = await fetch(url, {
        method: api.bankPayments.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update bank payment");
      return api.bankPayments.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [api.bankPayments.list.path],
      });
    },
  });
}

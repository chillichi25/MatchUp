import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelFriendly,
  createFriendly,
  getFriendlyDetail,
  getFriendlyDiscovery,
  updateFriendly,
} from "../services/friendly.service";
import type {
  CreateFriendlyInput,
  FriendlyFilters,
  UpdateFriendlyInput,
} from "../types";

export const FRIENDLY_QUERY_KEYS = {
  all: ["friendlies"] as const,
  discovery: (filters: FriendlyFilters) =>
    ["friendlies", "discovery", filters] as const,
  detail: (id: string) => ["friendlies", "detail", id] as const,
};

export function useFriendlyDiscovery(filters: FriendlyFilters) {
  return useQuery({
    queryKey: FRIENDLY_QUERY_KEYS.discovery(filters),
    queryFn: () => getFriendlyDiscovery(filters),
  });
}

export function useFriendlyDetail(friendlyId: string) {
  return useQuery({
    queryKey: FRIENDLY_QUERY_KEYS.detail(friendlyId),
    queryFn: () => getFriendlyDetail(friendlyId),
    enabled: Boolean(friendlyId),
  });
}

export function useCreateFriendly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFriendlyInput) => createFriendly(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FRIENDLY_QUERY_KEYS.all });
    },
  });
}

export function useUpdateFriendly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateFriendlyInput) => updateFriendly(input),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: FRIENDLY_QUERY_KEYS.all });
      await queryClient.invalidateQueries({
        queryKey: FRIENDLY_QUERY_KEYS.detail(variables.friendlyId),
      });
    },
  });
}

export function useCancelFriendly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendlyId: string) => cancelFriendly(friendlyId),
    onSuccess: async (_result, friendlyId) => {
      await queryClient.invalidateQueries({ queryKey: FRIENDLY_QUERY_KEYS.all });
      await queryClient.invalidateQueries({
        queryKey: FRIENDLY_QUERY_KEYS.detail(friendlyId),
      });
    },
  });
}

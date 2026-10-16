import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptFriendlyRequest,
  declineFriendlyRequest,
  getFriendlyRequestDetail,
  getIncomingRequests,
  getOutgoingRequestHistory,
  getOutgoingRequests,
  sendFriendlyRequest,
  withdrawFriendlyRequest,
} from "../services/friendly-request.service";
import { FRIENDLY_QUERY_KEYS } from "./use-friendlies";

export const FRIENDLY_REQUEST_QUERY_KEYS = {
  all: ["friendly-requests"] as const,
  incoming: ["friendly-requests", "incoming"] as const,
  outgoing: (statuses: string[]) =>
    ["friendly-requests", "outgoing", statuses] as const,
  detail: (id: string) => ["friendly-requests", "detail", id] as const,
};

async function invalidateRequestData(
  queryClient: ReturnType<typeof useQueryClient>
) {
  await queryClient.invalidateQueries({
    queryKey: FRIENDLY_REQUEST_QUERY_KEYS.all,
  });
  await queryClient.invalidateQueries({ queryKey: FRIENDLY_QUERY_KEYS.all });
  await queryClient.invalidateQueries({ queryKey: ["matches"] });
}

export function useIncomingRequests() {
  return useQuery({
    queryKey: FRIENDLY_REQUEST_QUERY_KEYS.incoming,
    queryFn: getIncomingRequests,
  });
}

export function useOutgoingRequests() {
  return useQuery({
    queryKey: FRIENDLY_REQUEST_QUERY_KEYS.outgoing(["pending"]),
    queryFn: getOutgoingRequests,
  });
}

export function useOutgoingRequestHistory() {
  return useQuery({
    queryKey: FRIENDLY_REQUEST_QUERY_KEYS.outgoing([
      "accepted",
      "declined",
      "cancelled",
      "expired",
    ]),
    queryFn: getOutgoingRequestHistory,
  });
}

export function useFriendlyRequestDetail(requestId: string) {
  return useQuery({
    queryKey: FRIENDLY_REQUEST_QUERY_KEYS.detail(requestId),
    queryFn: () => getFriendlyRequestDetail(requestId),
    enabled: Boolean(requestId),
  });
}

export function useSendFriendlyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      friendlyId: string;
      requestingTeamId: string;
      message?: string;
    }) => sendFriendlyRequest(input),
    onSuccess: async () => {
      await invalidateRequestData(queryClient);
    },
  });
}

export function useAcceptFriendlyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => acceptFriendlyRequest(requestId),
    onSuccess: async () => {
      await invalidateRequestData(queryClient);
    },
  });
}

export function useDeclineFriendlyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => declineFriendlyRequest(requestId),
    onSuccess: async () => {
      await invalidateRequestData(queryClient);
    },
  });
}

export function useWithdrawFriendlyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => withdrawFriendlyRequest(requestId),
    onSuccess: async () => {
      await invalidateRequestData(queryClient);
    },
  });
}

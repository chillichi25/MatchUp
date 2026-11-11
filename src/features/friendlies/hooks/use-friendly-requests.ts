import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useActiveTeam } from "@/features/teams/hooks/use-teams";

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
  detail: (id: string) =>
    ["friendly-requests", "detail", id] as const,
};

async function invalidateRequestData(
  queryClient: ReturnType<typeof useQueryClient>
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: FRIENDLY_REQUEST_QUERY_KEYS.all,
    }),
    queryClient.invalidateQueries({
      queryKey: FRIENDLY_QUERY_KEYS.all,
    }),
    queryClient.invalidateQueries({
      queryKey: ["matches"],
    }),
  ]);
}

export function useIncomingRequests() {
  const activeTeam = useActiveTeam();
  const teamId = activeTeam.data?.id;

  return useQuery({
    queryKey: [
      ...FRIENDLY_REQUEST_QUERY_KEYS.incoming,
      teamId,
    ],
    queryFn: getIncomingRequests,
    enabled: Boolean(teamId),
  });
}

export function useOutgoingRequests() {
  const activeTeam = useActiveTeam();
  const teamId = activeTeam.data?.id;

  return useQuery({
    queryKey: [
      ...FRIENDLY_REQUEST_QUERY_KEYS.outgoing(["pending"]),
      teamId,
    ],
    queryFn: getOutgoingRequests,
    enabled: Boolean(teamId),
  });
}

export function useOutgoingRequestHistory() {
  const activeTeam = useActiveTeam();
  const teamId = activeTeam.data?.id;

  return useQuery({
    queryKey: [
      ...FRIENDLY_REQUEST_QUERY_KEYS.outgoing([
        "accepted",
        "declined",
        "cancelled",
        "expired",
      ]),
      teamId,
    ],
    queryFn: getOutgoingRequestHistory,
    enabled: Boolean(teamId),
  });
}

export function useFriendlyRequestDetail(requestId: string) {
  const activeTeam = useActiveTeam();
  const teamId = activeTeam.data?.id;

  return useQuery({
    queryKey: [
      ...FRIENDLY_REQUEST_QUERY_KEYS.detail(requestId),
      teamId,
    ],
    queryFn: () => getFriendlyRequestDetail(requestId),
    enabled: Boolean(requestId && teamId),
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
    mutationFn: (requestId: string) =>
      acceptFriendlyRequest(requestId),
    onSuccess: async () => {
      await invalidateRequestData(queryClient);
    },
  });
}

export function useDeclineFriendlyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      declineFriendlyRequest(requestId),
    onSuccess: async () => {
      await invalidateRequestData(queryClient);
    },
  });
}

export function useWithdrawFriendlyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      withdrawFriendlyRequest(requestId),
    onSuccess: async () => {
      await invalidateRequestData(queryClient);
    },
  });
}
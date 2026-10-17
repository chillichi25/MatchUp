import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptTournamentRequest,
  declineTournamentRequest,
  getIncomingTournamentRequests,
  getOutgoingTournamentRequests,
  getTournamentRequestDetail,
  removeTournamentParticipant,
  sendTournamentRequest,
  withdrawTournamentParticipant,
} from "../services/tournament-request.service";

export const TOURNAMENT_REQUEST_QUERY_KEYS = {
  all: ["tournament-requests"] as const,
  incoming: ["tournament-requests", "incoming"] as const,
  outgoing: ["tournament-requests", "outgoing"] as const,
  detail: (id: string) => ["tournament-requests", "detail", id] as const,
};

function useInvalidateTournamentRequests() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: TOURNAMENT_REQUEST_QUERY_KEYS.all,
    });
    await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useIncomingTournamentRequests() {
  return useQuery({
    queryKey: TOURNAMENT_REQUEST_QUERY_KEYS.incoming,
    queryFn: getIncomingTournamentRequests,
  });
}

export function useOutgoingTournamentRequests() {
  return useQuery({
    queryKey: TOURNAMENT_REQUEST_QUERY_KEYS.outgoing,
    queryFn: getOutgoingTournamentRequests,
  });
}

export function useTournamentRequestDetail(requestId: string) {
  return useQuery({
    queryKey: TOURNAMENT_REQUEST_QUERY_KEYS.detail(requestId),
    queryFn: () => getTournamentRequestDetail(requestId),
    enabled: Boolean(requestId),
  });
}

export function useSendTournamentRequest() {
  const invalidate = useInvalidateTournamentRequests();

  return useMutation({
    mutationFn: (input: {
      tournamentId: string;
      teamId: string;
      message?: string;
    }) => sendTournamentRequest(input),
    onSuccess: invalidate,
  });
}

export function useAcceptTournamentRequest() {
  const invalidate = useInvalidateTournamentRequests();

  return useMutation({
    mutationFn: (requestId: string) => acceptTournamentRequest(requestId),
    onSuccess: invalidate,
  });
}

export function useDeclineTournamentRequest() {
  const invalidate = useInvalidateTournamentRequests();

  return useMutation({
    mutationFn: (requestId: string) => declineTournamentRequest(requestId),
    onSuccess: invalidate,
  });
}

export function useWithdrawTournamentParticipant() {
  const invalidate = useInvalidateTournamentRequests();

  return useMutation({
    mutationFn: (requestId: string) => withdrawTournamentParticipant(requestId),
    onSuccess: invalidate,
  });
}

export function useRemoveTournamentParticipant() {
  const invalidate = useInvalidateTournamentRequests();

  return useMutation({
    mutationFn: (requestId: string) => removeTournamentParticipant(requestId),
    onSuccess: invalidate,
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelTournament,
  completeTournament,
  createTournament,
  getTournamentUpdateDetail,
  getTournamentUpdates,
  sendTournamentUpdate,
  setTournamentStatus,
  updateTournament,
} from "../services/tournament-organiser.service";
import type { CreateTournamentInput, UpdateTournamentInput } from "../types";

export const TOURNAMENT_ORGANISER_QUERY_KEYS = {
  updates: (tournamentId: string) =>
    ["tournaments", "updates", tournamentId] as const,
  updateDetail: (updateId: string) =>
    ["tournaments", "update-detail", updateId] as const,
};

function useInvalidateOrganiser() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
}

export function useCreateTournament() {
  const invalidate = useInvalidateOrganiser();

  return useMutation({
    mutationFn: (input: CreateTournamentInput) => createTournament(input),
    onSuccess: invalidate,
  });
}

export function useUpdateTournament() {
  const invalidate = useInvalidateOrganiser();

  return useMutation({
    mutationFn: (input: UpdateTournamentInput) => updateTournament(input),
    onSuccess: invalidate,
  });
}

export function useSetTournamentStatus() {
  const invalidate = useInvalidateOrganiser();

  return useMutation({
    mutationFn: (input: { tournamentId: string; status: "open" | "closed" }) =>
      setTournamentStatus(input.tournamentId, input.status),
    onSuccess: invalidate,
  });
}

export function useCancelTournament() {
  const invalidate = useInvalidateOrganiser();

  return useMutation({
    mutationFn: (tournamentId: string) => cancelTournament(tournamentId),
    onSuccess: invalidate,
  });
}

export function useCompleteTournament() {
  const invalidate = useInvalidateOrganiser();

  return useMutation({
    mutationFn: (tournamentId: string) => completeTournament(tournamentId),
    onSuccess: invalidate,
  });
}

export function useTournamentUpdates(tournamentId: string) {
  return useQuery({
    queryKey: TOURNAMENT_ORGANISER_QUERY_KEYS.updates(tournamentId),
    queryFn: () => getTournamentUpdates(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

export function useTournamentUpdateDetail(updateId: string) {
  return useQuery({
    queryKey: TOURNAMENT_ORGANISER_QUERY_KEYS.updateDetail(updateId),
    queryFn: () => getTournamentUpdateDetail(updateId),
    enabled: Boolean(updateId),
  });
}

export function useSendTournamentUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { tournamentId: string; message: string }) =>
      sendTournamentUpdate(input),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: TOURNAMENT_ORGANISER_QUERY_KEYS.updates(variables.tournamentId),
      });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getActiveTeam } from "@/features/teams/services/active-team.service";

import {
  cancelMatch,
  getMatchDetail,
  getMatchHistory,
  getUpcomingMatches,
} from "../services/matches.service";

export const MATCH_QUERY_KEYS = {
  all: ["matches"] as const,
  upcoming: ["matches", "upcoming"] as const,
  history: ["matches", "history"] as const,
  detail: (id: string) => ["matches", "detail", id] as const,
};

export function useUpcomingMatches() {
  return useQuery({
    queryKey: MATCH_QUERY_KEYS.upcoming,
    queryFn: getUpcomingMatches,
  });
}

export function useMatchHistory() {
  return useQuery({
    queryKey: MATCH_QUERY_KEYS.history,
    queryFn: getMatchHistory,
  });
}

export function useMatchDetail(matchId: string) {
  return useQuery({
    queryKey: MATCH_QUERY_KEYS.detail(matchId),
    queryFn: () => getMatchDetail(matchId),
    enabled: Boolean(matchId),
  });
}

export function useCancelMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      const team = await getActiveTeam();

      if (!team) {
        throw new Error("Select a team before cancelling a match.");
      }

      return cancelMatch(matchId, team.id);
    },
    onSuccess: async (_result, matchId) => {
      await queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.all });
      await queryClient.invalidateQueries({
        queryKey: MATCH_QUERY_KEYS.detail(matchId),
      });
    },
  });
}

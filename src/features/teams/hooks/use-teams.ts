import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getActiveTeam,
  getAvailableTeams,
  setActiveTeam,
} from "../services/active-team.service";

export const TEAM_QUERY_KEYS = {
  active: ["active-team"] as const,
  available: ["available-teams"] as const,
};

export function useActiveTeam() {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.active,
    queryFn: getActiveTeam,
  });
}

export function useAvailableTeams() {
  return useQuery({
    queryKey: TEAM_QUERY_KEYS.available,
    queryFn: getAvailableTeams,
  });
}

export function useSetActiveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => setActiveTeam(teamId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.active });
      await queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.available,
      });
    },
  });
}

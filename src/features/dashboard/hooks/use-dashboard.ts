import { useQuery } from "@tanstack/react-query";

import { getDashboardData } from "../services/dashboard.service";

export const DASHBOARD_QUERY_KEYS = {
  all: ["dashboard"] as const,
  byTeam: (teamId: string) => ["dashboard", teamId] as const,
};

/**
 * Home-tab data. The query key is scoped by the represented team so a team
 * switch never reuses another team's cached view.
 */
export function useDashboard(activeTeamId?: string) {
  return useQuery({
    queryKey: activeTeamId
      ? DASHBOARD_QUERY_KEYS.byTeam(activeTeamId)
      : DASHBOARD_QUERY_KEYS.all,
    queryFn: getDashboardData,
  });
}

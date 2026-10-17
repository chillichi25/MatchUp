import { useQuery } from "@tanstack/react-query";

import {
  getMyTournaments,
  getParticipatingTournaments,
  getTournamentDetail,
  getTournamentDiscovery,
  getTournamentParticipants,
} from "../services/tournament.service";
import type { TournamentFilters } from "../types";

export const TOURNAMENT_QUERY_KEYS = {
  all: ["tournaments"] as const,
  discovery: (filters: TournamentFilters) =>
    ["tournaments", "discovery", filters] as const,
  detail: (id: string) => ["tournaments", "detail", id] as const,
  participants: (id: string) => ["tournaments", "participants", id] as const,
  mine: ["tournaments", "mine"] as const,
  participating: ["tournaments", "participating"] as const,
};

export function useTournamentDiscovery(filters: TournamentFilters) {
  return useQuery({
    queryKey: TOURNAMENT_QUERY_KEYS.discovery(filters),
    queryFn: () => getTournamentDiscovery(filters),
  });
}

export function useTournamentDetail(tournamentId: string) {
  return useQuery({
    queryKey: TOURNAMENT_QUERY_KEYS.detail(tournamentId),
    queryFn: () => getTournamentDetail(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

export function useTournamentParticipants(tournamentId: string) {
  return useQuery({
    queryKey: TOURNAMENT_QUERY_KEYS.participants(tournamentId),
    queryFn: () => getTournamentParticipants(tournamentId),
    enabled: Boolean(tournamentId),
  });
}

export function useMyTournaments() {
  return useQuery({
    queryKey: TOURNAMENT_QUERY_KEYS.mine,
    queryFn: getMyTournaments,
  });
}

export function useParticipatingTournaments() {
  return useQuery({
    queryKey: TOURNAMENT_QUERY_KEYS.participating,
    queryFn: getParticipatingTournaments,
  });
}

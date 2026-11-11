import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

import {
  canManageClubMemberships,
  getClubById,
  getClubMemberTeams,
  getClubMembers,
  getClubTeams,
  getMyApprovedClubMembership,
  getMyClub,
  getPendingClubJoinRequests,
  getPendingClubRequest,
  getPendingTeamJoinRequests,
} from "../services/club.service";
import type { ClubTeam } from "../types";

export const CLUB_QUERY_KEYS = {
  myClub: ["club", "my-club"] as const,

  pendingRequest: ["club", "pending-request"] as const,

  approvedMembership: ["club", "approved-membership"] as const,

  byId: (clubId: string) =>
    ["club", clubId] as const,

  teams: (clubId: string) =>
    ["club", clubId, "teams"] as const,

  myPendingTeams: (
    clubId: string,
    userId: string | null
  ) =>
    ["club", clubId, "my-pending-teams", userId] as const,

  canManage: (clubId: string) =>
    ["club", clubId, "can-manage"] as const,

  clubRequests: (clubId: string) =>
    ["club", clubId, "club-requests"] as const,

  teamRequests: (clubId: string) =>
    ["club", clubId, "team-requests"] as const,

  members: (clubId: string) =>
    ["club", clubId, "members"] as const,

  memberTeams: (clubId: string) =>
    ["club", clubId, "member-teams"] as const,
};

export function useMyClub() {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.myClub,
    queryFn: getMyClub,
  });
}

export function usePendingClubRequest() {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.pendingRequest,
    queryFn: getPendingClubRequest,
  });
}

export function useMyApprovedClubMembership() {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.approvedMembership,
    queryFn: getMyApprovedClubMembership,
  });
}

export function useClub(clubId: string) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.byId(clubId),
    queryFn: () => getClubById(clubId),
    enabled: Boolean(clubId),
  });
}

export function useClubTeams(clubId: string) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.teams(clubId),
    queryFn: () => getClubTeams(clubId),
    enabled: Boolean(clubId),
  });
}

export function useMyPendingTeams(
  clubId: string,
  userId: string | null
) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.myPendingTeams(
      clubId,
      userId
    ),
    enabled: Boolean(clubId && userId),

    queryFn: async (): Promise<ClubTeam[]> => {
      if (!clubId || !userId) return [];

      const { data, error } = await supabase.rpc(
        "get_my_pending_teams",
        {
          p_club_id: clubId,
        }
      );

      if (error) {
        console.error("PENDING TEAM ERROR:", error);

        throw new Error(
          __DEV__
            ? `${error.message} (${error.code})`
            : "We couldn't load your requested team."
        );
      }

      return (data ?? []) as unknown as ClubTeam[];
    },
  });
}

export function useCanManageClub(clubId: string) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.canManage(clubId),
    queryFn: () => canManageClubMemberships(clubId),
    enabled: Boolean(clubId),
  });
}

export function usePendingClubJoinRequests(
  clubId: string
) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.clubRequests(clubId),
    queryFn: () => getPendingClubJoinRequests(clubId),
    enabled: Boolean(clubId),
  });
}

export function usePendingTeamJoinRequests(
  clubId: string
) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.teamRequests(clubId),
    queryFn: () => getPendingTeamJoinRequests(clubId),
    enabled: Boolean(clubId),
  });
}

export function useClubMembers(clubId: string) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.members(clubId),
    queryFn: () => getClubMembers(clubId),
    enabled: Boolean(clubId),
  });
}

export function useClubMemberTeams(clubId: string) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.memberTeams(clubId),
    queryFn: () => getClubMemberTeams(clubId),
    enabled: Boolean(clubId),
  });
}
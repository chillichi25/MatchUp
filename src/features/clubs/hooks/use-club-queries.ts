import { useQuery } from "@tanstack/react-query";

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

export const CLUB_QUERY_KEYS = {
  myClub: ["club", "my-club"] as const,
  pendingRequest: ["club", "pending-request"] as const,
  approvedMembership: ["club", "approved-membership"] as const,
  byId: (clubId: string) => ["club", clubId] as const,
  teams: (clubId: string) => ["club", clubId, "teams"] as const,
  canManage: (clubId: string) => ["club", clubId, "can-manage"] as const,
  clubRequests: (clubId: string) =>
    ["club", clubId, "club-requests"] as const,
  teamRequests: (clubId: string) =>
    ["club", clubId, "team-requests"] as const,
  members: (clubId: string) => ["club", clubId, "members"] as const,
  memberTeams: (clubId: string) =>
    ["club", clubId, "member-teams"] as const,
};

export function useMyClub() {
  return useQuery({ queryKey: CLUB_QUERY_KEYS.myClub, queryFn: getMyClub });
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

export function useCanManageClub(clubId: string) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.canManage(clubId),
    queryFn: () => canManageClubMemberships(clubId),
    enabled: Boolean(clubId),
  });
}

export function usePendingClubJoinRequests(clubId: string) {
  return useQuery({
    queryKey: CLUB_QUERY_KEYS.clubRequests(clubId),
    queryFn: () => getPendingClubJoinRequests(clubId),
    enabled: Boolean(clubId),
  });
}

export function usePendingTeamJoinRequests(clubId: string) {
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

import { supabase } from "@/lib/supabase/client";

import type {
  ApprovedClubMembership,
  ClubMember,
  ClubMemberTeam,
  ClubSummary,
  ClubTeam,
  MyClub,
  PendingClubJoinRequest,
  PendingClubRequest,
  PendingTeamJoinRequest,
} from "../types";

const CLUB_SUMMARY_COLUMNS = "id, name, city, county, country, badge_url";

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateCoordinates(lat: number, lng: number) {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error("Please select a valid location from the suggestions.");
  }
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be logged in.");
  }

  return user;
}

// --------------------------------------------------
// Club lookup
// --------------------------------------------------

export async function getMyClub(): Promise<MyClub | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("active_team_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.active_team_id) {
    if (profileError) console.error("GET ACTIVE TEAM ERROR:", profileError);
    return null;
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select(`club_id, clubs!teams_club_id_fkey (${CLUB_SUMMARY_COLUMNS})`)
    .eq("id", profile.active_team_id)
    .maybeSingle();

  if (teamError) {
    console.error("GET CLUB ERROR:", teamError);
    return null;
  }

  if (!team) return null;

  const club = first(team.clubs) as ClubSummary | null;

  if (!club) return null;

  return {
    club_id: team.club_id,
    coach_id: user.id,
    status: "approved",
    club,
  };
}

export async function getClubById(
  clubId: string
): Promise<ClubSummary | null> {
  if (!clubId?.trim()) return null;

  const { data, error } = await supabase
    .from("clubs")
    .select(CLUB_SUMMARY_COLUMNS)
    .eq("id", clubId)
    .maybeSingle();

  if (error) {
    console.error("GET CLUB BY ID ERROR:", error);
    return null;
  }

  return data;
}

export async function getClubTeams(clubId: string): Promise<ClubTeam[]> {
  if (!clubId?.trim()) return [];

  const { data, error } = await supabase
    .from("teams")
    .select("id, club_id, name, age_group, gender, level, match_format")
    .eq("club_id", clubId)
    .order("name", { ascending: true });

  if (error) {
    console.error("GET CLUB TEAMS ERROR:", error);
    throw new Error("We couldn't load the club teams.");
  }

  return data ?? [];
}

export async function searchClubs(query: string): Promise<ClubSummary[]> {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 1) return [];

  const { data, error } = await supabase
    .from("clubs")
    .select(CLUB_SUMMARY_COLUMNS)
    .ilike("name", `${cleanQuery}%`)
    .order("name", { ascending: true })
    .limit(8);

  if (error) {
    console.error("CLUB SEARCH ERROR:", error);
    throw new Error("Unable to search clubs.");
  }

  return data ?? [];
}

export async function getPendingClubRequest(): Promise<PendingClubRequest | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership, error } = await supabase
    .from("coach_clubs")
    .select(
      `id, club_id, status, created_at, clubs (${CLUB_SUMMARY_COLUMNS})`
    )
    .eq("coach_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    console.error("GET PENDING CLUB REQUEST ERROR:", error);
    throw new Error("We couldn't check your pending club request.");
  }

  if (!membership) return null;

  const club = first(membership.clubs) as ClubSummary | null;

  if (!club) return null;

  return {
    membershipId: membership.id,
    clubId: membership.club_id,
    status: membership.status,
    createdAt: membership.created_at,
    club,
  };
}

export async function getMyApprovedClubMembership(): Promise<ApprovedClubMembership | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: membership, error } = await supabase
    .from("coach_clubs")
    .select(
      `id, club_id, role, status, created_at, clubs (${CLUB_SUMMARY_COLUMNS})`
    )
    .eq("coach_id", user.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("GET MY APPROVED CLUB MEMBERSHIP ERROR:", error);
    throw new Error("We couldn't check your club membership.");
  }

  if (!membership) return null;

  const club = first(membership.clubs) as ClubSummary | null;

  if (!club) return null;

  return {
    membershipId: membership.id,
    clubId: membership.club_id,
    role: membership.role,
    status: membership.status,
    createdAt: membership.created_at,
    club,
  };
}

// --------------------------------------------------
// Create / join
// --------------------------------------------------

export async function completeClubSetup(input: {
  clubName: string;
  country: string;
  county: string;
  city: string;
  lat: number;
  lng: number;
  teamName: string;
  ageGroup: string;
  matchFormat: string;
  gender: string;
  level: string;
}) {
  await requireUser();

  const { data, error } = await supabase.rpc("complete_club_setup", {
    p_club_name: input.clubName,
    p_country: input.country,
    p_county: input.county,
    p_city: input.city,
    p_lat: input.lat,
    p_lng: input.lng,
    p_team_name: input.teamName,
    p_age_group: input.ageGroup,
    p_match_format: input.matchFormat,
    p_gender: input.gender,
    p_level: input.level,
  });

  if (error) {
    console.error("COMPLETE CLUB SETUP ERROR:", error);
    throw new Error(
      error.message ||
        "We couldn't create your club and team. Please try again."
    );
  }

  const result = first(data as Record<string, string>[] | Record<string, string>);

  if (!result?.club_id || !result?.team_id) {
    throw new Error("Your club and team could not be created.");
  }

  return { clubId: result.club_id, teamId: result.team_id };
}

export async function createClub(input: {
  name: string;
  country: string;
  county: string;
  city: string;
  lat: number;
  lng: number;
}) {
  const user = await requireUser();

  if (!input.name.trim()) throw new Error("Club name is required.");
  if (!input.city.trim()) throw new Error("City is required.");
  if (!input.country.trim()) throw new Error("Country is required.");

  validateCoordinates(input.lat, input.lng);

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .insert({
      name: input.name.trim(),
      slug: createSlug(input.name),
      country: input.country.trim(),
      county: input.county.trim(),
      city: input.city.trim(),
      created_by: user.id,
    })
    .select()
    .single();

  if (clubError) {
    console.error("CLUB CREATION ERROR:", clubError);
    throw new Error(clubError.message);
  }

  const { error: geoError } = await supabase.rpc("set_club_geo_location", {
    p_club_id: club.id,
    p_lat: input.lat,
    p_lng: input.lng,
  });

  if (geoError) {
    console.error("CLUB GEO LOCATION ERROR:", geoError);
    await supabase.from("clubs").delete().eq("id", club.id);
    throw new Error("Unable to save the club location.");
  }

  const { error: membershipError } = await supabase.rpc(
    "create_club_owner_membership",
    { p_club_id: club.id }
  );

  if (membershipError) {
    console.error("CLUB MEMBERSHIP ERROR:", membershipError);
    await supabase.from("clubs").delete().eq("id", club.id);
    throw new Error(membershipError.message);
  }

  return club;
}

export async function requestToJoinClub(clubId: string) {
  const user = await requireUser();

  if (!clubId.trim()) throw new Error("A club is required.");

  const { data: existingMembership, error: membershipError } = await supabase
    .from("coach_clubs")
    .select("id, status, role")
    .eq("coach_id", user.id)
    .eq("club_id", clubId)
    .maybeSingle();

  if (membershipError) {
    console.error("CHECK CLUB MEMBERSHIP ERROR:", membershipError);
    throw new Error("We couldn't check your club request. Please try again.");
  }

  if (existingMembership?.status === "pending") {
    return {
      membershipId: existingMembership.id,
      status: "pending" as const,
      alreadyExists: true,
    };
  }

  if (existingMembership?.status === "approved") {
    return {
      membershipId: existingMembership.id,
      status: "approved" as const,
      alreadyExists: true,
    };
  }

  const { data, error } = await supabase.rpc("request_to_join_club", {
    p_club_id: clubId,
  });

  if (error) {
    console.error("REQUEST TO JOIN CLUB RPC ERROR:", error);
    throw new Error(
      error.message || "We couldn't send your request. Please try again."
    );
  }

  if (!data) throw new Error("Your request could not be created.");

  return {
    membershipId: data as string,
    status: "pending" as const,
    alreadyExists: false,
  };
}

export async function requestToJoinTeam(teamId: string) {
  await requireUser();

  if (!teamId?.trim()) throw new Error("Please select a team.");

  const { data: membershipId, error } = await supabase.rpc(
    "request_to_join_team",
    { p_team_id: teamId }
  );

  if (error) {
    console.error("REQUEST TO JOIN TEAM ERROR:", error);
    throw new Error("We couldn't send your team request.");
  }

  return { membershipId: membershipId as string, status: "pending" as const };
}

// --------------------------------------------------
// Management
// --------------------------------------------------

export async function canManageClubMemberships(clubId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !clubId?.trim()) return false;

  const { data, error } = await supabase.rpc("can_manage_club_memberships", {
    p_club_id: clubId,
  });

  if (error) {
    console.error("CHECK CLUB MANAGEMENT PERMISSION ERROR:", error);
    return false;
  }

  return data === true;
}

export async function isClubOwner(clubId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !clubId?.trim()) return false;

  const { data: membership, error } = await supabase
    .from("coach_clubs")
    .select("id")
    .eq("coach_id", user.id)
    .eq("club_id", clubId.trim())
    .eq("status", "approved")
    .eq("role", "owner")
    .maybeSingle();

  if (error) {
    console.error("CHECK CLUB OWNER ERROR:", error);
    return false;
  }

  return Boolean(membership);
}

export async function getPendingClubJoinRequests(
  clubId: string
): Promise<PendingClubJoinRequest[]> {
  await requireUser();

  if (!clubId?.trim()) return [];

  const { data, error } = await supabase.rpc("get_pending_club_join_requests", {
    p_club_id: clubId,
  });

  if (error) {
    console.error("GET CLUB JOIN REQUESTS ERROR:", error);
    throw new Error("We couldn't load the club requests.");
  }

  return (data ?? []) as PendingClubJoinRequest[];
}

export async function approveClubJoinRequest(membershipId: string) {
  await requireUser();

  if (!membershipId?.trim()) throw new Error("A membership request is required.");

  const { error } = await supabase.rpc("approve_club_join_request", {
    p_membership_id: membershipId,
  });

  if (error) {
    console.error("APPROVE CLUB JOIN REQUEST ERROR:", error);
    throw new Error("We couldn't approve this request.");
  }

  return { success: true };
}

export async function getPendingTeamJoinRequests(
  clubId: string
): Promise<PendingTeamJoinRequest[]> {
  await requireUser();

  if (!clubId?.trim()) return [];

  const { data, error } = await supabase.rpc("get_pending_team_join_requests", {
    p_club_id: clubId,
  });

  if (error) {
    console.error("GET PENDING TEAM JOIN REQUESTS ERROR:", error);
    throw new Error("We couldn't load the team requests.");
  }

  return (data ?? []) as PendingTeamJoinRequest[];
}

export async function approveTeamJoinRequest(membershipId: string) {
  await requireUser();

  if (!membershipId?.trim()) throw new Error("A team membership request is required.");

  const { error } = await supabase.rpc("approve_team_join_request", {
    p_membership_id: membershipId,
  });

  if (error) {
    console.error("APPROVE TEAM JOIN REQUEST ERROR:", error);
    throw new Error("We couldn't approve this team request.");
  }

  return { success: true };
}

export async function getClubMembers(clubId: string): Promise<ClubMember[]> {
  await requireUser();

  if (!clubId?.trim()) return [];

  const { data, error } = await supabase.rpc("get_club_members", {
    p_club_id: clubId,
  });

  if (error) {
    console.error("GET CLUB MEMBERS ERROR:", error);
    throw new Error("We couldn't load the club members.");
  }

  return (data ?? []) as ClubMember[];
}

export async function getClubMemberTeams(
  clubId: string
): Promise<ClubMemberTeam[]> {
  await requireUser();

  if (!clubId?.trim()) return [];

  const { data, error } = await supabase.rpc("get_club_member_teams", {
    p_club_id: clubId,
  });

  if (error) {
    console.error("GET CLUB MEMBER TEAMS ERROR:", error);
    throw new Error("We couldn't load the club member teams.");
  }

  return (data ?? []) as ClubMemberTeam[];
}

export async function createTeamForClub(input: {
  clubId: string;
  name: string;
  ageGroup: string;
  matchFormat: string;
  gender: string;
  level: string;
}) {
  await requireUser();

  const { clubId, name, ageGroup, matchFormat, gender, level } = input;

  if (
    !clubId.trim() ||
    !name.trim() ||
    !ageGroup.trim() ||
    !matchFormat.trim() ||
    !gender.trim() ||
    !level.trim()
  ) {
    throw new Error("Please complete all required fields.");
  }

  const { data: teamId, error } = await supabase.rpc("create_team_for_club", {
    p_club_id: clubId.trim(),
    p_name: name.trim(),
    p_age_group: ageGroup.trim(),
    p_match_format: matchFormat.trim(),
    p_gender: gender.trim(),
    p_level: level.trim(),
  });

  if (error) {
    console.error("CREATE TEAM FOR CLUB ERROR:", error);
    throw new Error("We couldn't create this team.");
  }

  if (!teamId) throw new Error("The team could not be created.");

  return { success: true, teamId: teamId as string };
}

export async function updateTeamForClub(input: {
  teamId: string;
  name: string;
  ageGroup: string;
  matchFormat: string;
  gender: string;
  level: string;
}) {
  await requireUser();

  const { teamId, name, ageGroup, matchFormat, gender, level } = input;

  if (
    !teamId.trim() ||
    !name.trim() ||
    !ageGroup.trim() ||
    !matchFormat.trim() ||
    !gender.trim() ||
    !level.trim()
  ) {
    throw new Error("Please complete all required fields.");
  }

  const { error } = await supabase.rpc("update_team_for_club", {
    p_team_id: teamId.trim(),
    p_name: name.trim(),
    p_age_group: ageGroup.trim(),
    p_match_format: matchFormat.trim(),
    p_gender: gender.trim(),
    p_level: level.trim(),
  });

  if (error) {
    console.error("UPDATE TEAM FOR CLUB ERROR:", error);
    throw new Error("We couldn't update this team.");
  }

  return { success: true };
}

export async function assignClubMemberToTeam(input: {
  coachId: string;
  teamId: string;
}) {
  await requireUser();

  const { error } = await supabase.rpc("assign_club_member_to_team", {
    p_coach_id: input.coachId.trim(),
    p_team_id: input.teamId.trim(),
  });

  if (error) {
    console.error("ASSIGN CLUB MEMBER TO TEAM ERROR:", error);
    throw new Error("We couldn't assign this member to the team.");
  }

  return { success: true };
}

export async function removeClubMemberFromTeam(input: {
  coachId: string;
  teamId: string;
}) {
  await requireUser();

  const { error } = await supabase.rpc("remove_club_member_from_team", {
    p_coach_id: input.coachId.trim(),
    p_team_id: input.teamId.trim(),
  });

  if (error) {
    console.error("REMOVE CLUB MEMBER FROM TEAM ERROR:", error);
    throw new Error("We couldn't remove this member from the team.");
  }

  return { success: true };
}

export async function updateClubMemberRole(input: {
  membershipId: string;
  role: "coach" | "admin";
}) {
  await requireUser();

  if (!input.membershipId.trim()) {
    throw new Error("A club membership is required.");
  }

  const { error } = await supabase.rpc("update_club_member_role", {
    p_membership_id: input.membershipId.trim(),
    p_role: input.role,
  });

  if (error) {
    console.error("UPDATE CLUB MEMBER ROLE ERROR:", error);
    throw new Error("We couldn't update this member's role.");
  }

  return { success: true };
}

export async function removeClubMember(membershipId: string) {
  await requireUser();

  if (!membershipId.trim()) {
    throw new Error("A club membership is required.");
  }

  const { error } = await supabase.rpc("remove_club_member", {
    p_membership_id: membershipId.trim(),
  });

  if (error) {
    console.error("REMOVE CLUB MEMBER ERROR:", error);
    throw new Error("We couldn't remove this member from the club.");
  }

  return { success: true };
}

export async function updateClub(input: {
  clubId: string;
  name: string;
  country: string;
  county: string;
  city: string;
  lat: number;
  lng: number;
}) {
  const user = await requireUser();

  if (!input.name.trim()) throw new Error("Club name is required.");
  if (!input.city.trim()) throw new Error("City is required.");
  if (!input.country.trim()) throw new Error("Country is required.");

  validateCoordinates(input.lat, input.lng);

  const { data: membership, error: membershipError } = await supabase
    .from("coach_clubs")
    .select("club_id, role")
    .eq("coach_id", user.id)
    .eq("club_id", input.clubId)
    .eq("status", "approved")
    .maybeSingle();

  if (membershipError) {
    console.error("CLUB MEMBERSHIP LOOKUP ERROR:", membershipError);
    throw new Error(membershipError.message);
  }

  if (!membership || membership.role !== "owner") {
    throw new Error("You cannot edit this club.");
  }

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .update({
      name: input.name.trim(),
      country: input.country.trim(),
      county: input.county.trim(),
      city: input.city.trim(),
    })
    .eq("id", input.clubId)
    .select()
    .single();

  if (clubError) {
    console.error("CLUB UPDATE ERROR:", clubError);
    throw new Error(clubError.message);
  }

  const { error: geoError } = await supabase.rpc("set_club_geo_location", {
    p_club_id: input.clubId,
    p_lat: input.lat,
    p_lng: input.lng,
  });

  if (geoError) {
    console.error("CLUB GEO UPDATE ERROR:", geoError);
    throw new Error("Unable to update the club location.");
  }

  return club;
}

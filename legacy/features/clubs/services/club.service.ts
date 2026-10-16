"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

// --------------------------------------------------
// Get My Club
// --------------------------------------------------

export async function getMyClub() {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return null;
  }

  // Get the coach's active team
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("active_team_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error(
      "GET ACTIVE TEAM ERROR:",
      profileError
    );

    return null;
  }

  if (!profile?.active_team_id) {
    return null;
  }

  // Get the club belonging to the active team
  const {
    data: team,
    error: teamError,
  } = await supabase
    .from("teams")
    .select(`
      club_id,

      clubs!teams_club_id_fkey (
        *
      )
    `)
    .eq("id", profile.active_team_id)
    .maybeSingle();

  if (teamError) {
    console.error(
      "GET CLUB ERROR:",
      teamError
    );

    return null;
  }

  if (!team) {
    return null;
  }

  const club = Array.isArray(team.clubs)
    ? team.clubs[0]
    : team.clubs;

  if (!club) {
    return null;
  }

  return {
    club_id: team.club_id,
    coach_id: userId,
    status: "approved",
    clubs: club,
  };
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateCoordinates(
  lat: number,
  lng: number
) {
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error(
      "Please select a valid location from the suggestions."
    );
  }
}

// --------------------------------------------------
// Create Club
// --------------------------------------------------

export type CreateClubInput = {
  name: string;
  country: string;
  county: string;
  city: string;
  lat: number;
  lng: number;
};

export async function createClub(
  input: CreateClubInput
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be logged in to create a club."
    );
  }

  if (!input.name.trim()) {
    throw new Error(
      "Club name is required."
    );
  }

  if (!input.city.trim()) {
    throw new Error(
      "City is required."
    );
  }

  if (!input.country.trim()) {
    throw new Error(
      "Country is required."
    );
  }

  validateCoordinates(
    input.lat,
    input.lng
  );

  const slug = createSlug(input.name);

  // 1. Create club
  const {
    data: club,
    error: clubError,
  } = await supabase
    .from("clubs")
    .insert({
      name: input.name.trim(),
      slug,
      country: input.country.trim(),
      county: input.county.trim(),
      city: input.city.trim(),
      created_by: user.id,
    })
    .select()
    .single();

  if (clubError) {
    console.error(
      "CLUB CREATION ERROR:",
      clubError
    );

    throw new Error(
      clubError.message
    );
  }

  // 2. Save coordinates
  const { error: geoError } =
    await supabase.rpc(
      "set_club_geo_location",
      {
        p_club_id: club.id,
        p_lat: input.lat,
        p_lng: input.lng,
      }
    );

  if (geoError) {
    console.error(
      "CLUB GEO LOCATION ERROR:",
      geoError
    );

    await supabase
      .from("clubs")
      .delete()
      .eq("id", club.id);

    throw new Error(
      "Unable to save the club location."
    );
  }

  // 3. Connect creator as owner
  const {
    error: membershipError,
  } = await supabase.rpc(
    "create_club_owner_membership",
    {
      p_club_id: club.id,
    }
  );

  if (membershipError) {
    console.error(
      "CLUB MEMBERSHIP ERROR:",
      membershipError
    );

    await supabase
      .from("clubs")
      .delete()
      .eq("id", club.id);

    throw new Error(
      membershipError.message
    );
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/matches");

  return club;
}

// --------------------------------------------------
// Complete Club Setup
// --------------------------------------------------

export type CompleteClubSetupInput = {
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
};

export async function completeClubSetup({
  clubName,
  country,
  county,
  city,
  lat,
  lng,
  teamName,
  ageGroup,
  matchFormat,
  gender,
  level,
}: {
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
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to complete club setup."
    );
  }

  const { data, error } =
    await supabase.rpc(
      "complete_club_setup",
      {
        p_club_name: clubName,
        p_country: country,
        p_county: county,
        p_city: city,
        p_lat: lat,
        p_lng: lng,
        p_team_name: teamName,
        p_age_group: ageGroup,
        p_match_format: matchFormat,
        p_gender: gender,
        p_level: level,
      }
    );

  if (error) {
    console.error(
      "Complete club setup RPC error:",
      error
    );

    throw new Error(
      error.message ||
        "We couldn't create your club and team. Please try again."
    );
  }

  const result = Array.isArray(data)
    ? data[0]
    : data;

  if (!result?.club_id || !result?.team_id) {
    throw new Error(
      "Your club and team could not be created."
    );
  }

  return {
    clubId: result.club_id,
    teamId: result.team_id,
  };
}

// --------------------------------------------------
// Get Pending Club Request
// --------------------------------------------------

export async function getPendingClubRequest() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const {
    data: membership,
    error,
  } = await supabase
    .from("coach_clubs")
    .select(`
      id,
      club_id,
      status,
      created_at,

      clubs (
        id,
        name,
        city,
        county,
        country,
        badge_url
      )
    `)
    .eq("coach_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    console.error(
      "GET PENDING CLUB REQUEST ERROR:",
      error
    );

    throw new Error(
      "We couldn't check your pending club request."
    );
  }

  if (!membership) {
    return null;
  }

  const club = Array.isArray(
    membership.clubs
  )
    ? membership.clubs[0]
    : membership.clubs;

  if (!club) {
    return null;
  }

  return {
    membershipId: membership.id,
    clubId: membership.club_id,
    status: membership.status,
    createdAt: membership.created_at,
    club,
  };
}

// --------------------------------------------------
// Can Manage Club Memberships
// --------------------------------------------------

export async function canManageClubMemberships(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  if (!clubId?.trim()) {
    return false;
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "can_manage_club_memberships",
    {
      p_club_id: clubId,
    }
  );

  if (error) {
    console.error(
      "CHECK CLUB MANAGEMENT PERMISSION ERROR:",
      error
    );

    return false;
  }

  return data === true;
}

// --------------------------------------------------
// Get Pending Club Join Requests
// --------------------------------------------------

export async function getPendingClubJoinRequests(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to view club requests."
    );
  }

  if (!clubId?.trim()) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_pending_club_join_requests",
    {
      p_club_id: clubId,
    }
  );

  if (error) {
    console.error(
      "GET CLUB JOIN REQUESTS ERROR:",
      error
    );

    throw new Error(
      "We couldn't load the club requests."
    );
  }

  return data ?? [];
}

// --------------------------------------------------
// Approve Club Join Request
// --------------------------------------------------

export async function approveClubJoinRequest(
  membershipId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to approve club requests."
    );
  }

  if (!membershipId?.trim()) {
    throw new Error(
      "A membership request is required."
    );
  }

  const { error } = await supabase.rpc(
    "approve_club_join_request",
    {
      p_membership_id: membershipId,
    }
  );

  if (error) {
    console.error(
      "APPROVE CLUB JOIN REQUEST ERROR:",
      error
    );

    throw new Error(
      "We couldn't approve this request."
    );
  }

  revalidatePath("/clubs");
  revalidatePath("/clubs/pending");
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

// --------------------------------------------------
// Request To Join Club
// --------------------------------------------------

export async function requestToJoinClub(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to join a club."
    );
  }

  if (!clubId.trim()) {
    throw new Error(
      "A club is required."
    );
  }

  const {
    data: existingMembership,
    error: membershipError,
  } = await supabase
    .from("coach_clubs")
    .select(`
      id,
      status,
      role
    `)
    .eq("coach_id", user.id)
    .eq("club_id", clubId)
    .maybeSingle();

  if (membershipError) {
    console.error(
      "CHECK CLUB MEMBERSHIP ERROR:",
      membershipError
    );

    throw new Error(
      "We couldn't check your club request. Please try again."
    );
  }

  if (
    existingMembership?.status ===
    "pending"
  ) {
    return {
      membershipId:
        existingMembership.id,
      status: "pending" as const,
      alreadyExists: true,
    };
  }

  if (
    existingMembership?.status ===
    "approved"
  ) {
    return {
      membershipId:
        existingMembership.id,
      status: "approved" as const,
      alreadyExists: true,
    };
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "request_to_join_club",
    {
      p_club_id: clubId,
    }
  );

  if (error) {
    console.error(
      "REQUEST TO JOIN CLUB RPC ERROR:",
      error
    );

    throw new Error(
      error.message ||
        "We couldn't send your request. Please try again."
    );
  }

  if (!data) {
    throw new Error(
      "Your request could not be created."
    );
  }

  revalidatePath("/clubs");
  revalidatePath("/clubs/join");
  revalidatePath("/profile");

  return {
    membershipId: data,
    status: "pending" as const,
    alreadyExists: false,
  };
}

// --------------------------------------------------
// Search Clubs
// --------------------------------------------------

export type ClubSearchResult = {
  id: string;
  name: string;
  city: string;
  county: string;
  country: string;
  badge_url: string | null;
};

export async function searchClubs(
  query: string
): Promise<ClubSearchResult[]> {
  const supabase = await createClient();

  const cleanQuery = query.trim();

  if (cleanQuery.length < 1) {
  return [];
}

  const { data, error } =
    await supabase
      .from("clubs")
      .select(`
        id,
        name,
        city,
        county,
        country,
        badge_url
      `)
      .ilike(
        "name",
        `${cleanQuery}%`
      )
      .order("name", {
        ascending: true,
      })
      .limit(8);

  if (error) {
    console.error(
      "CLUB SEARCH ERROR:",
      error
    );

    throw new Error(
      "Unable to search clubs."
    );
  }

  return data ?? [];
}

// --------------------------------------------------
// Get Club By ID
// --------------------------------------------------

export async function getClubById(
  clubId: string
): Promise<ClubSearchResult | null> {
  const supabase = await createClient();

  if (!clubId?.trim()) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("clubs")
    .select(`
      id,
      name,
      city,
      county,
      country,
      badge_url
    `)
    .eq("id", clubId)
    .maybeSingle();

  if (error) {
    console.error(
      "GET CLUB BY ID ERROR:",
      error
    );

    return null;
  }

  return data;
}

// --------------------------------------------------
// Get Club Teams
// --------------------------------------------------

export async function getClubTeams(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to view club teams."
    );
  }

  if (!clubId?.trim()) {
    return [];
  }

  const {
    data: teams,
    error,
  } = await supabase
    .from("teams")
    .select(`
      id,
      club_id,
      name,
      age_group,
      gender,
      level,
      match_format
    `)
    .eq("club_id", clubId)
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "GET CLUB TEAMS ERROR:",
      error
    );

    throw new Error(
      "We couldn't load the club teams."
    );
  }

  return teams ?? [];
}

// --------------------------------------------------
// Request To Join Team
// --------------------------------------------------

export async function requestToJoinTeam(
  teamId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to request to join a team."
    );
  }

  if (!teamId?.trim()) {
    throw new Error(
      "Please select a team."
    );
  }

  const {
    data: membershipId,
    error,
  } = await supabase.rpc(
    "request_to_join_team",
    {
      p_team_id: teamId,
    }
  );

  if (error) {
    console.error(
      "REQUEST TO JOIN TEAM ERROR:",
      error
    );

    throw new Error(
      "We couldn't send your team request."
    );
  }

  revalidatePath("/clubs");
  revalidatePath("/clubs/pending");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return {
    membershipId,
    status: "pending" as const,
  };
}

// --------------------------------------------------
// Get Pending Team Join Requests
// --------------------------------------------------

export async function getPendingTeamJoinRequests(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to view team requests."
    );
  }

  if (!clubId?.trim()) {
    return [];
  }

  const { data, error } = await supabase.rpc(
    "get_pending_team_join_requests",
    {
      p_club_id: clubId,
    }
  );

  if (error) {
    console.error(
      "GET PENDING TEAM JOIN REQUESTS ERROR:",
      error
    );

    throw new Error(
      "We couldn't load the team requests."
    );
  }

  return data ?? [];
}

// --------------------------------------------------
// Approve Team Join Request
// --------------------------------------------------

export async function approveTeamJoinRequest(
  membershipId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to approve team requests."
    );
  }

  if (!membershipId?.trim()) {
    throw new Error(
      "A team membership request is required."
    );
  }

  const { error } = await supabase.rpc(
    "approve_team_join_request",
    {
      p_membership_id: membershipId,
    }
  );

  if (error) {
    console.error(
      "APPROVE TEAM JOIN REQUEST ERROR:",
      error
    );

    throw new Error(
      "We couldn't approve this team request."
    );
  }

  revalidatePath("/clubs");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return {
    success: true,
  };
}

// --------------------------------------------------
// Get My Team Membership
// --------------------------------------------------

export async function getMyTeamMembership(
  teamId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  if (!teamId?.trim()) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_my_team_membership",
    {
      p_team_id: teamId,
    }
  );

  if (error) {
    console.error(
      "GET MY TEAM MEMBERSHIP ERROR:",
      error
    );

    throw new Error(
      "We couldn't check your team membership."
    );
  }

  const membership = data?.[0];

  return membership ?? null;
}

// --------------------------------------------------
// Get My Club Team Memberships
// --------------------------------------------------

export async function getMyClubTeamMemberships(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  if (!clubId?.trim()) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_my_club_team_memberships",
    {
      p_club_id: clubId,
    }
  );

  if (error) {
    console.error(
      "GET MY CLUB TEAM MEMBERSHIPS ERROR:",
      error
    );

    throw new Error(
      "We couldn't load your team memberships."
    );
  }

  return data ?? [];
}

// --------------------------------------------------
// Set Active Team
// --------------------------------------------------

export async function setActiveTeam(
  teamId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to select a team."
    );
  }

  if (!teamId?.trim()) {
    throw new Error(
      "Please select a team."
    );
  }

  const { error } = await supabase.rpc(
    "set_active_team",
    {
      p_team_id: teamId,
    }
  );

  if (error) {
    console.error(
      "SET ACTIVE TEAM ERROR:",
      error
    );

    throw new Error(
      "We couldn't select this team."
    );
  }

  revalidatePath("/clubs");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return {
    success: true,
  };
}

// --------------------------------------------------
// Create Team For Club
// --------------------------------------------------

export async function createTeamForClub({
  clubId,
  name,
  ageGroup,
  matchFormat,
  gender,
  level,
}: {
  clubId: string;
  name: string;
  ageGroup: string;
  matchFormat: string;
  gender: string;
  level: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to create a team."
    );
  }

  const cleanClubId = clubId.trim();
  const cleanName = name.trim();
  const cleanAgeGroup = ageGroup.trim();
  const cleanMatchFormat = matchFormat.trim();
  const cleanGender = gender.trim();
  const cleanLevel = level.trim();

  if (
    !cleanClubId ||
    !cleanName ||
    !cleanAgeGroup ||
    !cleanMatchFormat ||
    !cleanGender ||
    !cleanLevel
  ) {
    throw new Error(
      "Please complete all required fields."
    );
  }

  const {
    data: teamId,
    error,
  } = await supabase.rpc(
    "create_team_for_club",
    {
      p_club_id: cleanClubId,
      p_name: cleanName,
      p_age_group: cleanAgeGroup,
      p_match_format: cleanMatchFormat,
      p_gender: cleanGender,
      p_level: cleanLevel,
    }
  );

  if (error) {
    console.error(
      "CREATE TEAM FOR CLUB ERROR:",
      error
    );

    throw new Error(
      "We couldn't create this team."
    );
  }

  if (!teamId) {
    throw new Error(
      "The team could not be created."
    );
  }

  revalidatePath(
    `/clubs/${cleanClubId}/manage/teams`
  );

  revalidatePath(
    `/clubs/${cleanClubId}/teams`
  );

  return {
    success: true,
    teamId,
  };
}

// --------------------------------------------------
// Update Team For Club
// --------------------------------------------------

export async function updateTeamForClub({
  teamId,
  name,
  ageGroup,
  matchFormat,
  gender,
  level,
}: {
  teamId: string;
  name: string;
  ageGroup: string;
  matchFormat: string;
  gender: string;
  level: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to update a team."
    );
  }

  const cleanTeamId = teamId.trim();
  const cleanName = name.trim();
  const cleanAgeGroup = ageGroup.trim();
  const cleanMatchFormat = matchFormat.trim();
  const cleanGender = gender.trim();
  const cleanLevel = level.trim();

  if (
    !cleanTeamId ||
    !cleanName ||
    !cleanAgeGroup ||
    !cleanMatchFormat ||
    !cleanGender ||
    !cleanLevel
  ) {
    throw new Error(
      "Please complete all required fields."
    );
  }

  const { error } = await supabase.rpc(
    "update_team_for_club",
    {
      p_team_id: cleanTeamId,
      p_name: cleanName,
      p_age_group: cleanAgeGroup,
      p_match_format: cleanMatchFormat,
      p_gender: cleanGender,
      p_level: cleanLevel,
    }
  );

  if (error) {
    console.error(
      "UPDATE TEAM FOR CLUB ERROR:",
      error
    );

    throw new Error(
      "We couldn't update this team."
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/matches");

  return {
    success: true,
  };
}

// --------------------------------------------------
// Get Club Members
// --------------------------------------------------

export async function getClubMembers(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to view club members."
    );
  }

  const cleanClubId = clubId.trim();

  if (!cleanClubId) {
    return [];
  }

  const { data, error } = await supabase.rpc(
    "get_club_members",
    {
      p_club_id: cleanClubId,
    }
  );

  if (error) {
    console.error(
      "GET CLUB MEMBERS ERROR:",
      error
    );

    throw new Error(
      "We couldn't load the club members."
    );
  }

  return data ?? [];
}

// --------------------------------------------------
// Get Club Member Teams
// --------------------------------------------------

export async function getClubMemberTeams(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to view club member teams."
    );
  }

  const cleanClubId = clubId.trim();

  if (!cleanClubId) {
    return [];
  }

  const { data, error } = await supabase.rpc(
    "get_club_member_teams",
    {
      p_club_id: cleanClubId,
    }
  );

  if (error) {
    console.error(
      "GET CLUB MEMBER TEAMS ERROR:",
      error
    );

    throw new Error(
      "We couldn't load the club member teams."
    );
  }

  return data ?? [];
}

// --------------------------------------------------
// Assign Club Member To Team
// --------------------------------------------------

export async function assignClubMemberToTeam({
  coachId,
  teamId,
}: {
  coachId: string;
  teamId: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to assign a team."
    );
  }

  const cleanCoachId = coachId.trim();
  const cleanTeamId = teamId.trim();

  if (!cleanCoachId || !cleanTeamId) {
    throw new Error(
      "A member and team are required."
    );
  }

  const { error } = await supabase.rpc(
    "assign_club_member_to_team",
    {
      p_coach_id: cleanCoachId,
      p_team_id: cleanTeamId,
    }
  );

  if (error) {
    console.error(
      "ASSIGN CLUB MEMBER TO TEAM ERROR:",
      error
    );

    throw new Error(
      "We couldn't assign this member to the team."
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return {
    success: true,
  };
}

// --------------------------------------------------
// Remove Club Member From Team
// --------------------------------------------------

export async function removeClubMemberFromTeam({
  coachId,
  teamId,
}: {
  coachId: string;
  teamId: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to remove a team assignment."
    );
  }

  const cleanCoachId = coachId.trim();
  const cleanTeamId = teamId.trim();

  if (!cleanCoachId || !cleanTeamId) {
    throw new Error(
      "A member and team are required."
    );
  }

  const { error } = await supabase.rpc(
    "remove_club_member_from_team",
    {
      p_coach_id: cleanCoachId,
      p_team_id: cleanTeamId,
    }
  );

  if (error) {
    console.error(
      "REMOVE CLUB MEMBER FROM TEAM ERROR:",
      error
    );

    throw new Error(
      "We couldn't remove this member from the team."
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return {
    success: true,
  };
}

// --------------------------------------------------
// Get My Approved Club Membership
// --------------------------------------------------

export async function getMyApprovedClubMembership() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const {
    data: membership,
    error,
  } = await supabase
    .from("coach_clubs")
    .select(`
      id,
      club_id,
      role,
      status,
      created_at,

      clubs (
        id,
        name,
        city,
        county,
        country,
        badge_url
      )
    `)
    .eq("coach_id", user.id)
    .eq("status", "approved")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "GET MY APPROVED CLUB MEMBERSHIP ERROR:",
      error
    );

    throw new Error(
      "We couldn't check your club membership."
    );
  }

  if (!membership) {
    return null;
  }

  const club = Array.isArray(membership.clubs)
    ? membership.clubs[0]
    : membership.clubs;

  if (!club) {
    return null;
  }

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
// Update Club Member Role
// --------------------------------------------------

export async function updateClubMemberRole({
  membershipId,
  role,
}: {
  membershipId: string;
  role: "coach" | "admin";
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to change a member's role."
    );
  }

  const cleanMembershipId =
    membershipId.trim();

  if (!cleanMembershipId) {
    throw new Error(
      "A club membership is required."
    );
  }

  if (
    role !== "coach" &&
    role !== "admin"
  ) {
    throw new Error(
      "Please select a valid club role."
    );
  }

  const { error } = await supabase.rpc(
    "update_club_member_role",
    {
      p_membership_id:
        cleanMembershipId,
      p_role: role,
    }
  );

  if (error) {
    console.error(
      "UPDATE CLUB MEMBER ROLE ERROR:",
      error
    );

    throw new Error(
      "We couldn't update this member's role."
    );
  }

  revalidatePath("/profile");

  return {
    success: true,
  };
}

// --------------------------------------------------
// Remove Club Member
// --------------------------------------------------

export async function removeClubMember(
  membershipId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to remove a club member."
    );
  }

  const cleanMembershipId =
    membershipId.trim();

  if (!cleanMembershipId) {
    throw new Error(
      "A club membership is required."
    );
  }

  const { error } = await supabase.rpc(
    "remove_club_member",
    {
      p_membership_id:
        cleanMembershipId,
    }
  );

  if (error) {
    console.error(
      "REMOVE CLUB MEMBER ERROR:",
      error
    );

    throw new Error(
      "We couldn't remove this member from the club."
    );
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/clubs");

  return {
    success: true,
  };
}

// --------------------------------------------------
// Is Club Owner
// --------------------------------------------------

export async function isClubOwner(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const cleanClubId = clubId.trim();

  if (!cleanClubId) {
    return false;
  }

  const {
    data: membership,
    error,
  } = await supabase
    .from("coach_clubs")
    .select("id")
    .eq("coach_id", user.id)
    .eq("club_id", cleanClubId)
    .eq("status", "approved")
    .eq("role", "owner")
    .maybeSingle();

  if (error) {
    console.error(
      "CHECK CLUB OWNER ERROR:",
      error
    );

    return false;
  }

  return Boolean(membership);
}

// --------------------------------------------------
// Get Club For Join
// --------------------------------------------------

export async function getClubForJoin(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to view a club."
    );
  }

  if (!clubId.trim()) {
    return null;
  }

  const {
    data: club,
    error,
  } = await supabase
    .from("clubs")
    .select(`
      id,
      name,
      city,
      county,
      country,
      badge_url
    `)
    .eq("id", clubId)
    .maybeSingle();

  if (error) {
    console.error(
      "GET CLUB FOR JOIN ERROR:",
      error
    );

    throw new Error(
      "We couldn't load this club."
    );
  }

  return club;
}

// --------------------------------------------------
// Is Approved Club Member
// --------------------------------------------------

export async function isApprovedClubMember(
  clubId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  if (!clubId?.trim()) {
    return false;
  }

  const {
    data: membership,
    error,
  } = await supabase
    .from("coach_clubs")
    .select("id")
    .eq("coach_id", user.id)
    .eq("club_id", clubId)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    console.error(
      "CHECK APPROVED CLUB MEMBERSHIP ERROR:",
      error
    );

    return false;
  }

  return Boolean(membership);
}

// --------------------------------------------------
// Update Club
// --------------------------------------------------

export type UpdateClubInput = {
  clubId: string;
  name: string;
  country: string;
  county: string;
  city: string;
  lat: number;
  lng: number;
};

export async function updateClub(
  input: UpdateClubInput
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be logged in to update a club."
    );
  }

  if (!input.name.trim()) {
    throw new Error(
      "Club name is required."
    );
  }

  if (!input.city.trim()) {
    throw new Error(
      "City is required."
    );
  }

  if (!input.country.trim()) {
    throw new Error(
      "Country is required."
    );
  }

  validateCoordinates(
    input.lat,
    input.lng
  );

  // Make sure this coach owns the club
  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("coach_clubs")
    .select(`
      club_id,
      role
    `)
    .eq("coach_id", user.id)
    .eq("club_id", input.clubId)
    .eq("status", "approved")
    .maybeSingle();

  if (membershipError) {
    console.error(
      "CLUB MEMBERSHIP LOOKUP ERROR:",
      membershipError
    );

    throw new Error(
      membershipError.message
    );
  }

  if (
    !membership ||
    membership.role !== "owner"
  ) {
    throw new Error(
      "You cannot edit this club."
    );
  }

  // 1. Update club text information
  const {
    data: club,
    error: clubError,
  } = await supabase
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
    console.error(
      "CLUB UPDATE ERROR:",
      clubError
    );

    throw new Error(
      clubError.message
    );
  }

  // 2. Store selected coordinates
  const { error: geoError } =
    await supabase.rpc(
      "set_club_geo_location",
      {
        p_club_id: input.clubId,
        p_lat: input.lat,
        p_lng: input.lng,
      }
    );

  if (geoError) {
    console.error(
      "CLUB GEO UPDATE ERROR:",
      geoError
    );

    throw new Error(
      "Unable to update the club location."
    );
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/matches");

  return club;
}
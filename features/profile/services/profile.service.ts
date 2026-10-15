"use server";

import { createClient } from "@/lib/supabase/server";
import { getTeamStatistics } from "@/features/matches/services/get-team-statistics";
import { getUpcomingMatches } from "@/features/matches/services/matches.service";
import { getRecentResults } from "@/features/matches/services/get-recent-results";

export async function getProfileData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // --------------------------------------------------
  // 1. Get the coach's active team
  // --------------------------------------------------

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("active_team_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "PROFILE ACTIVE TEAM ERROR:",
      profileError
    );

    return null;
  }

  if (!profile?.active_team_id) {
    return null;
  }

  // --------------------------------------------------
  // 2. Load the active team and its club
  // --------------------------------------------------

  const {
    data: team,
    error: teamError,
  } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      age_group,
      gender,
      level,
      club_id,

      clubs!teams_club_id_fkey (
        id,
        name,
        badge_url,
        city,
        county,
        country
      )
    `)
    .eq("id", profile.active_team_id)
    .maybeSingle();

  if (teamError) {
    console.error(
      "ACTIVE TEAM ERROR:",
      teamError
    );

    return null;
  }

  if (!team) {
    return null;
  }

  // --------------------------------------------------
  // 3. Resolve club relation
  // --------------------------------------------------

  const club = Array.isArray(team.clubs)
    ? team.clubs[0]
    : team.clubs;

  if (!club) {
    return null;
  }

  // --------------------------------------------------
  // 4. Get existing club coordinates
  // --------------------------------------------------

  let clubLat: number | null = null;
  let clubLng: number | null = null;

  if (club.id) {
    const {
      data: coordinates,
      error: coordinatesError,
    } = await supabase.rpc(
      "get_club_coordinates",
      {
        p_club_id: club.id,
      }
    );

    if (coordinatesError) {
      console.error(
        "CLUB COORDINATES ERROR:",
        coordinatesError
      );
    } else {
      const coordinateRow =
        coordinates?.[0];

      clubLat =
        coordinateRow?.lat ?? null;

      clubLng =
        coordinateRow?.lng ?? null;
    }
  }

  // --------------------------------------------------
  // 5. Team data
  // --------------------------------------------------

  const [
  statistics,
  upcomingMatches,
  recentResults,
] = await Promise.all([
  getTeamStatistics(team.id),
  getUpcomingMatches(team.id),
  getRecentResults(team.id),
]);

  // --------------------------------------------------
  // 6. Return Profile data
  // --------------------------------------------------

  return {
    teamId: team.id,

    clubId: club.id,
    clubName: club.name ?? "",
    badgeUrl: club.badge_url ?? null,

    clubCity: club.city ?? "",
    clubCounty: club.county ?? "",
    clubCountry: club.country ?? "",

    clubLat,
    clubLng,

    teamName: team.name,
    teamAgeGroup: team.age_group ?? "",
    teamGender: team.gender ?? "",
    teamLevel: team.level ?? "",

    statistics,
    upcomingMatches,
    recentResults,
  };
}
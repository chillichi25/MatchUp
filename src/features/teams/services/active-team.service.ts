import { supabase } from "@/lib/supabase/client";

export type ActiveTeam = {
  id: string;
  name: string;
  club_id: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  match_format: string | null;
  clubs: {
    id: string;
    name: string;
    badge_url: string | null;
    city: string | null;
    county: string | null;
    country: string | null;
  } | null;
};

export type AvailableTeam = {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  club_id: string;
  clubs: {
    id: string;
    name: string;
    badge_url: string | null;
    city: string | null;
  };
};

export async function getActiveTeam(): Promise<ActiveTeam | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("active_team_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("ACTIVE TEAM PROFILE ERROR:", profileError);
    return null;
  }

  if (!profile?.active_team_id) {
    return null;
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select(
      `
        id,
        name,
        club_id,
        age_group,
        gender,
        level,
        match_format,

        clubs!teams_club_id_fkey (
          id,
          name,
          badge_url,
          city,
          county,
          country
        )
      `
    )
    .eq("id", profile.active_team_id)
    .maybeSingle();

  if (teamError) {
    console.error("ACTIVE TEAM LOAD ERROR:", teamError);
    return null;
  }

  if (!team) {
    return null;
  }

  const club = Array.isArray(team.clubs) ? team.clubs[0] : team.clubs;

  return { ...team, clubs: club ?? null } as ActiveTeam;
}

export async function getAvailableTeams(): Promise<AvailableTeam[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase.rpc("get_my_available_teams");

  if (error) {
    console.error("AVAILABLE TEAMS ERROR:", error);
    return [];
  }

  return (data ?? []).map(
    (team: {
      id: string;
      name: string;
      age_group: string | null;
      gender: string | null;
      level: string | null;
      club_id: string;
      club_name: string;
      badge_url: string | null;
      city: string | null;
    }) => ({
      id: team.id,
      name: team.name,
      age_group: team.age_group,
      gender: team.gender,
      level: team.level,
      club_id: team.club_id,
      clubs: {
        id: team.club_id,
        name: team.club_name,
        badge_url: team.badge_url,
        city: team.city,
      },
    })
  );
}

export async function setActiveTeam(teamId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase.rpc("set_my_active_team", {
    p_team_id: teamId,
  });

  if (error) {
    console.error("SET ACTIVE TEAM ERROR:", error);
    throw new Error(error.message || "Unable to switch team.");
  }

  return { success: true, teamId };
}

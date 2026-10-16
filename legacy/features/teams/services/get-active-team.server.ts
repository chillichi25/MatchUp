"use server";

import { createClient } from "@/lib/supabase/server";

export async function getActiveTeam() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

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
      "ACTIVE TEAM PROFILE ERROR:",
      profileError
    );

    return null;
  }

  if (!profile?.active_team_id) {
    return null;
  }

  const {
    data: team,
    error: teamError,
  } = await supabase
    .from("teams")
    .select(`
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
`)
    .eq("id", profile.active_team_id)
    .maybeSingle();

  if (teamError) {
    console.error(
      "ACTIVE TEAM LOAD ERROR:",
      teamError
    );

    return null;
  }

  return team;
}
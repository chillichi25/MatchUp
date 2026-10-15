import { createClient } from "@/lib/supabase/server";

export async function getUpcomingMatch() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Find the logged-in coach's team
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("created_by", user.id)
    .maybeSingle();

  if (!team) return null;

  // Find the next scheduled match
  const { data: match } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey (
        id,
        name,
        clubs!teams_club_id_fkey (
          id,
          name
        )
      ),
      away_team:teams!matches_away_team_id_fkey (
        id,
        name,
        clubs!teams_club_id_fkey (
          id,
          name
        )
      )
    `)
    .or(
      `home_team_id.eq.${team.id},away_team_id.eq.${team.id}`
    )
    .eq("status", "scheduled")
    .order("match_date")
    .limit(1)
    .maybeSingle();

  return match;
}
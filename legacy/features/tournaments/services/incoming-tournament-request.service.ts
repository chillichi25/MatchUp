"use server";

import { createClient } from "@/lib/supabase/server";

export async function getIncomingTournamentRequests() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("tournament_requests")
    .select(`
      id,
      tournament_id,
      requesting_team_id,
      requested_by,
      message,
      status,
      created_at,
      responded_at,

      tournaments!inner (
  id,
  name,
  start_date,
  end_date,
  location,
  created_by
),

      teams!tournament_requests_requesting_team_id_fkey (
        id,
        name,
        age_group,

        clubs (
          id,
          name,
          badge_url
        )
      )
    `)
    .eq("tournaments.created_by", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Tournament requests error:",
      error
    );

    return [];
  }

  return data ?? [];
}
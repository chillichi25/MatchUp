"use server";

import { createClient } from "@/lib/supabase/server";

export type CalendarMatch = {
  id: string;
  matchDate: string;
  opponent: {
    clubName: string;
    teamName: string;
  };
};

export async function getCalendarMatches(): Promise<CalendarMatch[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!team) {
    return [];
  }

  const { data: matches, error } = await supabase
    .from("matches")
    .select(`
      id,
      match_date,

      home:home_team_id (
        id,
        name,
        clubs (
          name
        )
      ),

      away:away_team_id (
        id,
        name,
        clubs (
          name
        )
      )
    `)
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .order("match_date", {
      ascending: true,
    });

  if (error || !matches) {
    return [];
  }

  return matches.map((match: any) => {
    const isHome = match.home.id === team.id;

    const opponent = isHome ? match.away : match.home;

    const club = Array.isArray(opponent.clubs)
      ? opponent.clubs[0]
      : opponent.clubs;

    return {
      id: match.id,
      matchDate: match.match_date,
      opponent: {
        clubName: club?.name ?? "",
        teamName: opponent.name,
      },
    };
  });
}
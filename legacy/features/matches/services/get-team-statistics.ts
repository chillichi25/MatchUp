"use server";

import { createClient } from "@/lib/supabase/server";

export async function getTeamStatistics(
  teamId: string
) {
  const supabase = await createClient();

  const { data: matches, error } =
    await supabase
      .from("matches")
      .select(`
        home_team_id,
        away_team_id,
        home_score,
        away_score
      `)
      .or(
        `home_team_id.eq.${teamId},away_team_id.eq.${teamId}`
      )
      .eq("status", "completed");

  if (error) {
    throw error;
  }

  let played = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const match of matches ?? []) {
    played++;

    const isHome =
      match.home_team_id === teamId;

    const myGoals = isHome
      ? match.home_score ?? 0
      : match.away_score ?? 0;

    const opponentGoals = isHome
      ? match.away_score ?? 0
      : match.home_score ?? 0;

    goalsFor += myGoals;
    goalsAgainst += opponentGoals;

    if (myGoals > opponentGoals) {
      wins++;
    } else if (myGoals < opponentGoals) {
      losses++;
    } else {
      draws++;
    }
  }

  return {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference:
      goalsFor - goalsAgainst,
  };
}
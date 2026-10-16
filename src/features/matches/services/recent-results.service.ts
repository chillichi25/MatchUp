import { supabase } from "@/lib/supabase/client";

import { computeOutcome, type MatchOutcome } from "../utils/match-outcome";

export type RecentResult = {
  id: string;
  matchDate: string;

  opponent: {
    clubName: string;
    badgeUrl: string | null;
    teamName: string;
  };

  myScore: number;
  opponentScore: number;

  result: MatchOutcome;
};

type EmbeddedTeam = {
  id: string;
  name: string;
  clubs:
    | { name: string | null; badge_url: string | null }
    | { name: string | null; badge_url: string | null }[]
    | null;
};

type RecentMatchRow = {
  id: string;
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  home: EmbeddedTeam | null;
  away: EmbeddedTeam | null;
};

function firstClub(team: EmbeddedTeam | null) {
  const clubs = team?.clubs;
  return Array.isArray(clubs) ? clubs[0] ?? null : clubs ?? null;
}

/** Loads the active team's five most recent completed matches. */
export async function getRecentResults(teamId: string): Promise<RecentResult[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
        id,
        match_date,
        home_score,
        away_score,

        home:home_team_id (
          id,
          name,
          clubs (
            name,
            badge_url
          )
        ),

        away:away_team_id (
          id,
          name,
          clubs (
            name,
            badge_url
          )
        )
      `
    )
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq("status", "completed")
    .order("match_date", { ascending: false })
    .limit(5);

  if (error || !data) {
    return [];
  }

  return (data as unknown as RecentMatchRow[]).map((match) => {
    const isHome = match.home?.id === teamId;

    const opponent = (isHome ? match.away : match.home) ?? null;
    const opponentClub = firstClub(opponent);

    const myScore = ((isHome ? match.home_score : match.away_score) ?? 0) as number;
    const opponentScore = ((isHome ? match.away_score : match.home_score) ??
      0) as number;

    return {
      id: match.id,
      matchDate: match.match_date,

      opponent: {
        clubName: opponentClub?.name ?? "",
        badgeUrl: opponentClub?.badge_url ?? null,
        teamName: opponent?.name ?? "Opponent",
      },

      myScore,
      opponentScore,

      result: computeOutcome(myScore, opponentScore),
    };
  });
}

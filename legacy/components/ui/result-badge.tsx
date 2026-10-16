"use server";

import { createClient } from "@/lib/supabase/server";

export type RecentResult = {
  id: string;
  matchDate: string;
  opponent: {
    clubName: string;
    teamName: string;
  };
  myScore: number;
  opponentScore: number;
  result: "win" | "draw" | "loss";
};

export async function getRecentResults(): Promise<RecentResult[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Find my team
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("created_by", user.id)
    .single();

  if (!team) {
    return [];
  }

  // Load the last 5 completed matches
  const { data: matches, error } = await supabase
    .from("matches")
    .select(`
      id,
      match_date,
      home_score,
      away_score,

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
    .eq("status", "completed")
    .order("match_date", { ascending: false })
    .limit(5);

  if (error || !matches) {
    return [];
  }

  return matches.map((match: any) => {
    const isHome = match.home.id === team.id;

    const opponent = isHome ? match.away : match.home;

    const myScore = isHome
      ? match.home_score
      : match.away_score;

    const opponentScore = isHome
      ? match.away_score
      : match.home_score;

    let result: "win" | "draw" | "loss" = "draw";

    if (myScore > opponentScore) {
      result = "win";
    } else if (myScore < opponentScore) {
      result = "loss";
    }

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
      myScore,
      opponentScore,
      result,
    };
  });
}
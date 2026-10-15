"use server";

import { createClient } from "@/lib/supabase/server";

export type MatchHistoryItem = {
  id: string;
  status: "completed" | "cancelled";
  matchDate: string;
  kickOffTime: string;
  location: string | null;

  opponent: {
    clubName: string;
    teamName: string;
  };

  myScore: number | null;
  opponentScore: number | null;

  result:
    | "win"
    | "draw"
    | "loss"
    | null;

  cancelledByMyTeam: boolean;
};

export async function getMatchHistory(): Promise<
  MatchHistoryItem[]
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // --------------------------------------------------
  // ACTIVE TEAM
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
      "MATCH HISTORY PROFILE ERROR:",
      profileError
    );

    return [];
  }

  const activeTeamId =
    profile?.active_team_id;

  if (!activeTeamId) {
    return [];
  }

  // --------------------------------------------------
  // COMPLETED + CANCELLED MATCHES
  // --------------------------------------------------

  const {
    data: matches,
    error,
  } = await supabase
    .from("matches")
    .select(`
      id,
      status,
      match_date,
      kick_off_time,
      location,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      cancelled_by_team_id,

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
    .or(
      `home_team_id.eq.${activeTeamId},away_team_id.eq.${activeTeamId}`
    )
    .in("status", [
      "completed",
      "cancelled",
    ])
    .order("match_date", {
      ascending: false,
    })
    .order("kick_off_time", {
      ascending: false,
    });

  if (error || !matches) {
    console.error(
      "GET MATCH HISTORY ERROR:",
      error
    );

    return [];
  }

  // --------------------------------------------------
  // FORMAT
  // --------------------------------------------------

  return matches.map(
    (match: any) => {
      const isHome =
        match.home_team_id ===
        activeTeamId;

      const opponent = isHome
        ? match.away
        : match.home;

      const myScore =
        match.status === "completed"
          ? isHome
            ? match.home_score
            : match.away_score
          : null;

      const opponentScore =
        match.status === "completed"
          ? isHome
            ? match.away_score
            : match.home_score
          : null;

      let result:
        | "win"
        | "draw"
        | "loss"
        | null = null;

      if (
        match.status === "completed" &&
        myScore !== null &&
        opponentScore !== null
      ) {
        if (
          myScore >
          opponentScore
        ) {
          result = "win";
        } else if (
          myScore <
          opponentScore
        ) {
          result = "loss";
        } else {
          result = "draw";
        }
      }

      const club =
        Array.isArray(
          opponent?.clubs
        )
          ? opponent.clubs[0]
          : opponent?.clubs;

      return {
        id: match.id,

        status:
          match.status as
            | "completed"
            | "cancelled",

        matchDate:
          match.match_date,

        kickOffTime:
          match.kick_off_time?.slice(
            0,
            5
          ) ?? "",

        location:
          match.location ?? null,

        opponent: {
          clubName:
            club?.name ??
            "Opponent",

          teamName:
            opponent?.name ??
            "",
        },

        myScore,
        opponentScore,
        result,

        cancelledByMyTeam:
          match.status ===
            "cancelled" &&
          match.cancelled_by_team_id ===
            activeTeamId,
      };
    }
  );
}
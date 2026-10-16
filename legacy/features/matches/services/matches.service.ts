"use server";

import { createClient } from "@/lib/supabase/server";
import type { MatchTeam } from "../types";

export async function getUpcomingMatches(
  teamId: string
) {
  const supabase = await createClient();

  const { data: matches, error } =
    await supabase
      .from("matches")
      .select(`
        id,
        match_date,
        kick_off_time,
        location,

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
        ),

        match_conversations (
          id
        )
      `)
      .or(
        `home_team_id.eq.${teamId},away_team_id.eq.${teamId}`
      )
      .eq("status", "scheduled")
      .order("match_date", {
        ascending: true,
      });

  if (error) {
    throw error;
  }

  return (matches ?? []).map((match) => {
    const home =
      match.home as unknown as MatchTeam;

    const away =
      match.away as unknown as MatchTeam;

    const opponent =
      home.id === teamId
        ? away
        : home;

    const conversation =
      Array.isArray(
        match.match_conversations
      )
        ? match.match_conversations[0]
        : match.match_conversations;

    return {
      ...match,
      opponent,
      conversationId:
        conversation?.id,
    };
  });
}
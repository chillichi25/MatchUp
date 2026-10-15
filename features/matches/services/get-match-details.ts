"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";
import type { MatchTeam } from "../types";

export async function getMatchDetails(
  matchId: string,
) {
  const supabase = await createClient();

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // --------------------------------------------------
  // ACTIVE TEAM
  // --------------------------------------------------

  const myTeam =
    await getActiveTeam();

  if (!myTeam) {
    throw new Error(
      "Active team not found"
    );
  }

  // --------------------------------------------------
  // MATCH
  // --------------------------------------------------

  const {
    data: match,
    error,
  } = await supabase
    .from("matches")
    .select(`
      id,
      status,
      match_date,
      kick_off_time,
      location,
      home_score,
      away_score,
      completed_at,

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
    .eq("id", matchId)
    .single();

  if (error) {
    throw error;
  }

  // --------------------------------------------------
  // NORMALISE TEAMS
  // --------------------------------------------------

  const home =
    match.home as unknown as MatchTeam;

  const away =
    match.away as unknown as MatchTeam;

  // --------------------------------------------------
  // VERIFY ACTIVE TEAM IS IN THIS MATCH
  // --------------------------------------------------

  const activeTeamIsHome =
    home.id === myTeam.id;

  const activeTeamIsAway =
    away.id === myTeam.id;

  if (
    !activeTeamIsHome &&
    !activeTeamIsAway
  ) {
    throw new Error(
      "This match does not belong to the active team."
    );
  }

  // --------------------------------------------------
  // OPPONENT
  // --------------------------------------------------

  const opponent =
    activeTeamIsHome
      ? away
      : home;

  // --------------------------------------------------
  // CONVERSATION
  // --------------------------------------------------

  const conversation =
    Array.isArray(
      match.match_conversations
    )
      ? match.match_conversations[0]
      : match.match_conversations;

      // --------------------------------------------------
// PENDING MATCH CHANGE
// --------------------------------------------------

const {
  data: pendingChanges,
  error: pendingChangeError,
} = await supabase.rpc(
  "get_pending_match_change",
  {
    p_match_id: matchId,
  }
);

if (pendingChangeError) {
  console.error(
    "PENDING MATCH CHANGE ERROR:",
    pendingChangeError
  );

  throw pendingChangeError;
}

const pendingChange =
  pendingChanges?.[0] ?? null;

  // --------------------------------------------------
// PENDING MATCH RESULT
// --------------------------------------------------

const {
  data: pendingResults,
  error: pendingResultError,
} = await supabase.rpc(
  "get_pending_match_result",
  {
    p_match_id: matchId,
  }
);

if (pendingResultError) {
  console.error(
    "PENDING MATCH RESULT ERROR:",
    pendingResultError
  );

  throw pendingResultError;
}

const pendingResult =
  pendingResults?.[0] ?? null;


  // --------------------------------------------------
// PRIVATE MATCH NOTE
// --------------------------------------------------

const {
  data: matchNotes,
  error: matchNoteError,
} = await supabase.rpc(
  "get_match_note",
  {
    p_match_id: matchId,
    p_team_id: myTeam.id,
  }
);

if (matchNoteError) {
  console.error(
    "MATCH NOTE ERROR:",
    matchNoteError
  );

  throw matchNoteError;
}

const matchNote =
  matchNotes?.[0] ?? null;

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

 return {
  ...match,
  opponent,
  activeTeamId: myTeam.id,
  conversationId:
    conversation?.id ?? null,
  pendingChange,
  pendingResult,
  matchNote,
};
}
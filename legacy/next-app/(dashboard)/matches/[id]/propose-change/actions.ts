"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/services/notification.service";

type ProposeMatchChangeInput = {
  matchId: string;
  proposingTeamId: string;
  matchDate: string;
  kickOffTime: string;
  location: string;
};

export async function proposeMatchChangeAction(
  input: ProposeMatchChangeInput
): Promise<{
  error: string | null;
  proposalId?: string;
}> {
  const supabase = await createClient();

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in.",
    };
  }

  // --------------------------------------------------
  // VALIDATE
  // --------------------------------------------------

  if (
    !input.matchId ||
    !input.proposingTeamId ||
    !input.matchDate ||
    !input.kickOffTime ||
    !input.location.trim()
  ) {
    return {
      error: "Please complete all match details.",
    };
  }

  // --------------------------------------------------
// LOAD MATCH / OPPOSING TEAM
// --------------------------------------------------

const {
  data: match,
  error: matchError,
} = await supabase
  .from("matches")
  .select(`
    id,
    home_team_id,
    away_team_id,

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
  .eq("id", input.matchId)
  .single();

if (matchError || !match) {
  console.error(
    "LOAD MATCH FOR CHANGE NOTIFICATION ERROR:",
    matchError
  );

  return {
    error: "The match could not be loaded.",
  };
}

const proposingTeamIsHome =
  match.home_team_id ===
  input.proposingTeamId;

const opponentTeamId =
  proposingTeamIsHome
    ? match.away_team_id
    : match.home_team_id;

const proposingTeamRelation =
  proposingTeamIsHome
    ? match.home
    : match.away;

const proposingTeam = Array.isArray(
  proposingTeamRelation
)
  ? proposingTeamRelation[0]
  : proposingTeamRelation;

const clubRelation =
  proposingTeam?.clubs;

const proposingClub = Array.isArray(
  clubRelation
)
  ? clubRelation[0]
  : clubRelation;

  // --------------------------------------------------
  // CREATE PROPOSAL
  // --------------------------------------------------

  const {
    data: proposalId,
    error,
  } = await supabase.rpc(
    "propose_match_change",
    {
      p_match_id: input.matchId,
      p_proposing_team_id:
        input.proposingTeamId,
      p_match_date: input.matchDate,
      p_kick_off_time:
        input.kickOffTime,
      p_location:
        input.location.trim(),
    }
  );

  if (error) {
    console.error(
      "PROPOSE MATCH CHANGE ERROR:",
      error
    );

    return {
      error:
        error.message ||
        "The proposal could not be sent.",
    };
  }

  if (!proposalId) {
    return {
      error:
        "The proposal could not be created.",
    };
  }

  // --------------------------------------------------
// NOTIFY OPPOSING TEAM
// --------------------------------------------------

const {
  data: opponentCoaches,
  error: opponentCoachesError,
} = await supabase.rpc(
  "get_match_opponent_coaches",
  {
    p_match_id: input.matchId,
    p_my_team_id: input.proposingTeamId,
  }
);

if (opponentCoachesError) {
  console.error(
    "LOAD OPPONENT COACHES ERROR:",
    opponentCoachesError
  );
} else {
  const clubName =
    proposingClub?.name ??
    proposingTeam?.name ??
    "Your opponent";

  for (const coach of opponentCoaches ?? []) {
    // Do not notify the person who submitted it,
    // even if they happen to belong to both teams.
    if (coach.coach_id === user.id) {
      continue;
    }

    try {
      await createNotification({
        userId: coach.coach_id,
        title: "Match change proposed",
        message: `${clubName} proposed a change to your match.`,
        type: "match_change_proposed",
        relatedId: input.matchId,
      });
    } catch (notificationError) {
      console.error(
        "MATCH CHANGE NOTIFICATION ERROR:",
        notificationError
      );
    }
  }
}

  // --------------------------------------------------
  // REFRESH MATCH DATA
  // --------------------------------------------------

  revalidatePath(
    `/matches/${input.matchId}`
  );

  revalidatePath("/matches");
  revalidatePath("/dashboard");

  return {
    error: null,
    proposalId,
  };
}
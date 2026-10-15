"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/services/notification.service";

type RespondToMatchChangeInput = {
  matchId: string;
  changeRequestId: string;
  response: "accepted" | "declined";
};

export async function respondToMatchChangeAction(
  input: RespondToMatchChangeInput
): Promise<{
  error: string | null;
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
    !input.changeRequestId ||
    !["accepted", "declined"].includes(
      input.response
    )
  ) {
    return {
      error: "Invalid match change response.",
    };
  }

  // --------------------------------------------------
  // LOAD PENDING PROPOSAL
  // --------------------------------------------------

  const {
    data: pendingChanges,
    error: pendingChangeError,
  } = await supabase.rpc(
    "get_pending_match_change",
    {
      p_match_id: input.matchId,
    }
  );

  if (pendingChangeError) {
    console.error(
      "LOAD MATCH CHANGE ERROR:",
      pendingChangeError
    );

    return {
      error:
        "The match change could not be loaded.",
    };
  }

  const pendingChange =
    pendingChanges?.find(
      (change) =>
        change.id === input.changeRequestId
    ) ?? null;

  if (!pendingChange) {
    return {
      error:
        "This match change is no longer pending.",
    };
  }

  // --------------------------------------------------
  // RESPOND
  // --------------------------------------------------

  const { error } = await supabase.rpc(
    "respond_to_match_change",
    {
      p_change_request_id:
        input.changeRequestId,
      p_response: input.response,
    }
  );

  if (error) {
    console.error(
      "RESPOND TO MATCH CHANGE ERROR:",
      error
    );

    return {
      error:
        error.message ||
        "The match change could not be processed.",
    };
  }

  // --------------------------------------------------
  // NOTIFY PROPOSER
  // --------------------------------------------------

  // Never notify the same user who responded.
  if (
    pendingChange.proposed_by &&
    pendingChange.proposed_by !== user.id
  ) {
    try {
      const accepted =
        input.response === "accepted";

      await createNotification({
        userId: pendingChange.proposed_by,
        title: accepted
          ? "Match change accepted"
          : "Match change declined",
        message: accepted
          ? "Your opponent accepted the proposed match changes."
          : "Your opponent declined the proposed match changes.",
        type: accepted
          ? "match_change_accepted"
          : "match_change_declined",
        relatedId: input.matchId,
      });
    } catch (notificationError) {
      console.error(
        "MATCH CHANGE RESPONSE NOTIFICATION ERROR:",
        notificationError
      );
    }
  }

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  revalidatePath(
    `/matches/${input.matchId}`
  );

  revalidatePath("/matches/upcoming");
  revalidatePath("/notifications");
  revalidatePath("/dashboard");

  return {
    error: null,
  };
}

type CancelMatchInput = {
  matchId: string;
  cancellingTeamId: string;
};

export async function cancelMatchAction(
  input: CancelMatchInput
): Promise<{
  error: string | null;
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

  if (!input.matchId || !input.cancellingTeamId) {
    return {
      error: "Invalid match.",
    };
  }

  // --------------------------------------------------
  // LOAD MATCH
  // Used for the cancelling club name
  // --------------------------------------------------

  const { data: match, error: matchError } =
    await supabase
      .from("matches")
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_team:teams!matches_home_team_id_fkey (
          id,
          name,
          club:clubs (
            id,
            name
          )
        ),
        away_team:teams!matches_away_team_id_fkey (
          id,
          name,
          club:clubs (
            id,
            name
          )
        )
      `)
      .eq("id", input.matchId)
      .single();

  if (matchError || !match) {
    console.error(
      "LOAD MATCH FOR CANCELLATION ERROR:",
      matchError
    );

    return {
      error: "The match could not be loaded.",
    };
  }

  // --------------------------------------------------
  // FIND OPPONENT COACHES
  // Do this before cancellation.
  // --------------------------------------------------

  const {
    data: opponentCoaches,
    error: opponentCoachesError,
  } = await supabase.rpc(
    "get_match_opponent_coaches",
    {
      p_match_id: input.matchId,
      p_my_team_id: input.cancellingTeamId,
    }
  );

  if (opponentCoachesError) {
    console.error(
      "LOAD OPPONENT COACHES ERROR:",
      opponentCoachesError
    );

    return {
      error: "The opponent could not be loaded.",
    };
  }

  // --------------------------------------------------
  // CANCEL MATCH
  // --------------------------------------------------

  const { error } = await supabase.rpc(
    "cancel_match",
    {
      p_match_id: input.matchId,
      p_cancelling_team_id:
        input.cancellingTeamId,
    }
  );

  if (error) {
    console.error(
      "CANCEL MATCH ERROR:",
      error
    );

    return {
      error:
        error.message ||
        "The match could not be cancelled.",
    };
  }

  // --------------------------------------------------
  // CANCELLING CLUB NAME
  // --------------------------------------------------

  const cancellingTeam =
  match.home_team_id === input.cancellingTeamId
    ? Array.isArray(match.home_team)
      ? match.home_team[0]
      : match.home_team
    : Array.isArray(match.away_team)
      ? match.away_team[0]
      : match.away_team;

const cancellingClub = Array.isArray(
  cancellingTeam?.club
)
  ? cancellingTeam.club[0]
  : cancellingTeam?.club;

const clubName =
  cancellingClub?.name ??
  cancellingTeam?.name ??
  "Your opponent";

  // --------------------------------------------------
  // NOTIFY OPPONENT
  // Best effort — cancellation remains successful
  // even if a notification fails.
  // --------------------------------------------------

  for (const coach of opponentCoaches ?? []) {
    if (coach.coach_id === user.id) {
      continue;
    }

    try {
      await createNotification({
        userId: coach.coach_id,
        title: "Match cancelled",
        message: `${clubName} cancelled your match.`,
        type: "match_cancelled",
        relatedId: input.matchId,
      });
    } catch (notificationError) {
      console.error(
        "MATCH CANCELLATION NOTIFICATION ERROR:",
        notificationError
      );
    }
  }

  // --------------------------------------------------
  // REFRESH
  // --------------------------------------------------

  revalidatePath(`/matches/${input.matchId}`);
  revalidatePath("/matches/upcoming");
  revalidatePath("/notifications");
  revalidatePath("/dashboard");

  return {
    error: null,
  };
}
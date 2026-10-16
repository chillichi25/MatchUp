"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/services/notification.service";

type SubmitMatchResultInput = {
  matchId: string;
  submittingTeamId: string;
  homeScore: number;
  awayScore: number;
};

export async function submitMatchResultAction(
  input: SubmitMatchResultInput
): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in.",
    };
  }

  if (
    !input.matchId ||
    !input.submittingTeamId ||
    !Number.isInteger(input.homeScore) ||
    !Number.isInteger(input.awayScore) ||
    input.homeScore < 0 ||
    input.awayScore < 0
  ) {
    return {
      error: "Please enter a valid score.",
    };
  }

  // --------------------------------------------------
  // SUBMIT RESULT
  // --------------------------------------------------

  const { error } = await supabase.rpc(
    "submit_match_result",
    {
      p_match_id: input.matchId,
      p_submitting_team_id:
        input.submittingTeamId,
      p_home_score: input.homeScore,
      p_away_score: input.awayScore,
    }
  );

  if (error) {
    console.error(
      "SUBMIT MATCH RESULT ERROR:",
      error
    );

    return {
      error:
        error.message ||
        "The result could not be submitted.",
    };
  }

  // --------------------------------------------------
  // GET OPPONENT COACHES
  // --------------------------------------------------

  const {
    data: opponentCoaches,
    error: opponentCoachesError,
  } = await supabase.rpc(
    "get_match_opponent_coaches",
    {
      p_match_id: input.matchId,
      p_my_team_id:
        input.submittingTeamId,
    }
  );

  if (opponentCoachesError) {
    console.error(
      "RESULT OPPONENT COACHES ERROR:",
      opponentCoachesError
    );
  } else {
    // --------------------------------------------------
    // NOTIFY OPPONENT
    // Best effort — result remains submitted even if
    // notification creation fails.
    // --------------------------------------------------

    for (
      const coach of
      opponentCoaches ?? []
    ) {
      if (
        !coach.coach_id ||
        coach.coach_id === user.id
      ) {
        continue;
      }

      try {
        await createNotification({
          userId: coach.coach_id,
          title: "Result submitted",
          message: `Your opponent submitted a ${input.homeScore}–${input.awayScore} result for your match.`,
          type: "match_result_submitted",
          relatedId: input.matchId,
        });
      } catch (
        notificationError
      ) {
        console.error(
          "RESULT SUBMITTED NOTIFICATION ERROR:",
          notificationError
        );
      }
    }
  }

  revalidatePath(
    `/matches/${input.matchId}`
  );
  revalidatePath(
    "/matches/upcoming"
  );
  revalidatePath(
    "/notifications"
  );
  revalidatePath("/dashboard");

  return {
    error: null,
  };
}
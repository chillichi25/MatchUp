"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/services/notification.service";

type RespondToMatchResultInput = {
  matchId: string;
  resultRequestId: string;
  response: "accepted" | "declined";
};

export async function respondToMatchResultAction(
  input: RespondToMatchResultInput
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
    !input.resultRequestId
  ) {
    return {
      error: "Invalid result request.",
    };
  }

  // --------------------------------------------------
  // LOAD PENDING RESULT BEFORE RESPONDING
  // --------------------------------------------------

  const {
    data: pendingResults,
    error: pendingResultError,
  } = await supabase.rpc(
    "get_pending_match_result",
    {
      p_match_id: input.matchId,
    }
  );

  if (pendingResultError) {
    console.error(
      "LOAD PENDING RESULT ERROR:",
      pendingResultError
    );

    return {
      error:
        "Unable to load the submitted result.",
    };
  }

  const pendingResult =
    pendingResults?.find(
      (result) =>
        result.id ===
        input.resultRequestId
    ) ?? null;

  if (!pendingResult) {
    return {
      error:
        "This result is no longer awaiting confirmation.",
    };
  }

  // --------------------------------------------------
  // RESPOND
  // --------------------------------------------------

  const { error } = await supabase.rpc(
    "respond_to_match_result",
    {
      p_result_request_id:
        input.resultRequestId,
      p_response: input.response,
    }
  );

  if (error) {
    console.error(
      "RESPOND TO MATCH RESULT ERROR:",
      error
    );

    return {
      error:
        error.message ||
        "The result could not be updated.",
    };
  }

  // --------------------------------------------------
  // NOTIFY THE COACH WHO SUBMITTED THE RESULT
  // Best effort only
  // --------------------------------------------------

  if (
    pendingResult.submitted_by &&
    pendingResult.submitted_by !==
      user.id
  ) {
    try {
      const confirmed =
        input.response === "accepted";

      await createNotification({
        userId:
          pendingResult.submitted_by,

        title: confirmed
          ? "Result confirmed"
          : "Result disputed",

        message: confirmed
          ? `Your opponent confirmed the ${pendingResult.home_score}–${pendingResult.away_score} result.`
          : `Your opponent disputed the ${pendingResult.home_score}–${pendingResult.away_score} result.`,

        type: confirmed
          ? "match_result_confirmed"
          : "match_result_disputed",

        relatedId: input.matchId,
      });
    } catch (
      notificationError
    ) {
      console.error(
        "MATCH RESULT RESPONSE NOTIFICATION ERROR:",
        notificationError
      );
    }
  }

  revalidatePath(
    `/matches/${input.matchId}`
  );
  revalidatePath(
    "/matches/upcoming"
  );
  revalidatePath(
    "/matches/history"
  );
  revalidatePath(
    "/notifications"
  );
  revalidatePath("/dashboard");

  return {
    error: null,
  };
}
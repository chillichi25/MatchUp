"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type AffectedRequest = {
  requested_by: string;
  previous_status: string;
};

export async function cancelTournament(
  tournamentId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Not authenticated."
    );
  }

  // --------------------------------------------------
  // TOURNAMENT
  // --------------------------------------------------

  const {
    data: tournament,
    error: tournamentError,
  } = await supabase
    .from("tournaments")
    .select(`
      id,
      name,
      created_by,
      status
    `)
    .eq("id", tournamentId)
    .maybeSingle();

  if (
    tournamentError ||
    !tournament
  ) {
    throw new Error(
      "Tournament not found."
    );
  }

  if (
    tournament.created_by !==
    user.id
  ) {
    throw new Error(
      "You cannot cancel this tournament."
    );
  }

  if (
    tournament.status ===
    "cancelled"
  ) {
    return {
      success: true,
    };
  }

  // --------------------------------------------------
  // CANCEL TOURNAMENT + ACTIVE REQUESTS
  // --------------------------------------------------

  const {
    data: affectedRequests,
    error: cancelError,
  } = await supabase.rpc(
    "cancel_tournament_with_requests",
    {
      p_tournament_id:
        tournamentId,
    }
  );

  if (cancelError) {
    console.error(
      "Cancel tournament RPC error:",
      cancelError
    );

    throw new Error(
      cancelError.message
    );
  }

  const affected =
    (affectedRequests ??
      []) as AffectedRequest[];

  // --------------------------------------------------
  // UNIQUE COACHES
  // --------------------------------------------------

  const recipientIds = [
    ...new Set(
      affected
        .map(
          (request) =>
            request.requested_by
        )
        .filter(Boolean)
    ),
  ].filter(
    (recipientId) =>
      recipientId !== user.id
  );

  // --------------------------------------------------
  // NOTIFY AFFECTED COACHES
  // --------------------------------------------------

  if (
    recipientIds.length > 0
  ) {
    const notifications =
      recipientIds.map(
        (recipientId) => ({
          user_id:
            recipientId,

          title:
            "Tournament cancelled",

          message:
            `${tournament.name} has been cancelled by the organiser.`,

          type:
            "tournament",

          related_id:
            tournament.id,

          is_read:
            false,
        })
      );

    const {
      error: notificationError,
    } = await supabase
      .from("notifications")
      .insert(
        notifications
      );

    if (
      notificationError
    ) {
      console.error(
        "Tournament cancellation notification error:",
        notificationError
      );
    }
  }

  // --------------------------------------------------
  // REVALIDATE
  // --------------------------------------------------

  revalidatePath(
    `/tournaments/${tournamentId}`
  );

  revalidatePath(
    `/tournaments/${tournamentId}/manage`
  );

  revalidatePath(
    `/tournaments/${tournamentId}/manage/teams`
  );

  revalidatePath(
    "/tournaments/requests"
  );

  revalidatePath(
    "/matches"
  );

  revalidatePath(
    "/notifications"
  );

  return {
    success: true,
    affectedCoaches:
      recipientIds.length,
  };
}
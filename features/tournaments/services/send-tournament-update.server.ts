"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type SendTournamentUpdateInput = {
  tournamentId: string;
  message: string;
};

export async function sendTournamentUpdate({
  tournamentId,
  message,
}: SendTournamentUpdateInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const cleanMessage = message.trim();

  if (!cleanMessage) {
    throw new Error(
      "Please enter a message."
    );
  }

  if (cleanMessage.length > 500) {
    throw new Error(
      "Message cannot be longer than 500 characters."
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
      created_by
    `)
    .eq("id", tournamentId)
    .maybeSingle();

  if (
    tournamentError ||
    !tournament
  ) {
    console.error(
      "Tournament update lookup error:",
      tournamentError
    );

    throw new Error(
      "Tournament not found."
    );
  }

  if (
    tournament.created_by !== user.id
  ) {
    throw new Error(
      "You cannot send updates for this tournament."
    );
  }

  // --------------------------------------------------
  // ACCEPTED PARTICIPANTS ONLY
  // --------------------------------------------------

  const {
    data: participants,
    error: participantsError,
  } = await supabase
    .from("tournament_requests")
    .select(`
      id,
      requested_by
    `)
    .eq(
      "tournament_id",
      tournamentId
    )
    .eq(
      "status",
      "accepted"
    );

  if (participantsError) {
    console.error(
      "Tournament participants lookup error:",
      participantsError
    );

    throw new Error(
      "Unable to load participating teams."
    );
  }

  if (
    !participants ||
    participants.length === 0
  ) {
    throw new Error(
      "There are no participating teams to message."
    );
  }

  // --------------------------------------------------
  // UNIQUE COACH RECIPIENTS
  // --------------------------------------------------

  const recipientIds = [
    ...new Set(
      participants
        .map(
          (participant) =>
            participant.requested_by
        )
        .filter(Boolean)
    ),
  ];

  const recipients =
    recipientIds.filter(
      (recipientId) =>
        recipientId !== user.id
    );

  if (recipients.length === 0) {
    throw new Error(
      "There are no participating coaches to message."
    );
  }

  // --------------------------------------------------
  // CREATE TOURNAMENT UPDATE
  // --------------------------------------------------

  const {
    data: tournamentUpdate,
    error: updateError,
  } = await supabase
    .from("tournament_updates")
    .insert({
      tournament_id:
        tournament.id,

      created_by:
        user.id,

      message:
        cleanMessage,
    })
    .select(`
      id,
      tournament_id,
      message,
      created_at
    `)
    .single();

  if (
    updateError ||
    !tournamentUpdate
  ) {
    console.error(
      "Create tournament update error:",
      updateError
    );

    throw new Error(
      "Unable to create tournament update."
    );
  }

  // --------------------------------------------------
  // CREATE PARTICIPANT NOTIFICATIONS
  // --------------------------------------------------

  const notifications =
    recipients.map(
      (recipientId) => ({
        user_id:
          recipientId,

        title:
          `${tournament.name} update`,

        message:
          cleanMessage,

        type:
          "tournament_update",

        related_id:
          tournamentUpdate.id,

        is_read:
          false,
      })
    );

  const {
  error: notificationError,
} = await supabase
  .from("notifications")
  .insert(notifications);

if (notificationError) {
  console.error(
    "Tournament update notification error:",
    notificationError
  );

  throw new Error(
    "Unable to send tournament update."
  );
}


  // --------------------------------------------------
  // REVALIDATE
  // --------------------------------------------------

  revalidatePath(
    "/notifications"
  );

  revalidatePath(
    `/tournaments/${tournament.id}`
  );

  return {
    success: true,
    recipients:
      recipients.length,

    updateId:
      tournamentUpdate.id,
  };
}
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function removeTournamentParticipant(
  requestId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("tournament_requests")
    .select(`
      id,
      status,
      requested_by,
      tournament_id,

      tournaments (
        id,
        name,
        created_by
      )
    `)
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !request) {
    throw new Error(
      "Tournament participant not found."
    );
  }

  const tournament =
    Array.isArray(request.tournaments)
      ? request.tournaments[0]
      : request.tournaments;

  if (!tournament) {
    throw new Error(
      "Tournament not found."
    );
  }

  if (
    tournament.created_by !==
    user.id
  ) {
    throw new Error(
      "You cannot remove teams from this tournament."
    );
  }

  if (
    request.status !==
    "accepted"
  ) {
    throw new Error(
      "This team is not currently participating."
    );
  }

  const { error: updateError } =
    await supabase
      .from("tournament_requests")
      .update({
        status: "removed",
        responded_at:
          new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("status", "accepted");

  if (updateError) {
    throw new Error(
      updateError.message
    );
  }

  await supabase
    .from("notifications")
    .insert({
      user_id:
        request.requested_by,
      title:
        "Tournament entry removed",
      message: `Your team is no longer participating in ${tournament.name}.`,
      type: "tournament",
      related_id:
        tournament.id,
      is_read: false,
    });

  revalidatePath(
    `/tournaments/${tournament.id}`
  );

  revalidatePath(
    `/tournaments/${tournament.id}/manage`
  );

  revalidatePath(
    `/tournaments/${tournament.id}/manage/teams`
  );

  revalidatePath(
    "/tournaments/requests"
  );

  return {
    success: true,
  };
}
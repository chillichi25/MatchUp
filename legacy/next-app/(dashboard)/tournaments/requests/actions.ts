"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function acceptTournamentRequestAction(
  formData: FormData
) {
  const requestId = formData.get("requestId");

  if (typeof requestId !== "string") {
    throw new Error("Invalid tournament request.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: request, error: requestError } =
    await supabase
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
    console.error(
      "Tournament request lookup error:",
      requestError
    );

    throw new Error(
      "Tournament request not found."
    );
  }

  const tournament = Array.isArray(
    request.tournaments
  )
    ? request.tournaments[0]
    : request.tournaments;

  if (!tournament) {
    throw new Error("Tournament not found.");
  }

  if (tournament.created_by !== user.id) {
    throw new Error(
      "You cannot respond to this request."
    );
  }

  if (request.status !== "pending") {
    return;
  }

  const { error: acceptError } =
  await supabase.rpc(
    "accept_tournament_request",
    {
      p_request_id: requestId,
    }
  );

if (acceptError) {
  console.error(
    "Accept tournament request RPC error:",
    acceptError
  );

  if (
    acceptError.message.includes(
      "This tournament is full"
    )
  ) {
    return {
      success: false,
      message:
        "This tournament is full. No more teams can be accepted.",
    };
  }

  return {
    success: false,
    message:
      "Unable to accept this request. Please try again.",
  };
}

  // Notify requesting coach
  const { error: notificationError } =
    await supabase
      .from("notifications")
      .insert({
        user_id: request.requested_by,
        title: "Tournament request accepted",
        message: `Your request to join ${tournament.name} has been accepted.`,
        type: "tournament",
        related_id: tournament.id,
        is_read: false,
      });

  if (notificationError) {
    console.error(
      "Accepted tournament notification error:",
      notificationError
    );
  }

  revalidatePath("/tournaments/requests");
  revalidatePath("/matches");
  revalidatePath(
    `/tournaments/${tournament.id}`
  );
return {
    success: true,
    message: "Tournament request accepted.",
  };
}

export async function declineTournamentRequestAction(
  formData: FormData
) {
  const requestId = formData.get("requestId");

  if (typeof requestId !== "string") {
    throw new Error("Invalid tournament request.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: request, error: requestError } =
    await supabase
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
    console.error(
      "Tournament request lookup error:",
      requestError
    );

    throw new Error(
      "Tournament request not found."
    );
  }

  const tournament = Array.isArray(
    request.tournaments
  )
    ? request.tournaments[0]
    : request.tournaments;

  if (!tournament) {
    throw new Error("Tournament not found.");
  }

  if (tournament.created_by !== user.id) {
    throw new Error(
      "You cannot respond to this request."
    );
  }

  if (request.status !== "pending") {
  return {
    success: false,
    message: "This request has already been responded to.",
  };
}

  const { error } = await supabase
    .from("tournament_requests")
    .update({
      status: "declined",
      responded_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    console.error(
      "Decline tournament request error:",
      error
    );

    throw new Error(error.message);
  }

  // Notify requesting coach
  const { error: notificationError } =
    await supabase
      .from("notifications")
      .insert({
        user_id: request.requested_by,
        title: "Tournament request declined",
        message: `Your request to join ${tournament.name} was declined.`,
        type: "tournament",
        related_id: tournament.id,
        is_read: false,
      });

  if (notificationError) {
    console.error(
      "Declined tournament notification error:",
      notificationError
    );
  }

  revalidatePath("/tournaments/requests");
  revalidatePath("/matches");
  revalidatePath(
    `/tournaments/${tournament.id}`
  );
}
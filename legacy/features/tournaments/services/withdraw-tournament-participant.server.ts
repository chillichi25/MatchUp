"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function withdrawTournamentParticipant(
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
      "Tournament entry not found."
    );
  }

  if (request.requested_by !== user.id) {
    throw new Error(
      "You cannot withdraw this team."
    );
  }

  if (request.status !== "accepted") {
    throw new Error(
      "This team is not currently participating."
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

  const {
  data: withdrawnRequest,
  error: withdrawError,
} = await supabase.rpc(
  "withdraw_tournament_request",
  {
    p_request_id: request.id,
  }
);

if (withdrawError) {
  console.error(
    "Tournament withdrawal RPC error:",
    withdrawError
  );

  throw new Error(
    withdrawError.message
  );
}

if (!withdrawnRequest) {
  throw new Error(
    "Unable to withdraw from this tournament."
  );
}

  const {
    error: notificationError,
  } = await supabase
    .from("notifications")
    .insert({
      user_id:
        tournament.created_by,

      title:
        "Team withdrawn from tournament",

      message:
        `A team has withdrawn from ${tournament.name}.`,

      type:
        "tournament",

      related_id:
        tournament.id,

      is_read:
        false,
    });

  if (notificationError) {
    console.error(
      "Tournament withdrawal notification error:",
      notificationError
    );
  }

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
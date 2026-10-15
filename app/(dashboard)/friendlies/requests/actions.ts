"use server";

import { revalidatePath } from "next/cache";
import { cancelOutgoingFriendlyRequest } from "@/features/friendlies/services/outgoing-requests.service";

import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/services/notification.service";

export async function declineFriendlyRequestAction(
  formData: FormData
) {
  const requestId = formData.get("requestId");

  if (typeof requestId !== "string") {
    throw new Error("Invalid request ID.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  // --------------------------------------------------
  // LOAD REQUEST
  // --------------------------------------------------

  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("friendly_requests")
    .select(`
      id,
      requested_by,
      status,

      friendlies!inner (
        id,
        created_by,

        teams (
          id,

          clubs (
            id,
            name
          )
        )
      )
    `)
    .eq("id", requestId)
    .maybeSingle();

  if (requestError) {
    console.error(
      "Load friendly request error:",
      requestError
    );

    throw new Error(
      "The friendly request could not be loaded."
    );
  }

  if (!request) {
    throw new Error(
      "Friendly request not found."
    );
  }

  const friendly = Array.isArray(
    request.friendlies
  )
    ? request.friendlies[0]
    : request.friendlies;

  if (!friendly) {
    throw new Error("Friendly not found.");
  }

  // Only the coach who owns the friendly
  // should be able to decline the request.
  if (friendly.created_by !== user.id) {
    throw new Error(
      "You cannot decline this friendly request."
    );
  }

  if (request.status !== "pending") {
    throw new Error(
      "This friendly request has already been responded to."
    );
  }

  // --------------------------------------------------
  // DECLINE REQUEST
  // --------------------------------------------------

  const { error: declineError } =
    await supabase
      .from("friendly_requests")
      .update({
        status: "declined",
        responded_at:
          new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("status", "pending");

  if (declineError) {
    console.error(
      "Decline friendly request error:",
      declineError
    );

    throw new Error(
      declineError.message
    );
  }

  // --------------------------------------------------
  // FRIENDLY OWNER'S CLUB
  // --------------------------------------------------

  const friendlyTeam = Array.isArray(
    friendly.teams
  )
    ? friendly.teams[0]
    : friendly.teams;

  const friendlyClub = Array.isArray(
    friendlyTeam?.clubs
  )
    ? friendlyTeam.clubs[0]
    : friendlyTeam?.clubs;

  // --------------------------------------------------
  // NOTIFY REQUESTING COACH
  // --------------------------------------------------

  try {
    await createNotification({
      userId: request.requested_by,
      title: "Friendly request declined",
      message: `${
        friendlyClub?.name ?? "The other team"
      } declined your friendly request.`,
      type: "friendly_declined",
      relatedId: request.id,
    });
  } catch (notificationError) {
    console.error(
      "Decline notification failed:",
      notificationError
    );
  }

  // --------------------------------------------------
  // REVALIDATE
  // --------------------------------------------------

  revalidatePath(
    `/friendlies/requests/${requestId}`
  );

  revalidatePath(
    "/friendlies/requests"
  );

  revalidatePath(
    "/friendlies/sent"
  );

  revalidatePath(
    "/friendlies"
  );

  revalidatePath(
    "/notifications"
  );

  revalidatePath(
    "/dashboard"
  );
}

export async function cancelFriendlyRequestAction(
  formData: FormData
) {
  const requestId = formData.get("requestId");

  if (
    typeof requestId !== "string" ||
    !requestId.trim()
  ) {
    throw new Error("Invalid request ID.");
  }

  await cancelOutgoingFriendlyRequest(
    requestId
  );

  revalidatePath(
    `/friendlies/requests/${requestId}`
  );

  revalidatePath(
    "/friendlies/requests"
  );

  revalidatePath(
    "/friendlies/sent"
  );

  revalidatePath(
    "/friendlies"
  );

  revalidatePath(
    "/dashboard"
  );
}
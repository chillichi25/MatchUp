"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { cancelFriendly } from "@/features/friendlies/services/cancel-friendly.service";
import { createNotification } from "@/features/notifications/services/notification.service";

export async function cancelFriendlyAction(
  formData: FormData
) {
  const friendlyId = formData.get("friendlyId");

  if (
    typeof friendlyId !== "string" ||
    !friendlyId.trim()
  ) {
    throw new Error("Invalid friendly ID.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  // --------------------------------------------------
  // LOAD FRIENDLY + PENDING REQUESTS
  // --------------------------------------------------

  const {
    data: friendly,
    error: friendlyError,
  } = await supabase
    .from("friendlies")
    .select(`
      id,
      created_by,
      match_date,
      status,

      teams (
        id,

        clubs (
          id,
          name
        )
      ),

      friendly_requests (
        id,
        requested_by,
        status
      )
    `)
    .eq("id", friendlyId)
    .maybeSingle();

  if (friendlyError) {
    console.error(
      "LOAD FRIENDLY BEFORE CANCELLATION ERROR:",
      friendlyError
    );

    throw new Error(
      "The friendly could not be loaded."
    );
  }

  if (!friendly) {
    throw new Error("Friendly not found.");
  }

  if (friendly.created_by !== user.id) {
    throw new Error(
      "You cannot cancel this friendly."
    );
  }

  if (friendly.status !== "open") {
    throw new Error(
      "Only open friendlies can be cancelled."
    );
  }

  // --------------------------------------------------
  // GET FRIENDLY OWNER'S CLUB
  // --------------------------------------------------

  const team = Array.isArray(friendly.teams)
    ? friendly.teams[0]
    : friendly.teams;

  const club = Array.isArray(team?.clubs)
    ? team.clubs[0]
    : team?.clubs;

  // --------------------------------------------------
  // REMEMBER PENDING REQUESTS BEFORE CANCELLATION
  // --------------------------------------------------

  const allRequests =
    friendly.friendly_requests ?? [];

  const pendingRequests = allRequests.filter(
    (request) => request.status === "pending"
  );

  // --------------------------------------------------
  // CANCEL FRIENDLY
  // --------------------------------------------------

  await cancelFriendly(friendlyId);

  // --------------------------------------------------
  // NOTIFY AFFECTED COACHES
  // --------------------------------------------------

  for (const request of pendingRequests) {
    try {
      await createNotification({
        userId: request.requested_by,
        title: "Friendly cancelled",
        message: `${
          club?.name ?? "The other team"
        } cancelled the friendly on ${new Intl.DateTimeFormat(
          "en-GB",
          {
            day: "numeric",
            month: "long",
          }
        ).format(
          new Date(
            `${friendly.match_date}T00:00:00`
          )
        )}.`,
        type: "friendly_cancelled",
        relatedId: request.id,
      });
    } catch (notificationError) {
      console.error(
        "FRIENDLY CANCELLATION NOTIFICATION ERROR:",
        notificationError
      );
    }
  }

  // --------------------------------------------------
  // REVALIDATE
  // --------------------------------------------------

  revalidatePath(`/friendlies/${friendlyId}`);
  revalidatePath("/friendlies");
  revalidatePath("/friendlies/requests");
  revalidatePath("/friendlies/sent");
  revalidatePath("/matches");
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
}

export type UpdateFriendlyActionInput = {
  friendlyId: string;
  matchDate: string;
  kickOffTime: string;
  venueType: "home" | "away" | "either";
  matchFormat: "3v3" | "5v5" | "7v7" | "9v9" | "11v11";
  location: string;
  notes?: string;
};

export async function updateFriendlyAction(
  input: UpdateFriendlyActionInput
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be logged in to edit a friendly.",
    };
  }

  const friendlyId = input.friendlyId.trim();
  const location = input.location.trim();
  const notes = input.notes?.trim() || null;

  if (
    !friendlyId ||
    !input.matchDate ||
    !input.kickOffTime ||
    !location
  ) {
    return {
      error:
        "Please enter the date, kick-off time and location.",
    };
  }

  // --------------------------------------------------
// PREVENT PAST FRIENDLY DATE / TIME
// --------------------------------------------------

const now = new Date();

const londonDate =
  new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(now);

const londonTime =
  new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ).format(now);

const isPast =
  input.matchDate < londonDate ||
  (
    input.matchDate === londonDate &&
    input.kickOffTime <= londonTime
  );

if (isPast) {
  return {
    error:
      "Please choose a future date and kick-off time.",
  };
}

  // --------------------------------------------------
  // LOAD CURRENT FRIENDLY + PENDING REQUESTS
  // --------------------------------------------------

  const {
    data: friendly,
    error: friendlyError,
  } = await supabase
    .from("friendlies")
    .select(`
      id,
      created_by,
      match_date,
      kick_off_time,
      venue_type,
      match_format,
      location,
      notes,
      status,

      teams (
        id,

        clubs (
          id,
          name
        )
      ),

      friendly_requests (
        id,
        requested_by,
        status
      )
    `)
    .eq("id", friendlyId)
    .maybeSingle();

  if (friendlyError) {
    console.error(
      "LOAD FRIENDLY BEFORE UPDATE ERROR:",
      friendlyError
    );

    return {
      error: "The friendly could not be loaded.",
    };
  }

  if (!friendly) {
    return {
      error: "Friendly not found.",
    };
  }

  if (friendly.created_by !== user.id) {
    return {
      error: "You cannot edit this friendly.",
    };
  }

  if (friendly.status !== "open") {
    return {
      error: "Only open friendlies can be edited.",
    };
  }

  // --------------------------------------------------
  // WORK OUT WHAT ACTUALLY CHANGED
  // --------------------------------------------------

  const changedFields: string[] = [];

  if (friendly.match_date !== input.matchDate) {
    changedFields.push("date");
  }

  if (
    friendly.kick_off_time?.slice(0, 5) !==
    input.kickOffTime.slice(0, 5)
  ) {
    changedFields.push("kick-off time");
  }

  if (friendly.venue_type !== input.venueType) {
    changedFields.push("venue");
  }

  if (friendly.match_format !== input.matchFormat) {
    changedFields.push("match format");
  }

  if (friendly.location.trim() !== location) {
    changedFields.push("location");
  }

  if ((friendly.notes?.trim() || "") !== (notes || "")) {
    changedFields.push("notes");
  }

  // Nothing changed — no update and no notification.
  if (changedFields.length === 0) {
    return {
      error: null,
    };
  }

  // --------------------------------------------------
  // UPDATE FRIENDLY THROUGH SECURE RPC
  // --------------------------------------------------

  const { error: updateError } = await supabase.rpc(
    "update_friendly",
    {
      p_friendly_id: friendlyId,
      p_match_date: input.matchDate,
      p_kick_off_time: input.kickOffTime,
      p_venue_type: input.venueType,
      p_match_format: input.matchFormat,
      p_location: location,
      p_notes: notes,
    }
  );

  if (updateError) {
    console.error(
      "UPDATE FRIENDLY ERROR:",
      updateError
    );

    return {
      error: "We couldn't update this friendly.",
    };
  }

  // --------------------------------------------------
  // BUILD HUMAN-FRIENDLY CHANGE DESCRIPTION
  // --------------------------------------------------

  let changeDescription: string;

  if (changedFields.length === 1) {
    changeDescription = changedFields[0];
  } else if (changedFields.length === 2) {
    changeDescription =
      `${changedFields[0]} and ${changedFields[1]}`;
  } else {
    changeDescription = "friendly details";
  }

  // --------------------------------------------------
  // GET OWNER'S CLUB
  // --------------------------------------------------

  const team = Array.isArray(friendly.teams)
    ? friendly.teams[0]
    : friendly.teams;

  const club = Array.isArray(team?.clubs)
    ? team.clubs[0]
    : team?.clubs;

  // --------------------------------------------------
  // NOTIFY COACHES WITH PENDING REQUESTS
  // --------------------------------------------------

  const pendingRequests =
    friendly.friendly_requests?.filter(
      (request) => request.status === "pending"
    ) ?? [];

  for (const request of pendingRequests) {
    try {
      await createNotification({
        userId: request.requested_by,
        title: "Friendly updated",
        message: `${
          club?.name ?? "The other team"
        } changed the ${changeDescription} of a friendly you requested.`,
        type: "friendly_updated",
        relatedId: request.id,
      });
    } catch (notificationError) {
      console.error(
        "FRIENDLY UPDATE NOTIFICATION ERROR:",
        notificationError
      );
    }
  }

  // --------------------------------------------------
  // REVALIDATE
  // --------------------------------------------------

  revalidatePath(`/friendlies/${friendlyId}`);
  revalidatePath(`/friendlies/${friendlyId}/edit`);
  revalidatePath("/friendlies");
  revalidatePath("/friendlies/requests");
  revalidatePath("/friendlies/sent");
  revalidatePath("/notifications");
  revalidatePath("/dashboard");

  return {
    error: null,
  };
}
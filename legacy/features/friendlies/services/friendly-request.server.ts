"use server";

import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/features/notifications/services/notification.service";

type CreateFriendlyRequestInput = {
  friendlyId: string;
  requestingTeamId: string;
  message?: string;
};

export async function createFriendlyRequest(
  input: CreateFriendlyRequestInput,
) {
  const supabase = await createClient();

  console.log("1 - Supabase client created");

  // Logged-in coach
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  console.log("2 - User authenticated", user.id);

  // Load the friendly owner
  const { data: friendly } = await supabase
    .from("friendlies")
    .select("id, created_by")
    .eq("id", input.friendlyId)
    .single();

  if (!friendly) {
    throw new Error("Friendly not found");
  }

  console.log("3 - Friendly loaded", friendly);

  // Create request or re-request
const { data: requestId, error } = await supabase.rpc(
  "send_friendly_request",
  {
    p_friendly_id: input.friendlyId,
    p_requesting_team_id: input.requestingTeamId,
    p_message: input.message?.trim() || null,
  }
);

if (error) {
  console.error(
    "SEND FRIENDLY REQUEST ERROR:",
    error
  );

  // Friendly has passed / expired
  if (
    error.message?.includes(
      "already started or expired"
    ) ||
    error.message?.includes(
      "no longer open"
    )
  ) {
    throw new Error(
      "This friendly is no longer available."
    );
  }

  // Duplicate pending request
  if (
    error.message?.includes(
      "already has a pending request"
    )
  ) {
    throw new Error(
      "Your team has already requested this friendly."
    );
  }

  // Already accepted
  if (
    error.message?.includes(
      "already been accepted"
    )
  ) {
    throw new Error(
      "This friendly has already been matched."
    );
  }

  // Own friendly
  if (
    error.message?.includes(
      "cannot request your own friendly"
    )
  ) {
    throw new Error(
      "You cannot request your own friendly."
    );
  }

  // Safe fallback
  throw new Error(
    "We couldn't send your request. Please try again."
  );
}

if (!requestId) {
  throw new Error("The friendly request could not be created.");
}

console.log("4 - Friendly request sent", requestId);

  // Get requesting club
  const { data: team } = await supabase
    .from("teams")
    .select(`
      clubs (
        name
      )
    `)
    .eq("id", input.requestingTeamId)
    .single();

  if (!team) {
    throw new Error("Requesting team not found");
  }

  console.log("5 - Team loaded", team);

  const club = Array.isArray(team.clubs)
    ? team.clubs[0]
    : team.clubs;

  console.log("6 - About to create notification");

  try {
    await createNotification({
  userId: friendly.created_by,
  title: "New friendly request",
  message: `${club?.name ?? "A club"} has requested to play your friendly.`,
  type: "friendly_request",
  relatedId: requestId,
});

    console.log("7 - Notification created successfully");
  } catch (error) {
    console.error("Notification failed:", error);
  }

  console.log("8 - Finished");

  return {
  id: requestId,
};
}
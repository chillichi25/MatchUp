"use server";

import { createClient } from "@/lib/supabase/server";
import { createConversation } from "@/features/chat/services/create-conversation.server";
import { createNotification } from "@/features/notifications/services/notification.service";

export async function createMatchFromRequest(
  requestId: string,
) {
  const supabase = await createClient();

  const { data: request, error: requestError } =
  await supabase
    .from("friendly_requests")
    .select(`
      id,
      friendly_id,
      requesting_team_id,
      requested_by,

      friendlies (
        id,
        team_id,
        created_by,
        match_date,
        kick_off_time,
        location
      )
    `)
    .eq("id", requestId)
    .single();

  if (requestError) {
    throw requestError;
  }

  if (!request) {
    throw new Error("Request not found.");
  }

  const friendly = Array.isArray(request.friendlies)
    ? request.friendlies[0]
    : request.friendlies;

  if (!friendly) {
    throw new Error("Friendly not found.");
  }

  // Prevent duplicate matches
  const { data: existingMatch } = await supabase
    .from("matches")
    .select("id")
    .eq("friendly_id", friendly.id)
    .maybeSingle();

    const notifyRequester = async (matchId: string) => {
  await createNotification({
    userId: request.requested_by,
    title: "Friendly accepted",
    message: "Your friendly request has been accepted.",
    type: "friendly_accepted",
    relatedId: matchId,
  });
};

  if (existingMatch) {
  console.log("Match already exists:", existingMatch.id);

  await notifyRequester(existingMatch.id);

  return existingMatch;
}

  console.log("=== MATCH INSERT ===");
  console.log({
    friendly_id: friendly.id,
    friendly_request_id: request.id,
    home_team_id: friendly.team_id,
    away_team_id: request.requesting_team_id,
  });

  // Create the match
  const { data: match, error: matchError } =
    await supabase
      .from("matches")
      .insert({
        friendly_id: friendly.id,
        friendly_request_id: request.id,

        home_team_id: friendly.team_id,
        away_team_id: request.requesting_team_id,

        match_date: friendly.match_date,
        kick_off_time: friendly.kick_off_time,
        location: friendly.location,

        status: "scheduled",
        created_by: friendly.created_by,
      })
      .select()
      .single();

  if (matchError) {
    console.error("MATCH INSERT ERROR:", matchError);
    throw matchError;
  }

  console.log("Match created:", match.id);

  try {
    console.log("Creating conversation...");

const conversation = await createConversation(match.id);

console.log("Conversation created:", conversation);
  } catch (error) {
    console.error(
      "Conversation failed:",
      error,
    );
  }

await notifyRequester(match.id);

return match;
}
"use server";

import { createClient } from "@/lib/supabase/server";

export async function acceptFriendlyRequest(
  requestId: string,
) {
  const supabase = await createClient();

  // Get the requesting team's club name
  const { data: request, error: requestError } = await supabase
    .from("friendly_requests")
    .select(`
      requesting_team_id,
      teams!friendly_requests_requesting_team_id_fkey (
        id,
        name,
        clubs (
          name
        )
      )
    `)
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    console.error(requestError);
    throw new Error("Friendly request not found.");
  }

  const requestingTeam = Array.isArray(request.teams)
    ? request.teams[0]
    : request.teams;

  const requestingClub = Array.isArray(requestingTeam?.clubs)
    ? requestingTeam.clubs[0]
    : requestingTeam?.clubs;

  // Accept the request
  const { data, error } = await supabase.rpc(
    "accept_friendly_request",
    {
      p_request_id: requestId,
    },
  );

  if (error) {
    throw error;
  }

  // Update Coach A's original notification
  await supabase
    .from("notifications")
    .update({
      title: "Friendly request accepted",
      message: `You accepted ${requestingClub?.name ?? "the club"}'s request.`,
      type: "friendly_request_accepted",
      is_read: true,
    })
    .eq("type", "friendly_request")
    .eq("related_id", requestId);

  return data;
}
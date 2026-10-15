import { createClient } from "@/lib/supabase/server";

export async function getOutgoingFriendlyRequests() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  // --------------------------------------------------
// EXPIRE OVERDUE REQUESTS
// --------------------------------------------------

const {
  error: expiryError,
} = await supabase.rpc(
  "expire_friendly_requests"
);

if (expiryError) {
  console.error(
    "EXPIRE FRIENDLY REQUESTS ERROR:",
    expiryError
  );
}

  const { data, error } = await supabase
    .from("friendly_requests")
    .select(`
      id,
      message,
      status,
      created_at,
      responded_at,
      requesting_team_id,

      friendlies!friendly_requests_friendly_id_fkey (
        id,
        match_date,
        kick_off_time,
        location,
        status,

        teams!friendlies_team_id_fkey (
          id,
          name,

          clubs!teams_club_id_fkey (
            id,
            name,
            badge_url
          )
        )
      ),

      teams!friendly_requests_requesting_team_id_fkey (
        id,
        name,

        clubs!teams_club_id_fkey (
          id,
          name,
          badge_url
        )
      )
    `)
    .eq("requested_by", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET OUTGOING FRIENDLY REQUESTS ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return [];
  }

  return data ?? [];
}

export async function cancelOutgoingFriendlyRequest(
  requestId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to cancel a friendly request."
    );
  }

  const cleanRequestId = requestId.trim();

  if (!cleanRequestId) {
    throw new Error("A friendly request is required.");
  }

  const { error } = await supabase.rpc(
    "cancel_friendly_request",
    {
      p_request_id: cleanRequestId,
    }
  );

  if (error) {
    console.error(
      "CANCEL FRIENDLY REQUEST ERROR:",
      error
    );

    throw new Error(
      "We couldn't cancel this friendly request."
    );
  }

  return { success: true };
}

export async function getOutgoingFriendlyRequestHistory() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

// --------------------------------------------------
// EXPIRE OVERDUE REQUESTS
// --------------------------------------------------

const {
  error: expiryError,
} = await supabase.rpc(
  "expire_friendly_requests"
);

if (expiryError) {
  console.error(
    "EXPIRE FRIENDLY REQUESTS ERROR:",
    expiryError
  );
}

  const { data, error } = await supabase
    .from("friendly_requests")
    .select(`
      id,
      message,
      status,
      created_at,
      responded_at,
      requesting_team_id,

      friendlies!friendly_requests_friendly_id_fkey (
        id,
        match_date,
        kick_off_time,
        location,
        status,

        teams!friendlies_team_id_fkey (
          id,
          name,

          clubs!teams_club_id_fkey (
            id,
            name,
            badge_url
          )
        )
      ),

      teams!friendly_requests_requesting_team_id_fkey (
        id,
        name,

        clubs!teams_club_id_fkey (
          id,
          name,
          badge_url
        )
      )
    `)
    .eq("requested_by", user.id)
    .in("status", [
  "accepted",
  "declined",
  "cancelled",
  "expired",
])
    .order("responded_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error(
      "GET OUTGOING FRIENDLY REQUEST HISTORY ERROR:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }
    );

    return [];
  }

  return data ?? [];
}
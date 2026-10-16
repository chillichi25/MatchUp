import { createClient } from "@/lib/supabase/server";

export async function getIncomingRequests() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

    friendlies!inner (
      id,
      match_date,
      kick_off_time,
      location,
      created_by,

      teams (
        id,
        name,

        clubs (
          name,
          badge_url
        )
      )
    ),

    teams!friendly_requests_requesting_team_id_fkey (
      id,
      name,

      clubs (
        name,
        badge_url
      )
    )
  `)
  .eq("friendlies.created_by", user.id)
  .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data ?? [];
}

export async function getFriendlyRequestById(
  requestId: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
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

  const { data: request, error } = await supabase
    .from("friendly_requests")
    .select(`
      id,
      message,
      status,
      created_at,
      requested_by,

      friendlies (
        id,
        match_date,
        kick_off_time,
        location,
        created_by,
        status,

        teams (
  id,
  name,

  clubs (
    name,
    badge_url
  )
)
      ),

      teams!friendly_requests_requesting_team_id_fkey (
        id,
        name,

        clubs (
          name,
          badge_url
        )
      )
    `)
    .eq("id", requestId)
    .maybeSingle();

  if (error) {
  console.error("GET REQUEST ERROR:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  return null;
}

if (!request) {
  console.error("Friendly request not found:", requestId);
  return null;
}

  const friendly = Array.isArray(request.friendlies)
    ? request.friendlies[0]
    : request.friendlies;

  const isFriendlyOwner =
    friendly?.created_by === user.id;

  const isRequestingCoach =
    request.requested_by === user.id;

  if (!isFriendlyOwner && !isRequestingCoach) {
    return null;
  }

  return request;
}
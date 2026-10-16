import { supabase } from "@/lib/supabase/client";

import type {
  FriendlyRequestCounterparty,
  FriendlyRequestDetail,
  FriendlyRequestStatus,
  FriendlyRequestSummary,
  FriendlyStatus,
} from "../types";

type RawClub = { id: string; name: string; badge_url: string | null };

type RawTeam = {
  id: string;
  name: string;
  clubs: RawClub | RawClub[] | null;
};

type RawRequest = {
  id: string;
  message: string | null;
  status: string | null;
  created_at: string;
  requested_by: string | null;
  requesting_team_id: string | null;
  friendlies: RawFriendly | RawFriendly[] | null;
  teams: RawTeam | RawTeam[] | null;
};

type RawFriendly = {
  id: string;
  match_date: string;
  kick_off_time: string | null;
  location: string | null;
  status: string | null;
  created_by: string;
  teams: RawTeam | RawTeam[] | null;
};

const REQUEST_SELECT = `
  id,
  message,
  status,
  created_at,
  requested_by,
  requesting_team_id,

  friendlies!inner (
    id,
    match_date,
    kick_off_time,
    location,
    status,
    created_by,

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
`;

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toStatus(value: string | null): FriendlyRequestStatus {
  switch (value) {
    case "accepted":
    case "declined":
    case "cancelled":
    case "expired":
      return value;
    default:
      return "pending";
  }
}

function toFriendlyStatus(value: string | null): FriendlyStatus {
  return value === "matched" || value === "cancelled" ? value : "open";
}

function toCounterparty(team: RawTeam | null): FriendlyRequestCounterparty {
  const club = first(team?.clubs);

  return {
    teamId: team?.id ?? "",
    teamName: team?.name ?? "",
    clubName: club?.name ?? "",
    badgeUrl: club?.badge_url ?? null,
  };
}

function normalise(row: RawRequest): FriendlyRequestSummary | null {
  const friendly = first(row.friendlies);

  if (!friendly) {
    return null;
  }

  const hostTeam = first(friendly.teams);
  const requesterTeam = first(row.teams);

  return {
    id: row.id,
    status: toStatus(row.status),
    message: row.message,
    createdAt: row.created_at,

    friendlyId: friendly.id,
    matchDate: friendly.match_date,
    kickOff: friendly.kick_off_time,
    location: friendly.location,
    friendlyStatus: toFriendlyStatus(friendly.status),

    host: toCounterparty(hostTeam),
    requester: toCounterparty(requesterTeam),
  };
}

/* ------------------------------------------------------------------ */
/* Sending                                                             */
/* ------------------------------------------------------------------ */

export async function sendFriendlyRequest(input: {
  friendlyId: string;
  requestingTeamId: string;
  message?: string;
}): Promise<{ id: string }> {
  const { data, error } = await supabase.rpc("send_friendly_request", {
    p_friendly_id: input.friendlyId,
    p_requesting_team_id: input.requestingTeamId,
    p_message: input.message?.trim() || null,
  });

  if (error) {
    console.error("SEND FRIENDLY REQUEST ERROR:", error);

    const message = error.message ?? "";

    if (message.includes("already started or expired") || message.includes("no longer open")) {
      throw new Error("This friendly is no longer available.");
    }

    if (message.includes("already has a pending request")) {
      throw new Error("Your team has already requested this friendly.");
    }

    if (message.includes("already been accepted")) {
      throw new Error("This friendly has already been matched.");
    }

    if (message.includes("cannot request your own friendly")) {
      throw new Error("You cannot request your own friendly.");
    }

    throw new Error("We couldn't send your request. Please try again.");
  }

  if (!data) {
    throw new Error("The friendly request could not be created.");
  }

  return { id: data as string };
}

async function expireOverdueRequests(): Promise<void> {
  const { error } = await supabase.rpc("expire_friendly_requests");

  if (error) {
    console.error("EXPIRE FRIENDLY REQUESTS ERROR:", error);
  }
}

/* ------------------------------------------------------------------ */
/* Incoming (requests made against my team's friendlies)               */
/* ------------------------------------------------------------------ */

export async function getIncomingRequests(): Promise<FriendlyRequestSummary[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  await expireOverdueRequests();

  const { data, error } = await supabase
    .from("friendly_requests")
    .select(REQUEST_SELECT)
    .eq("friendlies.created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("INCOMING FRIENDLY REQUESTS ERROR:", error);
    return [];
  }

  return ((data ?? []) as unknown as RawRequest[])
    .map(normalise)
    .filter((row): row is FriendlyRequestSummary => row !== null);
}

/* ------------------------------------------------------------------ */
/* Outgoing (requests my team has sent)                                */
/* ------------------------------------------------------------------ */

async function loadOutgoing(statuses: string[]): Promise<FriendlyRequestSummary[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  await expireOverdueRequests();

  const { data, error } = await supabase
    .from("friendly_requests")
    .select(REQUEST_SELECT)
    .eq("requested_by", user.id)
    .in("status", statuses)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("OUTGOING FRIENDLY REQUESTS ERROR:", error);
    return [];
  }

  return ((data ?? []) as unknown as RawRequest[])
    .map(normalise)
    .filter((row): row is FriendlyRequestSummary => row !== null);
}

export function getOutgoingRequests(): Promise<FriendlyRequestSummary[]> {
  return loadOutgoing(["pending"]);
}

export function getOutgoingRequestHistory(): Promise<FriendlyRequestSummary[]> {
  return loadOutgoing(["accepted", "declined", "cancelled", "expired"]);
}

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

export async function getFriendlyRequestDetail(
  requestId: string
): Promise<FriendlyRequestDetail | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  await expireOverdueRequests();

  const { data, error } = await supabase
    .from("friendly_requests")
    .select(REQUEST_SELECT)
    .eq("id", requestId)
    .maybeSingle();

  if (error || !data) {
    console.error("FRIENDLY REQUEST DETAIL ERROR:", error);
    return null;
  }

  const row = data as unknown as RawRequest;
  const summary = normalise(row);
  const friendly = first(row.friendlies);

  if (!summary || !friendly) {
    return null;
  }

  const isRequester = row.requested_by === user.id;
  const isHost = friendly.created_by === user.id;

  if (!isRequester && !isHost) {
    return null;
  }

  let matchId: string | null = null;
  let conversationId: string | null = null;

  if (summary.status === "accepted") {
    const { data: match } = await supabase
      .from("matches")
      .select("id, match_conversations ( id )")
      .eq("friendly_request_id", requestId)
      .maybeSingle();

    if (match) {
      matchId = match.id;

      const conversation = first(
        match.match_conversations as { id: string } | { id: string }[] | null
      );

      conversationId = conversation?.id ?? null;
    }
  }

  return {
    ...summary,
    viewer: isRequester ? "requester" : "host",
    matchId,
    conversationId,
    acceptedMatchAvailable: Boolean(matchId),
  };
}

/* ------------------------------------------------------------------ */
/* Responding                                                          */
/* ------------------------------------------------------------------ */

export async function declineFriendlyRequest(requestId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { error } = await supabase
    .from("friendly_requests")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) {
    console.error("DECLINE FRIENDLY REQUEST ERROR:", error);
    throw new Error("The request could not be declined.");
  }
}

export async function withdrawFriendlyRequest(requestId: string): Promise<void> {
  const { error } = await supabase.rpc("cancel_friendly_request", {
    p_request_id: requestId.trim(),
  });

  if (error) {
    console.error("WITHDRAW FRIENDLY REQUEST ERROR:", error);
    throw new Error("We couldn't cancel this friendly request.");
  }
}

type RawFriendlyRow = {
  id: string;
  team_id: string | null;
  created_by: string;
  match_date: string;
  kick_off_time: string | null;
  location: string | null;
};

/**
 * Accepts a request and confirms the fixture.
 *
 * The trusted `accept_friendly_request` RPC flips the accepted request, closes
 * the listing and declines competing requests. It does not create the `matches`
 * row, so we mirror the legacy flow: resolve-or-insert the fixture afterwards
 * (keyed on `friendly_id` so retries do not duplicate it), then best-effort
 * create its conversation.
 */
export async function acceptFriendlyRequest(
  requestId: string
): Promise<{ matchId: string | null }> {
  const { data: request, error: requestError } = await supabase
    .from("friendly_requests")
    .select(
      `
      id,
      friendly_id,
      requesting_team_id,
      friendlies (
        id,
        team_id,
        created_by,
        match_date,
        kick_off_time,
        location
      )
    `
    )
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !request) {
    console.error("ACCEPT REQUEST LOAD ERROR:", requestError);
    throw new Error("Friendly request not found.");
  }

  const friendly = first(
    request.friendlies as RawFriendlyRow | RawFriendlyRow[] | null
  );

  if (!friendly) {
    throw new Error("Friendly not found.");
  }

  const { error: acceptError } = await supabase.rpc("accept_friendly_request", {
    p_request_id: requestId,
  });

  if (acceptError) {
    console.error("ACCEPT FRIENDLY REQUEST ERROR:", acceptError);
    throw new Error(acceptError.message || "The request could not be accepted.");
  }

  const { data: existing } = await supabase
    .from("matches")
    .select("id")
    .eq("friendly_id", friendly.id)
    .maybeSingle();

  if (existing) {
    return { matchId: existing.id };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      friendly_id: friendly.id,
      friendly_request_id: requestId,
      home_team_id: friendly.team_id,
      away_team_id: request.requesting_team_id,
      match_date: friendly.match_date,
      kick_off_time: friendly.kick_off_time,
      location: friendly.location,
      status: "scheduled",
      created_by: friendly.created_by,
    })
    .select("id")
    .maybeSingle();

  if (matchError || !match) {
    console.error("CREATE MATCH FROM REQUEST ERROR:", matchError);
    return { matchId: null };
  }

  const { error: conversationError } = await supabase
    .from("match_conversations")
    .insert({ match_id: match.id });

  if (conversationError) {
    console.error("CREATE CONVERSATION ERROR:", conversationError);
  }

  return { matchId: match.id };
}

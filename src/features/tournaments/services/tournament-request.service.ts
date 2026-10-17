import { supabase } from "@/lib/supabase/client";

import { createNotification } from "@/features/notifications/services/notification.service";
import { getActiveTeam } from "@/features/teams/services/active-team.service";
import { checkTournamentEligibility } from "@/features/tournaments/utils/eligibility";

import {
  toTournamentRequestStatus,
  toTournamentStatus,
} from "../constants";
import type {
  TournamentRequestCounterparty,
  TournamentRequestSummary,
} from "../types";

type RawClub = { id: string; name: string; badge_url: string | null };

type RawRequestTeam = {
  id: string;
  name: string;
  age_group: string | null;
  clubs: RawClub | RawClub[] | null;
};

type RawRequestTournament = {
  id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  created_by: string;
};

type RawRequest = {
  id: string;
  status: string | null;
  message: string | null;
  created_at: string;
  responded_at: string | null;
  tournament_id: string;
  requesting_team_id: string | null;
  requested_by: string | null;
  tournaments: RawRequestTournament | RawRequestTournament[] | null;
  teams: RawRequestTeam | RawRequestTeam[] | null;
};

const REQUEST_SELECT = `
  id,
  status,
  message,
  created_at,
  responded_at,
  tournament_id,
  requesting_team_id,
  requested_by,

  tournaments!inner (
    id,
    name,
    start_date,
    end_date,
    location,
    created_by
  ),

  teams!tournament_requests_requesting_team_id_fkey (
    id,
    name,
    age_group,

    clubs (
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

function toCounterparty(team: RawRequestTeam | null): TournamentRequestCounterparty {
  const club = first(team?.clubs);

  return {
    teamId: team?.id ?? "",
    teamName: team?.name ?? "",
    ageGroup: team?.age_group ?? null,
    clubId: club?.id ?? "",
    clubName: club?.name ?? "",
    badgeUrl: club?.badge_url ?? null,
  };
}

function normalise(row: RawRequest): TournamentRequestSummary | null {
  const tournament = first(row.tournaments);

  if (!tournament) {
    return null;
  }

  return {
    id: row.id,
    status: toTournamentRequestStatus(row.status),
    message: row.message,
    createdAt: row.created_at,
    respondedAt: row.responded_at,

    tournamentId: tournament.id,
    tournamentName: tournament.name,
    tournamentStartDate: tournament.start_date,
    tournamentEndDate: tournament.end_date,
    tournamentLocation: tournament.location,

    team: toCounterparty(first(row.teams)),
  };
}

/* ------------------------------------------------------------------ */
/* Sending                                                             */
/* ------------------------------------------------------------------ */

export async function sendTournamentRequest(input: {
  tournamentId: string;
  teamId: string;
  message?: string;
}): Promise<{ id: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const team = await getActiveTeam();

  if (!team || team.id !== input.teamId) {
    throw new Error("The selected team is not your active team.");
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select(
      "id, name, created_by, status, age_group, gender, match_format, max_teams"
    )
    .eq("id", input.tournamentId)
    .maybeSingle();

  if (tournamentError || !tournament) {
    throw new Error("This tournament could not be found.");
  }

  if (tournament.created_by === user.id) {
    throw new Error("You cannot request to join your own tournament.");
  }

  if (toTournamentStatus(tournament.status) !== "open") {
    throw new Error("This tournament is not accepting requests.");
  }

  const eligibility = checkTournamentEligibility({
    teamAgeGroup: team.age_group ?? null,
    tournamentAgeGroup: tournament.age_group,
    teamGender: team.gender ?? null,
    tournamentGender: tournament.gender,
  });

  if (!eligibility.eligible) {
    throw new Error(eligibility.reasons[0] ?? "Your team is not eligible.");
  }

  const { data: acceptedCount } = await supabase.rpc(
    "get_tournament_accepted_count",
    { p_tournament_id: input.tournamentId }
  );

  if (
    tournament.max_teams !== null &&
    tournament.max_teams !== undefined &&
    Number(acceptedCount ?? 0) >= tournament.max_teams
  ) {
    throw new Error("This tournament is full.");
  }

  const message = input.message?.trim() || null;

  const { data: existing } = await supabase
    .from("tournament_requests")
    .select("id, status")
    .eq("tournament_id", input.tournamentId)
    .eq("requesting_team_id", team.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "pending") {
      throw new Error("This team has already requested to join this tournament.");
    }

    if (existing.status === "accepted") {
      throw new Error("This team has already been accepted into this tournament.");
    }

    if (existing.status === "declined") {
      throw new Error("This team's previous request was declined.");
    }

    if (existing.status === "removed" || existing.status === "withdrawn") {
      const { data: reopened, error: reopenError } = await supabase.rpc(
        "reopen_removed_tournament_request",
        { p_request_id: existing.id, p_message: message }
      );

      if (reopenError || !reopened) {
        console.error("REOPEN TOURNAMENT REQUEST ERROR:", reopenError);
        throw new Error("We couldn't send your request. Please try again.");
      }

      const reopenedRow = (Array.isArray(reopened) ? reopened[0] : reopened) as {
        id: string;
      };

      await createNotification({
        userId: tournament.created_by,
        title: "New tournament request",
        message: `${team.clubs?.name ?? "A team"} has requested to join ${tournament.name}.`,
        type: "tournament_request",
        relatedId: reopenedRow.id,
      });

      return { id: reopenedRow.id };
    }
  }

  const { data: created, error: createError } = await supabase
    .from("tournament_requests")
    .insert({
      tournament_id: input.tournamentId,
      requesting_team_id: team.id,
      requested_by: user.id,
      message,
      status: "pending",
    })
    .select("id")
    .single();

  if (createError || !created) {
    console.error("CREATE TOURNAMENT REQUEST ERROR:", createError);
    throw new Error("We couldn't send your request. Please try again.");
  }

  await createNotification({
    userId: tournament.created_by,
    title: "New tournament request",
    message: `${team.clubs?.name ?? "A team"} has requested to join ${tournament.name}.`,
    type: "tournament_request",
    relatedId: created.id,
  });

  return { id: created.id };
}

/* ------------------------------------------------------------------ */
/* Lists                                                               */
/* ------------------------------------------------------------------ */

export async function getIncomingTournamentRequests(): Promise<
  TournamentRequestSummary[]
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("tournament_requests")
    .select(REQUEST_SELECT)
    .eq("tournaments.created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("INCOMING TOURNAMENT REQUESTS ERROR:", error);
    return [];
  }

  return ((data ?? []) as unknown as RawRequest[])
    .map(normalise)
    .filter((row): row is TournamentRequestSummary => row !== null);
}

export async function getOutgoingTournamentRequests(): Promise<
  TournamentRequestSummary[]
> {
  const team = await getActiveTeam();

  if (!team) {
    return [];
  }

  const { data, error } = await supabase
    .from("tournament_requests")
    .select(REQUEST_SELECT)
    .eq("requesting_team_id", team.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("OUTGOING TOURNAMENT REQUESTS ERROR:", error);
    return [];
  }

  return ((data ?? []) as unknown as RawRequest[])
    .map(normalise)
    .filter((row): row is TournamentRequestSummary => row !== null);
}

export async function getTournamentRequestDetail(
  requestId: string
): Promise<TournamentRequestSummary | null> {
  const { data, error } = await supabase
    .from("tournament_requests")
    .select(REQUEST_SELECT)
    .eq("id", requestId)
    .maybeSingle();

  if (error || !data) {
    console.error("TOURNAMENT REQUEST DETAIL ERROR:", error);
    return null;
  }

  return normalise(data as unknown as RawRequest);
}

/* ------------------------------------------------------------------ */
/* Responding (organiser)                                              */
/* ------------------------------------------------------------------ */

type OrganiserRequestRow = {
  id: string;
  status: string | null;
  requested_by: string | null;
  tournament_id: string;
  tournaments:
    | { id: string; name: string; created_by: string }
    | { id: string; name: string; created_by: string }[]
    | null;
};

async function loadOrganiserRequest(requestId: string): Promise<{
  row: OrganiserRequestRow;
  tournament: { id: string; name: string; created_by: string };
} | null> {
  const { data, error } = await supabase
    .from("tournament_requests")
    .select(
      `
      id,
      status,
      requested_by,
      tournament_id,

      tournaments (
        id,
        name,
        created_by
      )
    `
    )
    .eq("id", requestId)
    .maybeSingle();

  if (error || !data) {
    console.error("LOAD TOURNAMENT REQUEST ERROR:", error);
    return null;
  }

  const row = data as unknown as OrganiserRequestRow;
  const tournament = first(row.tournaments);

  if (!tournament) {
    return null;
  }

  return { row, tournament };
}

export async function acceptTournamentRequest(requestId: string): Promise<void> {
  const loaded = await loadOrganiserRequest(requestId);

  if (!loaded) {
    throw new Error("This request could not be found.");
  }

  const { error } = await supabase.rpc("accept_tournament_request", {
    p_request_id: requestId,
  });

  if (error) {
    console.error("ACCEPT TOURNAMENT REQUEST ERROR:", error);

    const message = error.message ?? "";

    if (message.toLowerCase().includes("full")) {
      throw new Error("This tournament is full. No more teams can be accepted.");
    }

    throw new Error("Unable to accept this request.");
  }

  if (loaded.row.requested_by) {
    await createNotification({
      userId: loaded.row.requested_by,
      title: "Tournament request accepted",
      message: `Your request to join ${loaded.tournament.name} has been accepted.`,
      type: "tournament",
      relatedId: loaded.tournament.id,
    });
  }
}

export async function declineTournamentRequest(requestId: string): Promise<void> {
  const loaded = await loadOrganiserRequest(requestId);

  if (!loaded) {
    throw new Error("This request could not be found.");
  }

  const { error } = await supabase
    .from("tournament_requests")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) {
    console.error("DECLINE TOURNAMENT REQUEST ERROR:", error);
    throw new Error("Unable to decline this request.");
  }

  if (loaded.row.requested_by) {
    await createNotification({
      userId: loaded.row.requested_by,
      title: "Tournament request declined",
      message: `Your request to join ${loaded.tournament.name} was declined.`,
      type: "tournament",
      relatedId: loaded.tournament.id,
    });
  }
}

/* ------------------------------------------------------------------ */
/* Withdraw / remove                                                   */
/* ------------------------------------------------------------------ */

export async function withdrawTournamentParticipant(
  requestId: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loaded = await loadOrganiserRequest(requestId);

  if (!loaded || !user) {
    throw new Error("This request could not be found.");
  }

  if (loaded.row.requested_by !== user.id) {
    throw new Error("You cannot withdraw this tournament entry.");
  }

  if (loaded.row.status !== "accepted") {
    throw new Error("Only accepted entries can be withdrawn.");
  }

  const { error } = await supabase.rpc("withdraw_tournament_request", {
    p_request_id: requestId,
  });

  if (error) {
    console.error("WITHDRAW TOURNAMENT REQUEST ERROR:", error);
    throw new Error("Unable to withdraw from this tournament.");
  }

  await createNotification({
    userId: loaded.tournament.created_by,
    title: "Team withdrawn from tournament",
    message: `A team has withdrawn from ${loaded.tournament.name}.`,
    type: "tournament",
    relatedId: loaded.tournament.id,
  });
}

export async function removeTournamentParticipant(
  requestId: string
): Promise<void> {
  const loaded = await loadOrganiserRequest(requestId);

  if (!loaded) {
    throw new Error("This request could not be found.");
  }

  if (loaded.row.status !== "accepted") {
    throw new Error("Only accepted teams can be removed.");
  }

  const { error } = await supabase
    .from("tournament_requests")
    .update({ status: "removed", responded_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "accepted");

  if (error) {
    console.error("REMOVE TOURNAMENT PARTICIPANT ERROR:", error);
    throw new Error("Unable to remove this team.");
  }

  if (loaded.row.requested_by) {
    await createNotification({
      userId: loaded.row.requested_by,
      title: "Tournament entry removed",
      message: `Your team is no longer participating in ${loaded.tournament.name}.`,
      type: "tournament",
      relatedId: loaded.tournament.id,
    });
  }
}

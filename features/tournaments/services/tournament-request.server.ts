"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";
import { checkTournamentEligibility } from "@/features/tournaments/services/tournament-eligibility.service";

type CreateTournamentRequestInput = {
  tournamentId: string;
  teamId: string;
  message?: string;
};

export async function createTournamentRequest({
  tournamentId,
  teamId,
  message,
}: CreateTournamentRequestInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // --------------------------------------------------
  // ACTIVE TEAM
  // --------------------------------------------------

  const activeTeam = await getActiveTeam();

  if (!activeTeam) {
    throw new Error("No active team selected.");
  }

  if (activeTeam.id !== teamId) {
    throw new Error(
      "The selected team is not your active team."
    );
  }

  // --------------------------------------------------
  // TOURNAMENT
  // --------------------------------------------------

  const {
  data: tournament,
  error: tournamentError,
} = await supabase
  .from("tournaments")
  .select(`
    id,
    name,
    created_by,
    status,
    age_group,
    gender,
    match_format,
    max_teams
  `)
  .eq("id", tournamentId)
  .single();

  if (tournamentError || !tournament) {
    console.error(
      "Tournament lookup error:",
      tournamentError
    );

    throw new Error(
      "Tournament not found."
    );
  }

  if (tournament.created_by === user.id) {
    throw new Error(
      "You cannot request to join your own tournament."
    );
  }

  if (tournament.status !== "open") {
    throw new Error(
      "This tournament is not accepting requests."
    );
  }

  // --------------------------------------------------
// ELIGIBILITY
// --------------------------------------------------

const eligibility =
  checkTournamentEligibility({
    teamAgeGroup:
      activeTeam.age_group,

    teamGender:
      activeTeam.gender,

    teamMatchFormat:
      activeTeam.match_format,

    tournamentAgeGroup:
      tournament.age_group,

    tournamentGender:
      tournament.gender,

    tournamentMatchFormat:
      tournament.match_format,
  });

if (!eligibility.eligible) {
  throw new Error(
    eligibility.reasons.join(" ")
  );
}

// --------------------------------------------------
// CAPACITY
// --------------------------------------------------

if (tournament.max_teams !== null) {
  const {
    data: acceptedTeamsCount,
    error: acceptedTeamsCountError,
  } = await supabase.rpc(
    "get_tournament_accepted_count",
    {
      p_tournament_id:
        tournament.id,
    }
  );

  if (acceptedTeamsCountError) {
    console.error(
      "Tournament capacity check error:",
      acceptedTeamsCountError
    );

    throw new Error(
      "Unable to check tournament capacity."
    );
  }

  const acceptedTeams =
    acceptedTeamsCount ?? 0;

  if (
    acceptedTeams >=
    tournament.max_teams
  ) {
    throw new Error(
      "This tournament is full."
    );
  }
}

  // --------------------------------------------------
  // REQUESTING TEAM + CLUB
  // --------------------------------------------------

  const {
    data: team,
    error: teamError,
  } = await supabase
    .from("teams")
    .select(`
      id,
      name,

      clubs (
        name
      )
    `)
    .eq("id", activeTeam.id)
    .single();

  if (teamError || !team) {
    console.error(
      "Team lookup error:",
      teamError
    );

    throw new Error(
      "Team not found."
    );
  }

  const club =
    Array.isArray(team.clubs)
      ? team.clubs[0]
      : team.clubs;

  // --------------------------------------------------
  // PREVENT DUPLICATE REQUEST
  // --------------------------------------------------

  const {
    data: existingRequest,
    error: existingRequestError,
  } = await supabase
    .from("tournament_requests")
    .select(`
      id,
      status
    `)
    .eq(
      "tournament_id",
      tournamentId
    )
    .eq(
      "requesting_team_id",
      activeTeam.id
    )
    .maybeSingle();

  if (existingRequestError) {
    console.error(
      "Tournament existing request lookup error:",
      existingRequestError
    );

    throw new Error(
      "Unable to check existing request."
    );
  }

  if (existingRequest) {
  if (existingRequest.status === "pending") {
    throw new Error(
      "This team has already requested to join this tournament."
    );
  }

  if (existingRequest.status === "accepted") {
    throw new Error(
      "This team has already been accepted into this tournament."
    );
  }

  if (existingRequest.status === "declined") {
    throw new Error(
      "This team's previous request was declined."
    );
  }

  if (
  existingRequest.status === "removed" ||
  existingRequest.status === "withdrawn"
) {
    const {
  data: reopenedRequest,
  error: reopenError,
} = await supabase.rpc(
  "reopen_removed_tournament_request",
  {
    p_request_id: existingRequest.id,
    p_message:
      message?.trim() || null,
  }
);

if (reopenError) {
  console.error(
    "Reopen tournament request error:",
    reopenError
  );

  throw new Error(
    reopenError.message
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
          "New tournament request",

        message: `${
          club?.name ?? "A team"
        } has requested to join ${
          tournament.name
        }.`,

        type:
          "tournament_request",

        related_id:
          reopenedRequest.id,

        is_read:
          false,
      });

    if (notificationError) {
      console.error(
        "Tournament request notification error:",
        notificationError
      );
    }

    return reopenedRequest;
  }
}

  // --------------------------------------------------
  // CREATE REQUEST
  // --------------------------------------------------

  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("tournament_requests")
    .insert({
      tournament_id:
        tournamentId,

      requesting_team_id:
        activeTeam.id,

      requested_by:
        user.id,

      message:
        message?.trim() ||
        null,

      status:
        "pending",
    })
    .select()
    .single();

  if (requestError) {
    console.error(
      "Tournament request error:",
      requestError
    );

    throw requestError;
  }

  // --------------------------------------------------
  // NOTIFY TOURNAMENT ORGANISER
  // --------------------------------------------------

  const {
    error: notificationError,
  } = await supabase
    .from("notifications")
    .insert({
      user_id:
        tournament.created_by,

      title:
        "New tournament request",

      message: `${
        club?.name ?? "A team"
      } has requested to join ${
        tournament.name
      }.`,

      type:
        "tournament_request",

      related_id:
        request.id,

      is_read:
        false,
    });

  if (notificationError) {
    console.error(
      "Tournament request notification error:",
      notificationError
    );
  }

  return request;
}
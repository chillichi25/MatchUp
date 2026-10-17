import { supabase } from "@/lib/supabase/client";

import { searchLocations } from "@/features/clubs/services/location.service";
import { createNotification } from "@/features/notifications/services/notification.service";
import { checkTournamentEligibility } from "@/features/tournaments/utils/eligibility";
import { isPastSlot } from "@/features/matches/utils/match-time";

import { toTournamentStatus } from "../constants";
import type {
  CreateTournamentInput,
  TournamentUpdate,
  UpdateTournamentInput,
} from "../types";

type RawParticipantTeam = {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  match_format: string | null;
};

type RawParticipantRow = {
  id: string;
  teams: RawParticipantTeam | RawParticipantTeam[] | null;
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

async function geocode(location: string): Promise<{
  lat: number;
  lng: number;
} | null> {
  try {
    const results = await searchLocations(location);
    const match = results[0];

    if (!match) {
      return null;
    }

    return { lat: match.lat, lng: match.lng };
  } catch (error) {
    console.error("TOURNAMENT GEOCODE ERROR:", error);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Create                                                              */
/* ------------------------------------------------------------------ */

export async function createTournament(
  input: CreateTournamentInput
): Promise<{ id: string }> {
  if (
    !input.name.trim() ||
    !input.ageGroup ||
    !input.gender ||
    !input.level ||
    !input.matchFormat
  ) {
    throw new Error("Please complete all tournament details.");
  }

  if (!input.startDate) {
    throw new Error("Please select a tournament date.");
  }

  if (!input.startTime || !input.endTime) {
    throw new Error("Please select the tournament start and end times.");
  }

  if (!input.location.trim()) {
    throw new Error("Please enter the tournament location.");
  }

  const entryFee = Number(input.entryFee);

  if (
    input.entryFee.trim() === "" ||
    !Number.isFinite(entryFee) ||
    entryFee < 0
  ) {
    throw new Error("Please enter a valid entry fee.");
  }

  const maxTeams = Number(input.maxTeams);

  if (!Number.isInteger(maxTeams) || maxTeams < 2) {
    throw new Error("Please enter at least two teams.");
  }

  if (isPastSlot(input.startDate, input.startTime)) {
    throw new Error("Please choose a future tournament start date and time.");
  }

  if (input.endDate && input.endDate < input.startDate) {
    throw new Error("The end date must be on or after the start date.");
  }

  const finalEndDate = input.endDate || input.startDate;

  if (
    finalEndDate === input.startDate &&
    input.endTime <= input.startTime
  ) {
    throw new Error("The end time must be after the start time.");
  }

  const { data, error } = await supabase.rpc("create_tournament", {
    p_name: input.name.trim(),
    p_age_group: input.ageGroup,
    p_gender: input.gender,
    p_level: input.level,
    p_match_format: input.matchFormat,
    p_start_date: input.startDate,
    p_start_time: input.startTime,
    p_end_date: finalEndDate,
    p_end_time: input.endTime,
    p_location: input.location.trim(),
    p_entry_fee: input.entryFee,
    p_max_teams: input.maxTeams,
    p_description: input.description?.trim() || null,
  });

  if (error) {
    console.error("CREATE TOURNAMENT ERROR:", error);
    throw new Error(error.message || "The tournament could not be published.");
  }

  const created = (Array.isArray(data) ? data[0] : data) as { id: string } | null;

  if (!created?.id) {
    throw new Error("The tournament could not be published.");
  }

  const coordinates = await geocode(input.location.trim());

  if (coordinates) {
    const { error: geoError } = await supabase.rpc(
      "set_tournament_geo_location",
      {
        p_tournament_id: created.id,
        p_lat: coordinates.lat,
        p_lng: coordinates.lng,
      }
    );

    if (geoError) {
      console.error("SET TOURNAMENT GEO ERROR:", geoError);
    }
  }

  return { id: created.id };
}

/* ------------------------------------------------------------------ */
/* Update                                                              */
/* ------------------------------------------------------------------ */

async function loadParticipants(tournamentId: string): Promise<
  RawParticipantTeam[]
> {
  const { data, error } = await supabase
    .from("tournament_requests")
    .select(
      `
      id,

      teams!tournament_requests_requesting_team_id_fkey (
        id,
        name,
        age_group,
        gender,
        level,
        match_format
      )
    `
    )
    .eq("tournament_id", tournamentId)
    .eq("status", "accepted");

  if (error) {
    console.error("LOAD TOURNAMENT PARTICIPANTS ERROR:", error);
    return [];
  }

  return ((data ?? []) as unknown as RawParticipantRow[])
    .map((row) => first(row.teams))
    .filter((team): team is RawParticipantTeam => team !== null);
}

export async function updateTournament(
  input: UpdateTournamentInput
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  if (!input.name.trim() || !input.startDate || !input.startTime || !input.endTime) {
    throw new Error("Please complete the required tournament details.");
  }

  if (!input.location.trim()) {
    throw new Error("Please enter the tournament location.");
  }

  const maxTeams = Number(input.maxTeams);

  if (!Number.isInteger(maxTeams) || maxTeams < 2) {
    throw new Error("Please enter at least two teams.");
  }

  const { data: tournament, error: loadError } = await supabase
    .from("tournaments")
    .select(
      "id, created_by, age_group, gender, level, match_format, max_teams, status"
    )
    .eq("id", input.tournamentId)
    .maybeSingle();

  if (loadError || !tournament) {
    throw new Error("This tournament could not be found.");
  }

  if (tournament.created_by !== user.id) {
    throw new Error("You cannot edit this tournament.");
  }

  const eligibilityChanged =
    tournament.age_group !== input.ageGroup ||
    tournament.gender !== input.gender ||
    tournament.level !== input.level ||
    tournament.match_format !== input.matchFormat;

  const capacityChanged = tournament.max_teams !== maxTeams;

  if (eligibilityChanged || capacityChanged) {
    const participants = await loadParticipants(input.tournamentId);

    if (capacityChanged && maxTeams < participants.length) {
      throw new Error(
        `You cannot reduce the maximum teams to ${maxTeams}. This tournament already has ${participants.length} participating ${
          participants.length === 1 ? "team" : "teams"
        }.`
      );
    }

    if (eligibilityChanged) {
      for (const participant of participants) {
        const check = checkTournamentEligibility({
          teamAgeGroup: participant.age_group,
          tournamentAgeGroup: input.ageGroup,
          teamGender: participant.gender,
          tournamentGender: input.gender,
          teamLevel: participant.level,
          tournamentLevel: input.level,
          enforceLevel: true,
        });

        if (!check.eligible) {
          throw new Error(
            `${participant.name} no longer meets the new eligibility rules. ${check.reasons.join(
              " "
            )}`
          );
        }
      }
    }
  }

  const finalEndDate = input.endDate || input.startDate;

  if (input.endDate && input.endDate < input.startDate) {
    throw new Error("The end date must be on or after the start date.");
  }

  if (
    finalEndDate === input.startDate &&
    input.endTime <= input.startTime
  ) {
    throw new Error("The end time must be after the start time.");
  }

  const { error: updateError } = await supabase
    .from("tournaments")
    .update({
      name: input.name.trim(),
      age_group: input.ageGroup,
      gender: input.gender,
      level: input.level,
      match_format: input.matchFormat,
      start_date: input.startDate,
      start_time: input.startTime,
      end_date: finalEndDate,
      end_time: input.endTime,
      location: input.location.trim(),
      entry_fee: input.entryFee,
      max_teams: input.maxTeams,
      description: input.description?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.tournamentId);

  if (updateError) {
    console.error("UPDATE TOURNAMENT ERROR:", updateError);
    throw new Error("We couldn't update this tournament.");
  }

  const coordinates = await geocode(input.location.trim());

  if (coordinates) {
    const { error: geoError } = await supabase.rpc(
      "set_tournament_geo_location",
      {
        p_tournament_id: input.tournamentId,
        p_lat: coordinates.lat,
        p_lng: coordinates.lng,
      }
    );

    if (geoError) {
      console.error("SET TOURNAMENT GEO ERROR:", geoError);
    }
  } else {
    const { error: clearError } = await supabase.rpc(
      "clear_tournament_geo_location",
      { p_tournament_id: input.tournamentId }
    );

    if (clearError) {
      console.error("CLEAR TOURNAMENT GEO ERROR:", clearError);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Status / cancel / complete                                          */
/* ------------------------------------------------------------------ */

export async function setTournamentStatus(
  tournamentId: string,
  status: "open" | "closed"
): Promise<void> {
  const { error } = await supabase
    .from("tournaments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", tournamentId);

  if (error) {
    console.error("SET TOURNAMENT STATUS ERROR:", error);
    throw new Error("We couldn't update the tournament status.");
  }
}

export async function cancelTournament(tournamentId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournament, error: loadError } = await supabase
    .from("tournaments")
    .select("id, name, created_by, status")
    .eq("id", tournamentId)
    .maybeSingle();

  if (loadError || !tournament) {
    throw new Error("This tournament could not be found.");
  }

  if (tournament.created_by !== user?.id) {
    throw new Error("You cannot cancel this tournament.");
  }

  if (toTournamentStatus(tournament.status) === "cancelled") {
    return;
  }

  const { data, error } = await supabase.rpc("cancel_tournament_with_requests", {
    p_tournament_id: tournamentId,
  });

  if (error) {
    console.error("CANCEL TOURNAMENT ERROR:", error);
    throw new Error("We couldn't cancel this tournament.");
  }

  const affected = (data ?? []) as {
    requested_by: string;
    previous_status: string;
  }[];

  const notified = new Set<string>();

  for (const row of affected) {
    if (!row.requested_by || row.requested_by === user?.id) {
      continue;
    }

    if (notified.has(row.requested_by)) {
      continue;
    }

    notified.add(row.requested_by);

    await createNotification({
      userId: row.requested_by,
      title: "Tournament cancelled",
      message: `${tournament.name} has been cancelled by the organiser.`,
      type: "tournament",
      relatedId: tournament.id,
    });
  }
}

export async function completeTournament(tournamentId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournament, error: loadError } = await supabase
    .from("tournaments")
    .select("id, created_by, status")
    .eq("id", tournamentId)
    .maybeSingle();

  if (loadError || !tournament) {
    throw new Error("This tournament could not be found.");
  }

  if (tournament.created_by !== user?.id) {
    throw new Error("You cannot complete this tournament.");
  }

  const status = toTournamentStatus(tournament.status);

  if (status === "cancelled") {
    throw new Error("A cancelled tournament cannot be completed.");
  }

  if (status === "completed") {
    return;
  }

  const { error } = await supabase
    .from("tournaments")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", tournamentId);

  if (error) {
    console.error("COMPLETE TOURNAMENT ERROR:", error);
    throw new Error("We couldn't complete this tournament.");
  }
}

/* ------------------------------------------------------------------ */
/* Updates                                                             */
/* ------------------------------------------------------------------ */

export async function sendTournamentUpdate(input: {
  tournamentId: string;
  message: string;
}): Promise<{ recipients: number }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const message = input.message.trim();

  if (!message) {
    throw new Error("Please enter a message.");
  }

  if (message.length > 500) {
    throw new Error("Message cannot be longer than 500 characters.");
  }

  const { data: tournament, error: loadError } = await supabase
    .from("tournaments")
    .select("id, name, created_by")
    .eq("id", input.tournamentId)
    .maybeSingle();

  if (loadError || !tournament) {
    throw new Error("This tournament could not be found.");
  }

  if (tournament.created_by !== user.id) {
    throw new Error("You cannot message the participants of this tournament.");
  }

  const { data: participants } = await supabase
    .from("tournament_requests")
    .select("id, requested_by")
    .eq("tournament_id", input.tournamentId)
    .eq("status", "accepted");

  const recipients = Array.from(
    new Set(
      ((participants ?? []) as { requested_by: string | null }[])
        .map((row) => row.requested_by)
        .filter((id): id is string => Boolean(id) && id !== user.id)
    )
  );

  if (recipients.length === 0) {
    throw new Error("There are no participating teams to message.");
  }

  const { data: created, error: insertError } = await supabase
    .from("tournament_updates")
    .insert({
      tournament_id: input.tournamentId,
      created_by: user.id,
      message,
    })
    .select("id")
    .single();

  if (insertError || !created) {
    console.error("CREATE TOURNAMENT UPDATE ERROR:", insertError);
    throw new Error("Unable to send tournament update.");
  }

  for (const userId of recipients) {
    await createNotification({
      userId,
      title: `${tournament.name} update`,
      message,
      type: "tournament_update",
      relatedId: created.id,
    });
  }

  return { recipients: recipients.length };
}

export async function getTournamentUpdates(
  tournamentId: string
): Promise<TournamentUpdate[]> {
  const { data, error } = await supabase
    .from("tournament_updates")
    .select("id, message, created_at")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("TOURNAMENT UPDATES ERROR:", error);
    return [];
  }

  return ((data ?? []) as { id: string; message: string; created_at: string }[]).map(
    (row) => ({
      id: row.id,
      message: row.message,
      createdAt: row.created_at,
    })
  );
}

export type TournamentUpdateDetail = {
  id: string;
  message: string;
  createdAt: string;
  tournamentId: string;
  tournamentName: string;
  tournamentStartDate: string;
  tournamentLocation: string | null;
};

export async function getTournamentUpdateDetail(
  updateId: string
): Promise<TournamentUpdateDetail | null> {
  const { data, error } = await supabase
    .from("tournament_updates")
    .select(
      `
      id,
      message,
      created_at,
      tournament_id,

      tournaments (
        id,
        name,
        age_group,
        start_date,
        location
      )
    `
    )
    .eq("id", updateId)
    .maybeSingle();

  if (error || !data) {
    console.error("TOURNAMENT UPDATE DETAIL ERROR:", error);
    return null;
  }

  const row = data as unknown as {
    id: string;
    message: string;
    created_at: string;
    tournament_id: string;
    tournaments:
      | {
          id: string;
          name: string;
          start_date: string;
          location: string | null;
        }
      | {
          id: string;
          name: string;
          start_date: string;
          location: string | null;
        }[]
      | null;
  };

  const tournament = first(row.tournaments);

  if (!tournament) {
    return null;
  }

  return {
    id: row.id,
    message: row.message,
    createdAt: row.created_at,
    tournamentId: tournament.id,
    tournamentName: tournament.name,
    tournamentStartDate: tournament.start_date,
    tournamentLocation: tournament.location,
  };
}

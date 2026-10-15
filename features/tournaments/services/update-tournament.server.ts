"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { geocodeLocation } from "@/features/tournaments/services/geocode-location.server";

import { checkTournamentEligibility } from "@/features/tournaments/services/tournament-eligibility.service";

type UpdateTournamentInput = {
  tournamentId: string;
  name: string;
  ageGroup: string;
  gender: string;
  level: string;
  matchFormat: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime: string;
  location: string;
  entryFee?: string;
  maxTeams?: string;
  description?: string;
};

export async function updateTournament({
  tournamentId,
  name,
  ageGroup,
  gender,
  level,
  matchFormat,
  startDate,
  startTime,
  endDate,
  endTime,
  location,
  entryFee,
  maxTeams,
  description,
}: UpdateTournamentInput) {
  const supabase =
    await createClient();

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Not authenticated."
    );
  }

  // --------------------------------------------------
  // BASIC VALIDATION
  // --------------------------------------------------

  if (!name.trim()) {
    throw new Error(
      "Tournament name is required."
    );
  }

  if (!startDate) {
    throw new Error(
      "Start date is required."
    );
  }

  if (!startTime) {
  throw new Error(
    "Start time is required."
  );
}

if (!endTime) {
  throw new Error(
    "End time is required."
  );
}

  if (!location.trim()) {
    throw new Error(
      "Location is required."
    );
  }

  if (
    endDate &&
    new Date(endDate) <
      new Date(startDate)
  ) {
    throw new Error(
      "End date cannot be before start date."
    );
  }

  const finalEndDate =
  endDate || startDate;

if (
  finalEndDate === startDate &&
  endTime <= startTime
) {
  throw new Error(
    "End time must be after start time."
  );
}

  const parsedMaxTeams =
    maxTeams
      ? Number(maxTeams)
      : null;

  if (
    parsedMaxTeams !== null &&
    (!Number.isFinite(
      parsedMaxTeams
    ) ||
      parsedMaxTeams < 2)
  ) {
    throw new Error(
      "Maximum teams must be at least 2."
    );
  }

  // --------------------------------------------------
  // LOAD CURRENT TOURNAMENT
  // --------------------------------------------------

  const {
    data: tournament,
    error: tournamentError,
  } = await supabase
    .from("tournaments")
    .select(`
      id,
      created_by,
      age_group,
      gender,
      level,
      match_format,
      max_teams
    `)
    .eq(
      "id",
      tournamentId
    )
    .maybeSingle();

  if (
    tournamentError ||
    !tournament
  ) {
    console.error(
      "Tournament lookup error:",
      tournamentError
    );

    throw new Error(
      "Tournament not found."
    );
  }

  if (
    tournament.created_by !==
    user.id
  ) {
    throw new Error(
      "You cannot edit this tournament."
    );
  }

  // --------------------------------------------------
  // WHAT ACTUALLY CHANGED?
  // --------------------------------------------------

  const eligibilityRulesChanged =
    tournament.age_group !==
      ageGroup ||
    tournament.gender !==
      gender ||
    tournament.level !==
      level ||
    tournament.match_format !==
      matchFormat;

  const capacityChanged =
    tournament.max_teams !==
    parsedMaxTeams;

  // --------------------------------------------------
  // ONLY LOAD PARTICIPANTS WHEN NEEDED
  // --------------------------------------------------

  let participants: any[] = [];

  if (
    eligibilityRulesChanged ||
    capacityChanged
  ) {
    const {
      data: acceptedRequests,
      error:
        acceptedRequestsError,
    } = await supabase
      .from(
        "tournament_requests"
      )
      .select(`
        id,

        teams!tournament_requests_requesting_team_id_fkey (
          id,
          name,
          age_group,
          gender,
          level,
          match_format,

          clubs (
            id,
            name
          )
        )
      `)
      .eq(
        "tournament_id",
        tournamentId
      )
      .eq(
        "status",
        "accepted"
      );

    if (
      acceptedRequestsError
    ) {
      console.error(
        "Tournament participant validation error:",
        acceptedRequestsError
      );

      throw new Error(
        "Unable to validate participating teams."
      );
    }

    participants =
      acceptedRequests ?? [];
  }

  // --------------------------------------------------
  // CAPACITY VALIDATION
  // --------------------------------------------------

  if (
    capacityChanged &&
    parsedMaxTeams !== null &&
    parsedMaxTeams <
      participants.length
  ) {
    throw new Error(
      `You cannot reduce the maximum teams to ${parsedMaxTeams}. This tournament already has ${participants.length} participating ${
        participants.length === 1
          ? "team"
          : "teams"
      }.`
    );
  }

  // --------------------------------------------------
  // PARTICIPANT ELIGIBILITY VALIDATION
  // Only when eligibility fields changed.
  // --------------------------------------------------

  if (
    eligibilityRulesChanged
  ) {
    for (
      const request of participants
    ) {
      const team =
        Array.isArray(
          request.teams
        )
          ? request.teams[0]
          : request.teams;

      if (!team) {
        continue;
      }

      const club =
        Array.isArray(
          team.clubs
        )
          ? team.clubs[0]
          : team.clubs;

      const eligibility =
        checkTournamentEligibility(
          {
            teamAgeGroup:
              team.age_group,

            teamGender:
              team.gender,

            teamLevel:
              team.level,

            teamMatchFormat:
              team.match_format,

            tournamentAgeGroup:
              ageGroup,

            tournamentGender:
              gender,

            tournamentLevel:
              level,

            tournamentMatchFormat:
              matchFormat,

            // Level is normally a soft
            // recommendation signal.
            // During edits we protect
            // already participating teams.
            enforceLevel: true,
          }
        );

      if (
        !eligibility.eligible
      ) {
        const teamLabel =
          `${
            club?.name ??
            "A participating club"
          }${
            team.name
              ? ` — ${team.name}`
              : ""
          }`;

        const editConflicts: string[] = [];

if (
  tournament.age_group !== ageGroup &&
  team.age_group !== ageGroup
) {
  editConflicts.push(
    `You can't change the age group to ${ageGroup} because ${teamLabel} is a ${team.age_group} team.`
  );
}

if (
  tournament.gender !== gender &&
  gender !== "Mixed" &&
  team.gender !== gender
) {
  editConflicts.push(
    `You can't change the gender to ${gender} because ${teamLabel} is a ${team.gender} team.`
  );
}

if (
  tournament.match_format !== matchFormat &&
  team.match_format !== matchFormat
) {
  editConflicts.push(
    `You can't change the format to ${matchFormat} because ${teamLabel} is a ${team.match_format} team.`
  );
}

if (
  tournament.level !== level &&
  team.level !== level
) {
  editConflicts.push(
    `You can't change the level to ${level} because ${teamLabel} is a ${team.level} team.`
  );
}

if (editConflicts.length > 0) {
  throw new Error(
    editConflicts.join(" ")
  );
}
      }
    }
  }

  // --------------------------------------------------
  // GEOCODE LOCATION
  // --------------------------------------------------

  const coordinates =
    await geocodeLocation(
      location
    );

  // --------------------------------------------------
  // UPDATE TOURNAMENT
  // --------------------------------------------------

  const {
    error: updateError,
  } = await supabase
    .from("tournaments")
    .update({
      name:
        name.trim(),

      age_group:
        ageGroup,

      gender,

      level,

      match_format:
        matchFormat,

      start_date: startDate,
start_time: startTime,

end_date:
  endDate || startDate,

end_time: endTime,
      location:
        location.trim(),

      entry_fee:
        entryFee
          ? Number(entryFee)
          : null,

      max_teams:
        parsedMaxTeams,

      description:
        description?.trim() ||
        null,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      tournamentId
    );

  if (updateError) {
    console.error(
      "Update tournament error:",
      updateError
    );

    throw new Error(
      updateError.message
    );
  }

  // --------------------------------------------------
  // UPDATE GEOLOCATION
  // --------------------------------------------------

  if (coordinates) {
    const {
      error: geoError,
    } = await supabase.rpc(
      "set_tournament_geo_location",
      {
        p_tournament_id:
          tournamentId,

        p_lat:
          coordinates.lat,

        p_lng:
          coordinates.lng,
      }
    );

    if (geoError) {
      console.error(
        "Update tournament geo location error:",
        geoError
      );
    }
  } else {
    const {
      error: clearGeoError,
    } = await supabase.rpc(
      "clear_tournament_geo_location",
      {
        p_tournament_id:
          tournamentId,
      }
    );

    if (clearGeoError) {
      console.error(
        "Clear tournament geo location error:",
        clearGeoError
      );
    }
  }

  // --------------------------------------------------
  // REVALIDATE
  // --------------------------------------------------

  revalidatePath(
    `/tournaments/${tournamentId}`
  );

  revalidatePath(
    `/tournaments/${tournamentId}/manage`
  );

  revalidatePath(
    `/tournaments/${tournamentId}/manage/teams`
  );

  revalidatePath(
    "/matches"
  );

  return {
    success: true,
  };
}
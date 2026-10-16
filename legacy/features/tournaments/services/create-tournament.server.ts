"use server";

import { createClient } from "@/lib/supabase/server";
import { geocodeLocation } from "@/features/tournaments/services/geocode-location.server";

type CreateTournamentInput = {
  name: string;
  ageGroup: string;
  gender: string;
  level: string;
  matchFormat: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  entryFee: string;
  maxTeams: string;
  description?: string;
};

function getLondonDateAndTime() {
  const now = new Date();

  const date = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Europe/London",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(now);

  const time = new Intl.DateTimeFormat(
    "en-GB",
    {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ).format(now);

  return { date, time };
}

export async function createTournament({
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
}: CreateTournamentInput) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated.");
  }

  // --------------------------------------------------
  // REQUIRED FIELDS
  // --------------------------------------------------

  const trimmedName = name.trim();
  const trimmedLocation = location.trim();

  if (!trimmedName) {
    throw new Error(
      "Tournament name is required."
    );
  }

  if (!ageGroup) {
    throw new Error(
      "Age group is required."
    );
  }

  if (!gender) {
    throw new Error(
      "Gender is required."
    );
  }

  if (!level) {
    throw new Error(
      "Level is required."
    );
  }

  if (!matchFormat) {
    throw new Error(
      "Match format is required."
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

  if (!endDate) {
    throw new Error(
      "End date is required."
    );
  }

  if (!endTime) {
    throw new Error(
      "End time is required."
    );
  }

  if (!trimmedLocation) {
    throw new Error(
      "Location is required."
    );
  }

  if (entryFee === "") {
    throw new Error(
      "Entry fee is required."
    );
  }

  if (maxTeams === "") {
    throw new Error(
      "Maximum teams is required."
    );
  }

  // --------------------------------------------------
  // ALLOWED VALUES
  // --------------------------------------------------

  const allowedAgeGroups = [
    "U8",
    "U9",
    "U10",
    "U11",
    "U12",
    "U13",
    "U14",
    "U15",
    "U16",
  ];

  const allowedGenders = [
    "Boys",
    "Girls",
    "Mixed",
  ];

  const allowedLevels = [
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  const allowedFormats = [
    "5v5",
    "7v7",
    "9v9",
    "11v11",
  ];

  if (
    !allowedAgeGroups.includes(ageGroup)
  ) {
    throw new Error(
      "Invalid age group."
    );
  }

  if (
    !allowedGenders.includes(gender)
  ) {
    throw new Error(
      "Invalid gender."
    );
  }

  if (
    !allowedLevels.includes(level)
  ) {
    throw new Error(
      "Invalid level."
    );
  }

  if (
    !allowedFormats.includes(
      matchFormat
    )
  ) {
    throw new Error(
      "Invalid match format."
    );
  }

  // --------------------------------------------------
  // DATE + TIME VALIDATION
  // --------------------------------------------------

  const {
    date: londonDate,
    time: londonTime,
  } = getLondonDateAndTime();

  if (
    startDate < londonDate ||
    (
      startDate === londonDate &&
      startTime <= londonTime
    )
  ) {
    throw new Error(
      "Please choose a future tournament start date and time."
    );
  }

  if (endDate < startDate) {
    throw new Error(
      "End date cannot be before start date."
    );
  }

  if (
    endDate === startDate &&
    endTime <= startTime
  ) {
    throw new Error(
      "End time must be after start time."
    );
  }

  // --------------------------------------------------
  // ENTRY DETAILS
  // --------------------------------------------------

  const entryFeeNumber =
    Number(entryFee);

  const maxTeamsNumber =
    Number(maxTeams);

  if (
    !Number.isFinite(entryFeeNumber) ||
    entryFeeNumber < 0
  ) {
    throw new Error(
      "Entry fee must be £0 or more."
    );
  }

  if (
    !Number.isInteger(maxTeamsNumber) ||
    maxTeamsNumber < 2
  ) {
    throw new Error(
      "Maximum teams must be at least 2."
    );
  }

  // --------------------------------------------------
  // GEOCODE
  // --------------------------------------------------

  const coordinates =
    await geocodeLocation(
      trimmedLocation
    );

  // --------------------------------------------------
  // CREATE THROUGH SECURE RPC
  // --------------------------------------------------

  const {
    data: tournament,
    error,
  } = await supabase.rpc(
    "create_tournament",
    {
      p_name: trimmedName,
      p_age_group: ageGroup,
      p_gender: gender,
      p_level: level,
      p_match_format:
        matchFormat,
      p_start_date:
        startDate,
      p_start_time:
        startTime,
      p_end_date:
        endDate,
      p_end_time:
        endTime,
      p_location:
        trimmedLocation,
      p_entry_fee:
        entryFeeNumber,
      p_max_teams:
        maxTeamsNumber,
      p_description:
        description?.trim() || null,
    }
  );

  if (error) {
    console.error(
      "Create tournament error:",
      error
    );

    throw new Error(
      error.message ||
        "The tournament could not be created."
    );
  }

  if (!tournament?.id) {
    throw new Error(
      "The tournament could not be created."
    );
  }

  // --------------------------------------------------
  // SAVE GEO LOCATION
  // --------------------------------------------------

  if (coordinates) {
    const { error: geoError } =
      await supabase.rpc(
        "set_tournament_geo_location",
        {
          p_tournament_id:
            tournament.id,
          p_lat:
            coordinates.lat,
          p_lng:
            coordinates.lng,
        }
      );

    if (geoError) {
      console.error(
        "Tournament geo location error:",
        geoError
      );
    }
  }

  return tournament;
}
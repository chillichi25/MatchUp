import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type CreateFriendlyInput = {
  teamId: string;
  matchDate: string;
  kickOffTime: string;
  venueType:
    | "home"
    | "away"
    | "either";
  matchFormat:
  | "3v3"
  | "5v5"
  | "7v7"
  | "9v9"
  | "11v11";
  location: string;
  notes?: string;
};

function getLondonDateAndTime() {
  const now = new Date();

  const date =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(now);

  const time =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: "Europe/London",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    ).format(now);

  return {
    date,
    time,
  };
}

export async function createFriendly(
  input: CreateFriendlyInput
) {
  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError) {
    return {
      data: null,
      error: userError,
    };
  }

  if (!user) {
    return {
      data: null,
      error: new Error(
        "You must be logged in to create a friendly."
      ),
    };
  }

  // --------------------------------------------------
  // REQUIRED FIELDS
  // --------------------------------------------------

  if (
    !input.teamId ||
    !input.matchDate ||
    !input.kickOffTime
  ) {
    return {
      data: null,
      error: new Error(
        "Please enter the date and kick-off time."
      ),
    };
  }

  // Home and Either need a location.
  // Away does not because the opponent
  // will provide the venue.

  const needsLocation =
    input.venueType !== "away";

  if (
    needsLocation &&
    !input.location.trim()
  ) {
    return {
      data: null,
      error: new Error(
        "Please enter the match location."
      ),
    };
  }

  // --------------------------------------------------
  // PREVENT PAST FRIENDLIES
  // --------------------------------------------------

  const {
    date: londonDate,
    time: londonTime,
  } = getLondonDateAndTime();

  const isPast =
    input.matchDate < londonDate ||
    (
      input.matchDate ===
        londonDate &&
      input.kickOffTime <=
        londonTime
    );

  if (isPast) {
    return {
      data: null,
      error: new Error(
        "Please choose a future date and kick-off time."
      ),
    };
  }

  // --------------------------------------------------
  // LOCATION
  // --------------------------------------------------

  const submittedLocation =
    needsLocation
      ? input.location.trim()
      : "";

  // --------------------------------------------------
  // CREATE THROUGH SECURE DATABASE RPC
  // --------------------------------------------------

  const { data, error } =
    await supabase.rpc(
      "create_friendly",
      {
        p_team_id: input.teamId,
        p_match_date:
          input.matchDate,
        p_kick_off_time:
          input.kickOffTime,
        p_venue_type:
          input.venueType,
        p_match_format:
          input.matchFormat,
        p_location:
          submittedLocation,
        p_notes:
          input.notes?.trim() ||
          null,
      }
    );

  return {
    data,
    error,
  };
}
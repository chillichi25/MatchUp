import { supabase } from "@/lib/supabase/client";

import { searchLocations } from "@/features/clubs/services/location.service";
import { getActiveTeam } from "@/features/teams/services/active-team.service";
import { isPastSlot, todayIso } from "@/features/matches/utils/match-time";

import type {
  CreateFriendlyInput,
  FriendlyDetail,
  FriendlyDiscovery,
  FriendlyFilters,
  FriendlyListing,
  FriendlyStatus,
  UpdateFriendlyInput,
  VenueType,
} from "../types";

type RawClub = {
  id: string;
  name: string;
  badge_url: string | null;
  city: string | null;
};

type RawFriendlyTeam = {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  clubs: RawClub | RawClub[] | null;
};

type RawFriendly = {
  id: string;
  team_id: string;
  created_by: string;
  match_date: string;
  kick_off_time: string | null;
  venue_type: string | null;
  match_format: string | null;
  location: string | null;
  notes: string | null;
  status: string | null;
  created_at: string;
  teams: RawFriendlyTeam | RawFriendlyTeam[] | null;
};

type RadiusRow = { id: string; distance_miles: number | string };

export const EMPTY_FILTERS: FriendlyFilters = {
  q: "",
  age: "",
  level: "",
  gender: "",
  format: "",
  date: "",
  location: "",
  distance: "",
  venue: "",
  quick: "",
  sort: "soonest",
};

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toVenueType(value: string | null): VenueType {
  return value === "away" || value === "either" ? value : "home";
}

function toStatus(value: string | null): FriendlyStatus {
  return value === "matched" || value === "cancelled" ? value : "open";
}

function normalise(row: RawFriendly): FriendlyListing | null {
  const team = first(row.teams);

  if (!team) {
    return null;
  }

  const club = first(team.clubs);

  return {
    id: row.id,
    teamId: row.team_id,
    createdBy: row.created_by,

    matchDate: row.match_date,
    kickOff: row.kick_off_time,
    venueType: toVenueType(row.venue_type),
    matchFormat: row.match_format,
    location: row.location,
    notes: row.notes,
    status: toStatus(row.status),
    createdAt: row.created_at,

    clubId: club?.id ?? "",
    clubName: club?.name ?? "",
    badgeUrl: club?.badge_url ?? null,
    teamName: team.name,
    ageGroup: team.age_group,
    level: team.level,
    gender: team.gender,

    distanceMiles: null,
    isOwnPost: false,
    isRecommended: false,
  };
}

const FRIENDLY_SELECT = `
  id,
  team_id,
  created_by,
  match_date,
  kick_off_time,
  venue_type,
  match_format,
  location,
  notes,
  status,
  created_at,

  teams!friendlies_team_id_fkey (
    id,
    name,
    age_group,
    gender,
    level,

    clubs!teams_club_id_fkey (
      id,
      name,
      badge_url,
      city
    )
  )
`;

/**
 * Resolves a set of friendly ids to real PostGIS distances (miles).
 *
 * Uses the exact-club radius RPC when no custom location is supplied, and
 * geocodes an arbitrary town/city through the `locations-search` Edge Function
 * before calling the coordinate-based radius RPC.
 */
async function loadFriendlyDistances(
  radiusMiles: number,
  options: { customLocation?: string; clubId?: string | null }
): Promise<Map<string, number>> {
  const customLocation = options.customLocation?.trim();

  let rows: RadiusRow[] = [];

  if (customLocation) {
    const locations = await searchLocations(customLocation);
    const match = locations[0];

    if (match) {
      const { data, error } = await supabase.rpc("friendlies_within_radius", {
        search_lat: match.lat,
        search_lng: match.lng,
        radius_miles: radiusMiles,
      });

      if (error) {
        console.error("FRIENDLY RADIUS (LOCATION) ERROR:", error);
      } else {
        rows = (data ?? []) as RadiusRow[];
      }
    }
  } else if (options.clubId) {
    const { data, error } = await supabase.rpc(
      "friendlies_within_radius_from_club",
      { p_club_id: options.clubId, radius_miles: radiusMiles }
    );

    if (error) {
      console.error("FRIENDLY RADIUS (CLUB) ERROR:", error);
    } else {
      rows = (data ?? []) as RadiusRow[];
    }
  }

  return new Map(
    rows.map((row) => [row.id, Number(row.distance_miles)])
  );
}

/* ------------------------------------------------------------------ */
/* Discovery                                                           */
/* ------------------------------------------------------------------ */

export async function getFriendlyDiscovery(
  filters: FriendlyFilters
): Promise<FriendlyDiscovery> {
  const team = await getActiveTeam();

  const coachAgeGroup = team?.age_group ?? null;
  const coachLevel = team?.level ?? null;
  const coachMatchFormat = team?.match_format ?? null;
  const club = team?.clubs ?? null;

  const empty: FriendlyDiscovery = {
    yourPosts: [],
    recommended: [],
    available: [],
    coachAgeGroup,
    coachLevel,
    coachMatchFormat,
    defaultClubCity: club?.city?.trim() ?? "",
    hasActiveFilters: hasActiveFilters(filters),
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !team) {
    return empty;
  }

  const { error: expiryError } = await supabase.rpc("expire_friendly_requests");

  if (expiryError) {
    console.error("EXPIRE FRIENDLY REQUESTS ERROR:", expiryError);
  }

  const today = todayIso();

  const { data, error } = await supabase
    .from("friendlies")
    .select(FRIENDLY_SELECT)
    .eq("status", "open")
    .gte("match_date", today)
    .order("match_date", { ascending: true })
    .order("kick_off_time", { ascending: true });

  if (error) {
    console.error("FRIENDLY DISCOVERY ERROR:", error);
    return empty;
  }

  let listings = ((data ?? []) as unknown as RawFriendly[])
    .map(normalise)
    .filter((listing): listing is FriendlyListing => listing !== null);

  let distances = new Map<string, number>();

  if (filters.distance || filters.sort === "nearest") {
    distances = await loadFriendlyDistances(
      filters.distance ? Number(filters.distance) : 10000,
      {
        customLocation: filters.location,
        clubId: club?.id ?? null,
      }
    );
  }

  const search = filters.q.trim().toLowerCase();

  listings = listings.filter((listing) => {
    if (isPastSlot(listing.matchDate, listing.kickOff)) {
      return false;
    }

    if (search) {
      const haystack = [listing.clubName, listing.teamName, listing.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (filters.age && listing.ageGroup !== filters.age) return false;
    if (filters.level && listing.level !== filters.level) return false;
    if (filters.gender && listing.gender !== filters.gender) return false;
    if (filters.format && listing.matchFormat !== filters.format) return false;
    if (filters.date && listing.matchDate !== filters.date) return false;
    if (filters.venue && listing.venueType !== filters.venue) return false;

    if (filters.distance && !distances.has(listing.id)) {
      return false;
    }

    return true;
  });

  listings = listings.map((listing) => ({
    ...listing,
    distanceMiles: distances.get(listing.id) ?? null,
    isOwnPost: listing.createdBy === user.id,
  }));

  listings.sort((a, b) => {
    if (filters.sort === "nearest") {
      return (
        (a.distanceMiles ?? Number.POSITIVE_INFINITY) -
        (b.distanceMiles ?? Number.POSITIVE_INFINITY)
      );
    }

    if (filters.sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return `${a.matchDate}T${a.kickOff ?? "00:00:00"}`.localeCompare(
      `${b.matchDate}T${b.kickOff ?? "00:00:00"}`
    );
  });

  const yourPosts = listings.filter((listing) => listing.isOwnPost);
  const others = listings.filter((listing) => !listing.isOwnPost);

  const isRecommended = (listing: FriendlyListing) => {
    if (!coachAgeGroup && !coachLevel) {
      return false;
    }

    const ageMatches = !coachAgeGroup || listing.ageGroup === coachAgeGroup;
    const levelMatches = !coachLevel || listing.level === coachLevel;

    return ageMatches && levelMatches;
  };

  const recommended = others
    .filter(isRecommended)
    .map((listing) => ({ ...listing, isRecommended: true }));
  const recommendedIds = new Set(recommended.map((listing) => listing.id));
  const available = others.filter((listing) => !recommendedIds.has(listing.id));

  return {
    yourPosts,
    recommended,
    available,
    coachAgeGroup,
    coachLevel,
    coachMatchFormat,
    defaultClubCity: club?.city?.trim() ?? "",
    hasActiveFilters: hasActiveFilters(filters),
  };
}

export function hasActiveFilters(filters: FriendlyFilters): boolean {
  return Boolean(
    filters.q.trim() ||
      filters.age ||
      filters.level ||
      filters.gender ||
      filters.format ||
      filters.date ||
      filters.location.trim() ||
      filters.distance ||
      filters.venue ||
      filters.quick
  );
}

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

export async function getFriendlyDetail(
  friendlyId: string
): Promise<FriendlyDetail | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("friendlies")
    .select(FRIENDLY_SELECT)
    .eq("id", friendlyId)
    .maybeSingle();

  if (error || !data) {
    console.error("FRIENDLY DETAIL ERROR:", error);
    return null;
  }

  const listing = normalise(data as unknown as RawFriendly);

  if (!listing) {
    return null;
  }

  return {
    ...listing,
    isOwnPost: listing.createdBy === user?.id,
    isOwner: listing.createdBy === user?.id,
  };
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export async function createFriendly(
  input: CreateFriendlyInput
): Promise<{ id: string }> {
  if (!input.teamId || !input.matchDate || !input.kickOffTime) {
    throw new Error("Please enter the date and kick-off time.");
  }

  const needsLocation = input.venueType !== "away";

  if (needsLocation && !input.location.trim()) {
    throw new Error("Please enter the match location.");
  }

  if (isPastSlot(input.matchDate, input.kickOffTime)) {
    throw new Error("Please choose a future date and kick-off time.");
  }

  const { data, error } = await supabase.rpc("create_friendly", {
    p_team_id: input.teamId,
    p_match_date: input.matchDate,
    p_kick_off_time: input.kickOffTime,
    p_venue_type: input.venueType,
    p_match_format: input.matchFormat,
    p_location: needsLocation ? input.location.trim() : "",
    p_notes: input.notes?.trim() || null,
  });

  if (error) {
    console.error("CREATE FRIENDLY ERROR:", error);
    throw new Error(error.message || "The friendly could not be created.");
  }

  const created = Array.isArray(data) ? data[0] : data;

  if (!created?.id) {
    throw new Error("The friendly could not be created.");
  }

  return { id: created.id as string };
}

/**
 * Edits an open friendly through the trusted `update_friendly` RPC. Pending
 * requesters are notified by the backend, so a commitment is never altered
 * silently under an existing request.
 */
export async function updateFriendly(input: UpdateFriendlyInput): Promise<void> {
  if (
    !input.friendlyId ||
    !input.matchDate ||
    !input.kickOffTime ||
    !input.location.trim()
  ) {
    throw new Error("Please enter the date, kick-off time and location.");
  }

  if (isPastSlot(input.matchDate, input.kickOffTime)) {
    throw new Error("Please choose a future date and kick-off time.");
  }

  const { error } = await supabase.rpc("update_friendly", {
    p_friendly_id: input.friendlyId,
    p_match_date: input.matchDate,
    p_kick_off_time: input.kickOffTime,
    p_venue_type: input.venueType,
    p_match_format: input.matchFormat,
    p_location: input.location.trim(),
    p_notes: input.notes?.trim() || null,
  });

  if (error) {
    console.error("UPDATE FRIENDLY ERROR:", error);
    throw new Error("We couldn't update this friendly.");
  }
}

export async function cancelFriendly(friendlyId: string): Promise<void> {
  const { error } = await supabase.rpc("cancel_friendly", {
    p_friendly_id: friendlyId.trim(),
  });

  if (error) {
    console.error("CANCEL FRIENDLY ERROR:", error);
    throw new Error("We couldn't cancel this friendly.");
  }
}

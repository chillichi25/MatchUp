import { supabase } from "@/lib/supabase/client";

import { searchLocations } from "@/features/clubs/services/location.service";
import { getActiveTeam } from "@/features/teams/services/active-team.service";
import { calculateTournamentScore } from "@/features/tournaments/services/tournament-recommendation.service";
import { checkTournamentEligibility } from "@/features/tournaments/utils/eligibility";
import { todayIso } from "@/features/matches/utils/match-time";

import { toTournamentStatus, toTournamentRequestStatus } from "../constants";
import type {
  MyTournament,
  ParticipatingTournament,
  TournamentDetail,
  TournamentFilters,
  TournamentListing,
  TournamentParticipant,
} from "../types";
import { compareScoredCandidates } from "@/features/dashboard/utils/compare-candidates";

type RawTournament = {
  id: string;
  created_by: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  match_format: string | null;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  entry_fee: number | null;
  max_teams: number | null;
  description: string | null;
  status: string | null;
};

type RawParticipantRow = {
  team_id: string;
  team_name: string;
  age_group: string | null;
  club_id: string;
  club_name: string;
  badge_url: string | null;
};

type RawParticipatingRequest = {
  id: string;
  status: string;
  tournament_id: string;
  tournaments:
    | {
        id: string;
        name: string;
        age_group: string | null;
        start_date: string;
        start_time: string | null;
        end_date: string | null;
        end_time: string | null;
        location: string | null;
      }
    | null;
};

type DistanceRow = { id: string; distance_miles: number | string };

const TOURNAMENT_SELECT = `
  id,
  created_by,
  name,
  age_group,
  gender,
  level,
  match_format,
  start_date,
  start_time,
  end_date,
  end_time,
  location,
  entry_fee,
  max_teams,
  description,
  status
`;

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function normaliseListing(row: RawTournament): TournamentListing {
  return {
    id: row.id,
    name: row.name,
    ageGroup: row.age_group,
    gender: row.gender,
    level: row.level,
    matchFormat: row.match_format,

    startDate: row.start_date,
    startTime: row.start_time,
    endDate: row.end_date,
    endTime: row.end_time,
    location: row.location,

    entryFee: row.entry_fee,
    maxTeams: row.max_teams,
    status: toTournamentStatus(row.status),
    createdBy: row.created_by,

    distanceMiles: null,
    score: 0,
    isRecommended: false,
  };
}

async function loadTournamentDistances(
  radiusMiles: number,
  options: { customLocation?: string; clubId: string | null }
): Promise<Map<string, number>> {
  const customLocation = options.customLocation?.trim();

  let rows: DistanceRow[] = [];

  if (customLocation) {
    const locations = await searchLocations(customLocation);
    const match = locations[0];

    if (match) {
      const { data, error } = await supabase.rpc("tournaments_within_radius", {
        search_lat: match.lat,
        search_lng: match.lng,
        radius_miles: radiusMiles,
      });

      if (error) {
        console.error("TOURNAMENT RADIUS (LOCATION) ERROR:", error);
      } else {
        rows = (data ?? []) as DistanceRow[];
      }
    }
  } else if (options.clubId) {
    const { data, error } = await supabase.rpc(
      "tournaments_within_radius_from_club",
      { p_club_id: options.clubId, radius_miles: radiusMiles }
    );

    if (error) {
      console.error("TOURNAMENT RADIUS (CLUB) ERROR:", error);
    } else {
      rows = (data ?? []) as DistanceRow[];
    }
  }

  return new Map(rows.map((row) => [row.id, Number(row.distance_miles)]));
}

export type TournamentDiscovery = {
  recommended: TournamentListing[];
  available: TournamentListing[];

  coachAgeGroup: string | null;
  coachLevel: string | null;
  coachMatchFormat: string | null;
  defaultClubCity: string;

  hasActiveFilters: boolean;
};

function isActiveFilter(filters: TournamentFilters): boolean {
  return Boolean(
    filters.q.trim() ||
      filters.age ||
      filters.level ||
      filters.gender ||
      filters.format ||
      filters.date ||
      filters.location.trim() ||
      filters.distance
  );
}

export async function getTournamentDiscovery(
  filters: TournamentFilters
): Promise<TournamentDiscovery> {
  const team = await getActiveTeam();

  const empty: TournamentDiscovery = {
    recommended: [],
    available: [],
    coachAgeGroup: team?.age_group ?? null,
    coachLevel: team?.level ?? null,
    coachMatchFormat: team?.match_format ?? null,
    defaultClubCity: team?.clubs?.city?.trim() ?? "",
    hasActiveFilters: isActiveFilter(filters),
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !team) {
    return empty;
  }

  const today = todayIso();

  const [tournamentsResult, requestsResult] = await Promise.all([
    supabase
      .from("tournaments")
      .select(TOURNAMENT_SELECT)
      .eq("status", "open")
      .gte("start_date", today)
      .order("start_date", { ascending: true }),
    supabase
      .from("tournament_requests")
      .select("tournament_id, status")
      .eq("requesting_team_id", team.id)
      .in("status", ["pending", "accepted"]),
  ]);

  if (tournamentsResult.error) {
    console.error("TOURNAMENT DISCOVERY ERROR:", tournamentsResult.error);
    return empty;
  }

  const unavailable = new Set(
    (requestsResult.data ?? []).map(
      (row: { tournament_id: string }) => row.tournament_id
    )
  );

  let listings = ((tournamentsResult.data ?? []) as unknown as RawTournament[])
    .map(normaliseListing)
    .filter((listing) => !unavailable.has(listing.id));

  const search = filters.q.trim().toLowerCase();

  listings = listings.filter((listing) => {
    if (search) {
      const haystack = [listing.name, listing.location]
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
    if (filters.date && listing.startDate !== filters.date) return false;

    return true;
  });

  let distances = new Map<string, number>();

  if (filters.distance || filters.sort === "nearest") {
    distances = await loadTournamentDistances(
      filters.distance ? Number(filters.distance) : 10000,
      {
        customLocation: filters.location,
        clubId: team.club_id ?? null,
      }
    );
  }

  if (filters.distance) {
    listings = listings.filter((listing) => distances.has(listing.id));
  }

  listings = listings.map((listing) => ({
    ...listing,
    distanceMiles: distances.get(listing.id) ?? null,
  }));

  listings.sort((a, b) => {
    if (filters.sort === "nearest") {
      return (
        (a.distanceMiles ?? Number.POSITIVE_INFINITY) -
        (b.distanceMiles ?? Number.POSITIVE_INFINITY)
      );
    }

    if (filters.sort === "fee") {
      return (a.entryFee ?? 0) - (b.entryFee ?? 0);
    }

    if (filters.sort === "newest") {
      return b.startDate.localeCompare(a.startDate);
    }

    return a.startDate.localeCompare(b.startDate);
  });

  const scored = listings
    .map((listing) => {
      const score = calculateTournamentScore({
        activeAgeGroup: team.age_group ?? null,
        activeLevel: team.level ?? null,
        activeGender: team.gender ?? null,
        activeMatchFormat: team.match_format ?? null,

        tournamentAgeGroup: listing.ageGroup,
        tournamentLevel: listing.level,
        tournamentGender: listing.gender,
        tournamentMatchFormat: listing.matchFormat,

        distanceMiles: listing.distanceMiles,
        startDate: listing.startDate,
        status: listing.status,
      });

      return { ...listing, score };
    })
    .sort((a, b) =>
      compareScoredCandidates(
        { score: a.score, distanceMiles: a.distanceMiles, date: a.startDate },
        { score: b.score, distanceMiles: b.distanceMiles, date: b.startDate }
      )
    );

  const eligible = scored.filter(
    (listing) =>
      checkTournamentEligibility({
        teamAgeGroup: team.age_group ?? null,
        tournamentAgeGroup: listing.ageGroup,
        teamGender: team.gender ?? null,
        tournamentGender: listing.gender,
      }).eligible
  );

  const recommended = eligible
    .slice(0, 3)
    .map((listing) => ({ ...listing, isRecommended: true }));
  const recommendedIds = new Set(recommended.map((listing) => listing.id));

  return {
    recommended,
    available: scored.filter((listing) => !recommendedIds.has(listing.id)),
    coachAgeGroup: team.age_group ?? null,
    coachLevel: team.level ?? null,
    coachMatchFormat: team.match_format ?? null,
    defaultClubCity: team.clubs?.city?.trim() ?? "",
    hasActiveFilters: isActiveFilter(filters),
  };
}

/* ------------------------------------------------------------------ */
/* Detail                                                              */
/* ------------------------------------------------------------------ */

export async function getTournamentParticipants(
  tournamentId: string
): Promise<TournamentParticipant[]> {
  const { data, error } = await supabase.rpc("get_tournament_participants", {
    p_tournament_id: tournamentId,
  });

  if (error) {
    console.error("TOURNAMENT PARTICIPANTS ERROR:", error);
    return [];
  }

  return ((data ?? []) as RawParticipantRow[]).map((row) => ({
    teamId: row.team_id,
    teamName: row.team_name,
    ageGroup: row.age_group,
    clubId: row.club_id,
    clubName: row.club_name,
    badgeUrl: row.badge_url,
  }));
}

export async function getTournamentAcceptedCount(
  tournamentId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("get_tournament_accepted_count", {
    p_tournament_id: tournamentId,
  });

  if (error) {
    console.error("TOURNAMENT ACCEPTED COUNT ERROR:", error);
    return 0;
  }

  return Number(data ?? 0);
}

export async function getTournamentDetail(
  tournamentId: string
): Promise<TournamentDetail | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const team = await getActiveTeam();

  const { data, error } = await supabase
    .from("tournaments")
    .select(TOURNAMENT_SELECT)
    .eq("id", tournamentId)
    .maybeSingle();

  if (error || !data) {
    console.error("TOURNAMENT DETAIL ERROR:", error);
    return null;
  }

  const row = data as unknown as RawTournament;
  const listing = normaliseListing(row);

  const [acceptedCount, existingRequestResult] = await Promise.all([
    getTournamentAcceptedCount(tournamentId),
    team
      ? supabase
          .from("tournament_requests")
          .select("id, status")
          .eq("tournament_id", tournamentId)
          .eq("requesting_team_id", team.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const existingRequest = existingRequestResult.data
    ? {
        id: existingRequestResult.data.id as string,
        status: toTournamentRequestStatus(
          existingRequestResult.data.status as string | null
        ),
      }
    : null;

  const isFull =
    listing.maxTeams !== null &&
    listing.maxTeams !== undefined &&
    acceptedCount >= listing.maxTeams;

  const spacesRemaining =
    listing.maxTeams === null || listing.maxTeams === undefined
      ? null
      : Math.max(listing.maxTeams - acceptedCount, 0);

  const eligibility = team
    ? checkTournamentEligibility({
        teamAgeGroup: team.age_group ?? null,
        tournamentAgeGroup: listing.ageGroup,
        teamGender: team.gender ?? null,
        tournamentGender: listing.gender,
      })
    : { eligible: false, reasons: [] };

  return {
    ...listing,
    description: row.description,
    isOwner: row.created_by === user?.id,
    acceptedCount,
    spacesRemaining,
    isFull,
    eligibility,
    existingRequest,
  };
}

/* ------------------------------------------------------------------ */
/* My tournaments / participating                                      */
/* ------------------------------------------------------------------ */

export async function getMyTournaments(): Promise<{
  active: MyTournament[];
  history: MyTournament[];
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { active: [], history: [] };
  }

  const { data, error } = await supabase
    .from("tournaments")
    .select(TOURNAMENT_SELECT)
    .eq("created_by", user.id)
    .order("start_date", { ascending: false })
    .order("start_time", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("MY TOURNAMENTS ERROR:", error);
    return { active: [], history: [] };
  }

  const rows = (data ?? []) as unknown as RawTournament[];
  const ids = rows.map((row) => row.id);

  const counts = new Map<string, { accepted: number; pending: number }>();

  if (ids.length > 0) {
    const { data: requestRows } = await supabase
      .from("tournament_requests")
      .select("tournament_id, status")
      .in("tournament_id", ids)
      .in("status", ["accepted", "pending"]);

    for (const request of (requestRows ?? []) as {
      tournament_id: string;
      status: string;
    }[]) {
      const current = counts.get(request.tournament_id) ?? {
        accepted: 0,
        pending: 0,
      };

      if (request.status === "accepted") {
        current.accepted += 1;
      } else {
        current.pending += 1;
      }

      counts.set(request.tournament_id, current);
    }
  }

  const active: MyTournament[] = [];
  const history: MyTournament[] = [];

  for (const row of rows) {
    const status = toTournamentStatus(row.status);
    const count = counts.get(row.id) ?? { accepted: 0, pending: 0 };

    const item: MyTournament = {
      id: row.id,
      name: row.name,
      ageGroup: row.age_group,
      gender: row.gender,
      level: row.level,
      matchFormat: row.match_format,
      startDate: row.start_date,
      startTime: row.start_time,
      endDate: row.end_date,
      endTime: row.end_time,
      location: row.location,
      maxTeams: row.max_teams,
      status,
      acceptedCount: count.accepted,
      pendingCount: count.pending,
    };

    if (status === "completed" || status === "cancelled") {
      history.push(item);
    } else {
      active.push(item);
    }
  }

  return { active, history };
}

export async function getParticipatingTournaments(): Promise<
  ParticipatingTournament[]
> {
  const team = await getActiveTeam();

  if (!team) {
    return [];
  }

  const today = todayIso();

  const { data, error } = await supabase
    .from("tournament_requests")
    .select(
      `
      id,
      status,
      tournament_id,

      tournaments!inner (
        id,
        name,
        age_group,
        start_date,
        start_time,
        end_date,
        end_time,
        location
      )
    `
    )
    .eq("requesting_team_id", team.id)
    .eq("status", "accepted")
    .in("tournaments.status", ["open", "closed"])
    .gte("tournaments.end_date", today);

  if (error) {
    console.error("PARTICIPATING TOURNAMENTS ERROR:", error);
    return [];
  }

  return ((data ?? []) as unknown as RawParticipatingRequest[])
    .map((request) => {
      const tournament = first(request.tournaments);

      if (!tournament) {
        return null;
      }

      return {
        requestId: request.id,
        id: tournament.id,
        name: tournament.name,
        ageGroup: tournament.age_group,
        startDate: tournament.start_date,
        startTime: tournament.start_time,
        endDate: tournament.end_date,
        endTime: tournament.end_time,
        location: tournament.location,
      } satisfies ParticipatingTournament;
    })
    .filter((entry): entry is ParticipatingTournament => entry !== null)
    .sort((a, b) =>
      `${a.startDate}T${a.startTime ?? "00:00:00"}`.localeCompare(
        `${b.startDate}T${b.startTime ?? "00:00:00"}`
      )
    );
}

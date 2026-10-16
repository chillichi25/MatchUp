import { supabase } from "@/lib/supabase/client";

import { calculateFriendlyScore } from "@/features/matches/services/match-recommendation.service";
import {
  getRecentResults,
  type RecentResult,
} from "@/features/matches/services/recent-results.service";
import { getTeamStatistics } from "@/features/matches/services/match-statistics.service";
import { calculateTournamentScore } from "@/features/tournaments/services/tournament-recommendation.service";
import {
  getActiveTeam,
  getAvailableTeams,
} from "@/features/teams/services/active-team.service";
import type { AppNotification } from "@/features/notifications/types";

import type {
  DashboardData,
  DashboardFriendly,
  DashboardMatch,
  DashboardMatchTeam,
  DashboardRecommendedTournament,
  DashboardSwitcherTeam,
  DashboardTournament,
} from "../types";
import { compareScoredCandidates } from "../utils/compare-candidates";
import { isTournamentEligible } from "../utils/tournament-eligibility";

/* ------------------------------------------------------------------ */
/* Raw row shapes                                                      */
/* ------------------------------------------------------------------ */

type RawClub = { name: string | null; badge_url: string | null };
type RawFriendlyClub = {
  id: string;
  name: string;
  badge_url: string | null;
  city: string | null;
};

type RawMatchTeam = {
  id: string;
  name: string;
  clubs: RawClub | RawClub[] | null;
};

type RawUpcomingMatch = {
  id: string;
  match_date: string;
  kick_off_time: string | null;
  location: string | null;
  home: RawMatchTeam | null;
  away: RawMatchTeam | null;
  match_conversations: { id: string } | { id: string }[] | null;
};

type RawFriendlyTeam = {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  clubs: RawFriendlyClub | RawFriendlyClub[] | null;
};

type RawFriendly = {
  id: string;
  match_date: string;
  match_format: string | null;
  venue_type: string | null;
  kick_off_time: string | null;
  location: string | null;
  team: RawFriendlyTeam | RawFriendlyTeam[] | null;
};

type RawTournament = {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  match_format: string | null;
  start_date: string;
  location: string | null;
  entry_fee: number | null;
  max_teams: number | null;
  status: string | null;
};

type RawParticipatingTournament = {
  id: string;
  name: string;
  age_group: string | null;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
};

type RawParticipatingRequest = {
  id: string;
  status: string;
  tournament_id: string;
  tournaments: RawParticipatingTournament | RawParticipatingTournament[] | null;
};

type DistanceRow = { distance_miles: number | string };

type FriendlyDistanceRow = DistanceRow & { friendly_id: string };
type TournamentDistanceRow = DistanceRow & { tournament_id: string };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyDashboard(coachName = "Coach"): DashboardData {
  return {
    coachName,
    activeTeamId: "",
    teams: [],
    clubName: "",
    teamName: "",
    badgeUrl: null,
    nextMatch: null,
    nextTournament: null,
    upcomingMatches: [],
    upcomingTournaments: [],
    friendly: null,
    tournament: null,
    notifications: [],
    unreadNotifications: 0,
    stats: {
      pendingRequests: 0,
      awaitingResponses: 0,
      upcomingMatches: 0,
      tournaments: 0,
    },
    statistics: null,
    recentResults: [],
  };
}

function toSwitcherTeam(team: {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  clubs: { id: string; name: string; badge_url: string | null; city: string | null };
}): DashboardSwitcherTeam {
  return {
    id: team.id,
    name: team.name,
    age_group: team.age_group,
    gender: team.gender,
    level: team.level,
    club: {
      id: team.clubs.id,
      name: team.clubs.name,
      badgeUrl: team.clubs.badge_url,
      city: team.clubs.city,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

/**
 * Builds everything the Home tab needs for the signed-in coach's active team.
 * Each section degrades independently: a failing sub-query yields an empty
 * section rather than failing the whole dashboard.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyDashboard();
  }

  const [profileResult, team, availableTeams] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle(),
    getActiveTeam(),
    getAvailableTeams(),
  ]);

  const coachName = profileResult.data?.first_name?.trim() || "Coach";

  if (!team) {
    return emptyDashboard(coachName);
  }

  const today = todayIso();
  const club = team.clubs;

  const [
    matchesResult,
    participatingTournamentRequestsResult,
    teamTournamentRequestsResult,
    friendlyCandidatesResult,
    activeTeamFriendliesResult,
    friendlyDistanceResult,
    notificationsResult,
    upcomingMatchesCountResult,
    pendingRequestsResult,
    awaitingResponsesResult,
    tournamentCandidatesResult,
    tournamentDistanceResult,
    unreadNotificationsResult,
    statistics,
    recentResults,
  ] = await Promise.all([
    supabase
      .from("matches")
      .select(
        `
          id,
          match_date,
          kick_off_time,
          location,

          home:home_team_id (
            id,
            name,
            clubs ( name, badge_url )
          ),

          away:away_team_id (
            id,
            name,
            clubs ( name, badge_url )
          ),

          match_conversations ( id )
        `
      )
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
      .eq("status", "scheduled")
      .gte("match_date", today)
      .order("match_date", { ascending: true })
      .order("kick_off_time", { ascending: true })
      .limit(5),

    supabase
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
            location,
            status
          )
        `
      )
      .eq("requesting_team_id", team.id)
      .eq("status", "accepted")
      .in("tournaments.status", ["open", "closed"])
      .gte("tournaments.end_date", today),

    supabase
      .from("tournament_requests")
      .select("tournament_id, status")
      .eq("requesting_team_id", team.id)
      .in("status", ["pending", "accepted"]),

    supabase
      .from("friendlies")
      .select(
        `
          id,
          match_date,
          match_format,
          venue_type,
          kick_off_time,
          location,

          team:team_id (
            id,
            name,
            age_group,
            gender,
            level,

            clubs ( id, name, badge_url, city )
          )
        `
      )
      .eq("status", "open")
      .neq("team_id", team.id)
      .gte("match_date", today)
      .order("match_date", { ascending: true }),

    supabase
      .from("friendlies")
      .select("id, match_date, venue_type, match_format")
      .eq("team_id", team.id)
      .eq("status", "open")
      .gte("match_date", today)
      .order("match_date", { ascending: true }),

    supabase.rpc("friendlies_with_distance_from_club", {
      p_club_id: team.club_id,
    }),

    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
      .eq("status", "scheduled")
      .gte("match_date", today),

    supabase
      .from("friendly_requests")
      .select("id, friendlies!inner ( team_id )", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending")
      .eq("friendlies.team_id", team.id),

    supabase
      .from("friendly_requests")
      .select("id, requested_by, requesting_team_id, status")
      .eq("requested_by", user.id)
      .eq("status", "pending"),

    supabase
      .from("tournaments")
      .select(
        `
          id,
          name,
          age_group,
          gender,
          level,
          match_format,
          start_date,
          location,
          entry_fee,
          max_teams,
          status
        `
      )
      .eq("status", "open")
      .gte("start_date", today)
      .order("start_date", { ascending: true }),

    supabase.rpc("tournaments_with_distance_from_club", {
      p_club_id: team.club_id,
    }),

    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),

    getTeamStatistics(team.id),

    getRecentResults(team.id),
  ]);

  const matches = (matchesResult.data ?? []) as unknown as RawUpcomingMatch[];
  const participatingTournamentRequests = (participatingTournamentRequestsResult.data ??
    []) as unknown as RawParticipatingRequest[];
  const teamTournamentRequests =
    (teamTournamentRequestsResult.data ?? []) as { tournament_id: string }[];
  const friendlyCandidates = (friendlyCandidatesResult.data ??
    []) as unknown as RawFriendly[];
  const activeTeamFriendlies = (activeTeamFriendliesResult.data ?? []) as {
    match_date: string;
    venue_type: string | null;
  }[];
  const notifications = (notificationsResult.data ??
    []) as AppNotification[];
  const tournamentCandidates = (tournamentCandidatesResult.data ??
    []) as unknown as RawTournament[];

  const upcomingMatchesCount = upcomingMatchesCountResult.count ?? 0;
  const pendingRequests = pendingRequestsResult.count ?? 0;
  const awaitingResponses = awaitingResponsesResult.data?.length ?? 0;
  const unreadNotifications = unreadNotificationsResult.count ?? 0;

  /* ---------------- FRIENDLY RECOMMENDATION ---------------- */

  const friendlyDistances = new Map<string, number>(
    ((friendlyDistanceResult.data ?? []) as unknown as FriendlyDistanceRow[]).map(
      (row) => [row.friendly_id, Number(row.distance_miles)]
    )
  );

  const scoredFriendlies = friendlyCandidates
    .map((friendly) => {
      const friendlyTeam = first(friendly.team);

      if (!friendlyTeam) {
        return null;
      }

      const distanceMiles = friendlyDistances.get(friendly.id) ?? null;

      const activeFriendlyForDate = activeTeamFriendlies.find(
        (activeFriendly) => activeFriendly.match_date === friendly.match_date
      );

      const activeVenueType =
        activeFriendlyForDate?.venue_type === "home" ||
        activeFriendlyForDate?.venue_type === "away"
          ? activeFriendlyForDate.venue_type
          : null;

      const opportunityVenueType =
        friendly.venue_type === "home" || friendly.venue_type === "away"
          ? friendly.venue_type
          : null;

      const score = calculateFriendlyScore({
        activeAgeGroup: team.age_group ?? null,
        activeLevel: team.level ?? null,
        activeGender: team.gender ?? null,
        activeMatchFormat: team.match_format ?? null,

        opportunityAgeGroup: friendlyTeam.age_group ?? null,
        opportunityLevel: friendlyTeam.level ?? null,
        opportunityGender: friendlyTeam.gender ?? null,
        opportunityMatchFormat: friendly.match_format ?? null,

        distanceMiles,
        activeVenueType,
        opportunityVenueType,
      });

      return { friendly, friendlyTeam, distanceMiles, score };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) =>
      compareScoredCandidates(
        { score: a.score, distanceMiles: a.distanceMiles, date: a.friendly.match_date },
        { score: b.score, distanceMiles: b.distanceMiles, date: b.friendly.match_date }
      )
    );

  const bestFriendly = scoredFriendlies[0] ?? null;

  let friendly: DashboardFriendly | null = null;

  if (bestFriendly) {
    const friendlyClub = first(bestFriendly.friendlyTeam.clubs);

    friendly = {
      id: bestFriendly.friendly.id,
      clubName: friendlyClub?.name ?? "",
      badgeUrl: friendlyClub?.badge_url ?? null,
      teamName: bestFriendly.friendlyTeam.name,
      ageGroup: bestFriendly.friendlyTeam.age_group,
      level: bestFriendly.friendlyTeam.level,
      gender: bestFriendly.friendlyTeam.gender,
      lookingFor:
        bestFriendly.friendly.venue_type === "home" ? "home" : "away",
      matchFormat: bestFriendly.friendly.match_format,
      matchDate: bestFriendly.friendly.match_date,
      kickOff: bestFriendly.friendly.kick_off_time?.slice(0, 5) ?? null,
      location: bestFriendly.friendly.location,
      distance: bestFriendly.distanceMiles,
      score: bestFriendly.score,
      recommendation: "best-match",
    };
  }

  /* ---------------- TOURNAMENT RECOMMENDATION ---------------- */

  const tournamentDistances = new Map<string, number>(
    ((tournamentDistanceResult.data ??
      []) as unknown as TournamentDistanceRow[]).map((row) => [
      row.tournament_id,
      Number(row.distance_miles),
    ])
  );

  const unavailableTournamentIds = new Set(
    teamTournamentRequests.map((request) => request.tournament_id)
  );

  const scoredTournaments = tournamentCandidates
    .filter((tournament) => {
      if (unavailableTournamentIds.has(tournament.id)) {
        return false;
      }

      return isTournamentEligible({
        teamAgeGroup: team.age_group ?? null,
        tournamentAgeGroup: tournament.age_group ?? null,
        teamGender: team.gender ?? null,
        tournamentGender: tournament.gender ?? null,
      });
    })
    .map((tournament) => {
      const distanceMiles = tournamentDistances.get(tournament.id) ?? null;

      const score = calculateTournamentScore({
        activeAgeGroup: team.age_group ?? null,
        activeLevel: team.level ?? null,
        activeGender: team.gender ?? null,
        activeMatchFormat: team.match_format ?? null,

        tournamentAgeGroup: tournament.age_group ?? null,
        tournamentLevel: tournament.level ?? null,
        tournamentGender: tournament.gender ?? null,
        tournamentMatchFormat: tournament.match_format ?? null,

        distanceMiles,
        startDate: tournament.start_date ?? null,
        status: tournament.status ?? null,
      });

      return { tournament, distanceMiles, score };
    })
    .sort((a, b) =>
      compareScoredCandidates(
        { score: a.score, distanceMiles: a.distanceMiles, date: a.tournament.start_date },
        { score: b.score, distanceMiles: b.distanceMiles, date: b.tournament.start_date }
      )
    );

  const bestTournament = scoredTournaments[0]?.tournament ?? null;
  const bestTournamentScore = scoredTournaments[0]?.score ?? 0;
  const bestTournamentDistance = scoredTournaments[0]?.distanceMiles ?? null;

  const tournament: DashboardRecommendedTournament | null = bestTournament
    ? {
        id: bestTournament.id,
        name: bestTournament.name,
        badgeUrl: null,
        ageGroup: bestTournament.age_group ?? "",
        teams: bestTournament.max_teams ?? 0,
        date: bestTournament.start_date,
        location: bestTournament.location ?? "",
        distance: bestTournamentDistance,
        level: bestTournament.level ?? null,
        gender: bestTournament.gender ?? null,
        matchFormat: bestTournament.match_format ?? null,
        entryFee: bestTournament.entry_fee ?? null,
        score: bestTournamentScore,
        recommendation: "recommended",
      }
    : null;

  /* ---------------- PARTICIPATING TOURNAMENTS ---------------- */

  const participatingTournaments = participatingTournamentRequests
    .map((request) => first(request.tournaments))
    .filter((entry): entry is RawParticipatingTournament => entry !== null)
    .sort((a, b) => {
      const aDateTime = new Date(
        `${a.start_date}T${a.start_time ?? "00:00:00"}`
      ).getTime();
      const bDateTime = new Date(
        `${b.start_date}T${b.start_time ?? "00:00:00"}`
      ).getTime();

      return aDateTime - bDateTime;
    });

  const upcomingTournaments: DashboardTournament[] = participatingTournaments
    .slice(0, 5)
    .map((participatingTournament) => ({
      id: participatingTournament.id,
      name: participatingTournament.name,
      ageGroup: participatingTournament.age_group ?? null,
      startDate: participatingTournament.start_date,
      startTime: participatingTournament.start_time ?? null,
      endDate: participatingTournament.end_date ?? null,
      endTime: participatingTournament.end_time ?? null,
      location: participatingTournament.location ?? null,
    }));

  /* ---------------- UPCOMING MATCHES ---------------- */

  const upcomingMatches: DashboardMatch[] = matches.map((match) => {
    const home = match.home;
    const away = match.away;

    const conversation = first(match.match_conversations);
    const homeClub = first(home?.clubs);
    const awayClub = first(away?.clubs);

    const isHome = home?.id === team.id;
    const opponent = isHome ? away : home;
    const opponentClub = isHome ? awayClub : homeClub;

    const toMatchTeam = (
      side: RawMatchTeam | null,
      club: RawClub | null
    ): DashboardMatchTeam => ({
      id: side?.id ?? "",
      name: side?.name ?? "",
      clubName: club?.name ?? "",
      badgeUrl: club?.badge_url ?? null,
    });

    return {
      id: match.id,
      matchDate: match.match_date,
      kickOff: match.kick_off_time,
      location: match.location,
      conversationId: conversation?.id ?? null,
      isHome,
      opponent: {
        teamName: opponent?.name ?? "Opponent",
        clubName: opponentClub?.name ?? "Opponent",
        badgeUrl: opponentClub?.badge_url ?? null,
      },
      homeTeam: toMatchTeam(home, homeClub),
      awayTeam: toMatchTeam(away, awayClub),
    };
  });

  return {
    coachName,

    activeTeamId: team.id,
    teams: availableTeams.map(toSwitcherTeam),

    clubName: club?.name ?? "",
    teamName: team.name,
    badgeUrl: club?.badge_url ?? null,

    nextMatch: upcomingMatches[0] ?? null,
    nextTournament: upcomingTournaments[0] ?? null,

    upcomingMatches,
    upcomingTournaments,

    friendly,
    tournament,

    notifications,
    unreadNotifications,

    stats: {
      pendingRequests,
      awaitingResponses,
      upcomingMatches: upcomingMatchesCount,
      tournaments: upcomingTournaments.length,
    },

    statistics: statistics ?? null,
    recentResults: (recentResults ?? []) as RecentResult[],
  };
}

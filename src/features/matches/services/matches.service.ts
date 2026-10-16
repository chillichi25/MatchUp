import { supabase } from "@/lib/supabase/client";

import { getActiveTeam } from "@/features/teams/services/active-team.service";

import type {
  MatchDetail,
  MatchHistoryItem,
  MatchStatus,
  MatchSummary,
  MatchTeamSummary,
} from "../types";
import { computeOutcome } from "../utils/match-outcome";
import { isPastSlot, shortTime } from "../utils/match-time";

type RawClub = { name: string | null; badge_url: string | null };

type RawMatchTeam = {
  id: string;
  name: string;
  clubs: RawClub | RawClub[] | null;
};

type RawMatch = {
  id: string;
  status: string | null;
  match_date: string;
  kick_off_time: string | null;
  location: string | null;
  home_team_id?: string | null;
  away_team_id?: string | null;
  home_score?: number | null;
  away_score?: number | null;
  cancelled_by_team_id?: string | null;
  home: RawMatchTeam | null;
  away: RawMatchTeam | null;
  match_conversations: { id: string } | { id: string }[] | null;
};

const MATCH_SELECT = `
  id,
  status,
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
`;

function first<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toStatus(value: string | null): MatchStatus {
  return value === "completed" || value === "cancelled" ? value : "scheduled";
}

function toTeamSummary(team: RawMatchTeam | null): MatchTeamSummary {
  const club = first(team?.clubs);

  return {
    teamId: team?.id ?? "",
    teamName: team?.name ?? "",
    clubName: club?.name ?? "",
    badgeUrl: club?.badge_url ?? null,
  };
}

function normalise(match: RawMatch, activeTeamId: string): MatchSummary {
  const homeTeam = toTeamSummary(match.home);
  const awayTeam = toTeamSummary(match.away);
  const isHome = homeTeam.teamId === activeTeamId;
  const conversation = first(match.match_conversations);

  return {
    id: match.id,
    matchDate: match.match_date,
    kickOff: match.kick_off_time,
    location: match.location,
    status: toStatus(match.status),

    isHome,
    opponent: isHome ? awayTeam : homeTeam,
    homeTeam,
    awayTeam,

    conversationId: conversation?.id ?? null,
    isPast: isPastSlot(match.match_date, match.kick_off_time),
  };
}

/** Confirmed fixtures for the active team, soonest first. */
export async function getUpcomingMatches(): Promise<MatchSummary[]> {
  const team = await getActiveTeam();

  if (!team) {
    return [];
  }

  const { data, error } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .eq("status", "scheduled")
    .order("match_date", { ascending: true })
    .order("kick_off_time", { ascending: true });

  if (error) {
    console.error("UPCOMING MATCHES ERROR:", error);
    throw error;
  }

  return ((data ?? []) as unknown as RawMatch[]).map((match) =>
    normalise(match, team.id)
  );
}

/** A single fixture, only if the active team is one of the two participants. */
export async function getMatchDetail(
  matchId: string
): Promise<MatchDetail | null> {
  const team = await getActiveTeam();

  if (!team) {
    return null;
  }

  const { data, error } = await supabase
    .from("matches")
    .select(`${MATCH_SELECT}, home_score, away_score`)
    .eq("id", matchId)
    .maybeSingle();

  if (error || !data) {
    console.error("MATCH DETAIL ERROR:", error);
    return null;
  }

  const row = data as unknown as RawMatch;

  if (row.home?.id !== team.id && row.away?.id !== team.id) {
    return null;
  }

  return {
    ...normalise(row, team.id),
    activeTeamId: team.id,
    homeScore: row.home_score ?? null,
    awayScore: row.away_score ?? null,
  };
}

/** Completed and cancelled fixtures for the active team, most recent first. */
export async function getMatchHistory(): Promise<MatchHistoryItem[]> {
  const team = await getActiveTeam();

  if (!team) {
    return [];
  }

  const { data, error } = await supabase
    .from("matches")
    .select(`${MATCH_SELECT}, home_score, away_score, cancelled_by_team_id`)
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .in("status", ["completed", "cancelled"])
    .order("match_date", { ascending: false })
    .order("kick_off_time", { ascending: false });

  if (error || !data) {
    console.error("MATCH HISTORY ERROR:", error);
    return [];
  }

  return ((data as unknown as RawMatch[])).map((match) => {
    const summary = normalise(match, team.id);
    const isHome = summary.isHome;

    const myScore =
      match.status === "completed"
        ? ((isHome ? match.home_score : match.away_score) ?? null)
        : null;

    const opponentScore =
      match.status === "completed"
        ? ((isHome ? match.away_score : match.home_score) ?? null)
        : null;

    const result =
      match.status === "completed" &&
      myScore !== null &&
      opponentScore !== null
        ? computeOutcome(myScore, opponentScore)
        : null;

    return {
      id: match.id,
      status: match.status === "completed" ? "completed" : "cancelled",
      matchDate: match.match_date,
      kickOffTime: shortTime(match.kick_off_time) ?? "",
      location: match.location,

      opponent: {
        clubName: summary.opponent.clubName,
        teamName: summary.opponent.teamName,
        badgeUrl: summary.opponent.badgeUrl,
      },

      myScore,
      opponentScore,
      result,

      cancelledByMyTeam:
        match.status === "cancelled" && match.cancelled_by_team_id === team.id,
    };
  });
}

/** Cancels a confirmed fixture for the active team through `cancel_match`. */
export async function cancelMatch(
  matchId: string,
  cancellingTeamId: string
): Promise<void> {
  const { error } = await supabase.rpc("cancel_match", {
    p_match_id: matchId,
    p_cancelling_team_id: cancellingTeamId,
  });

  if (error) {
    console.error("CANCEL MATCH ERROR:", error);
    throw new Error(error.message || "The match could not be cancelled.");
  }
}

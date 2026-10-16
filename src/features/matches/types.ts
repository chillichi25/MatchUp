import type { MatchOutcome } from "./utils/match-outcome";

export type MatchStatus = "scheduled" | "completed" | "cancelled";

export type MatchTeamSummary = {
  teamId: string;
  teamName: string;
  clubName: string;
  badgeUrl: string | null;
};

export type MatchSummary = {
  id: string;
  matchDate: string;
  kickOff: string | null;
  location: string | null;
  status: MatchStatus;

  isHome: boolean;
  opponent: MatchTeamSummary;
  homeTeam: MatchTeamSummary;
  awayTeam: MatchTeamSummary;

  conversationId: string | null;
  isPast: boolean;
};

export type MatchDetail = MatchSummary & {
  activeTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
};

export type MatchHistoryItem = {
  id: string;
  status: "completed" | "cancelled";
  matchDate: string;
  kickOffTime: string;
  location: string | null;

  opponent: {
    clubName: string;
    teamName: string;
    badgeUrl: string | null;
  };

  myScore: number | null;
  opponentScore: number | null;
  result: MatchOutcome | null;

  cancelledByMyTeam: boolean;
};

import type { RecentResult } from "@/features/matches/services/recent-results.service";
import type { TeamStatistics } from "@/features/matches/utils/team-statistics";
import type { AppNotification } from "@/features/notifications/types";

export type DashboardSwitcherTeam = {
  id: string;
  name: string;
  age_group: string | null;
  gender: string | null;
  level: string | null;
  club: {
    id: string;
    name: string;
    badgeUrl: string | null;
    city: string | null;
  };
};

export type DashboardMatchTeam = {
  id: string;
  name: string;
  clubName: string;
  badgeUrl: string | null;
};

export type DashboardMatch = {
  id: string;
  matchDate: string;
  kickOff: string | null;
  location: string | null;
  conversationId: string | null;
  isHome: boolean;
  opponent: {
    teamName: string;
    clubName: string;
    badgeUrl: string | null;
  };
  homeTeam: DashboardMatchTeam;
  awayTeam: DashboardMatchTeam;
};

export type DashboardTournament = {
  id: string;
  name: string;
  ageGroup: string | null;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  location: string | null;
};

export type DashboardFriendly = {
  id: string;
  clubName: string;
  badgeUrl: string | null;
  teamName: string;
  ageGroup: string | null;
  level: string | null;
  gender: string | null;
  lookingFor: "home" | "away";
  matchFormat: string | null;
  matchDate: string;
  kickOff: string | null;
  location: string | null;
  distance: number | null;
  score: number;
  recommendation: "best-match";
};

export type DashboardRecommendedTournament = {
  id: string;
  name: string;
  badgeUrl: string | null;
  ageGroup: string;
  teams: number;
  date: string;
  location: string;
  distance: number | null;
  level: string | null;
  gender: string | null;
  matchFormat: string | null;
  entryFee: number | null;
  score: number;
  recommendation: "recommended";
};

export type DashboardStats = {
  pendingRequests: number;
  awaitingResponses: number;
  upcomingMatches: number;
  tournaments: number;
};

export type DashboardData = {
  coachName: string;
  activeTeamId: string;
  teams: DashboardSwitcherTeam[];

  clubName: string;
  teamName: string;
  badgeUrl: string | null;

  nextMatch: DashboardMatch | null;
  nextTournament: DashboardTournament | null;

  upcomingMatches: DashboardMatch[];
  upcomingTournaments: DashboardTournament[];

  friendly: DashboardFriendly | null;
  tournament: DashboardRecommendedTournament | null;

  notifications: AppNotification[];
  unreadNotifications: number;

  stats: DashboardStats;

  statistics: TeamStatistics | null;
  recentResults: RecentResult[];
};

import type {
  TournamentFilters,
  TournamentRequestStatus,
  TournamentStatus,
} from "./types";

export const TOURNAMENT_AGE_GROUPS = [
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
] as const;

export const TOURNAMENT_FILTER_AGE_GROUPS = [
  "U8",
  "U9",
  "U10",
  "U11",
  "U12",
  "U13",
  "U14",
  "U15",
  "U16",
  "U17",
  "U18",
  "Open Age",
] as const;

export const TOURNAMENT_CREATE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const TOURNAMENT_FILTER_LEVELS = [
  "Beginner",
  "Development",
  "Intermediate",
  "Competitive",
] as const;

export const TOURNAMENT_GENDERS = ["Boys", "Girls", "Mixed"] as const;

export const TOURNAMENT_CREATE_FORMATS = [
  "5v5",
  "7v7",
  "9v9",
  "11v11",
] as const;

export const TOURNAMENT_FILTER_FORMATS = [
  "3v3",
  "5v5",
  "7v7",
  "9v9",
  "11v11",
] as const;

export const TOURNAMENT_DISTANCES = ["5", "10", "20", "30", "50"] as const;

export const EMPTY_TOURNAMENT_FILTERS: TournamentFilters = {
  q: "",
  age: "",
  level: "",
  gender: "",
  format: "",
  date: "",
  location: "",
  distance: "",
  sort: "soonest",
};

export function hasActiveTournamentFilters(filters: TournamentFilters): boolean {
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

export function toTournamentStatus(value: string | null): TournamentStatus {
  return value === "closed" || value === "completed" || value === "cancelled"
    ? value
    : "open";
}

export function toTournamentRequestStatus(
  value: string | null
): TournamentRequestStatus {
  switch (value) {
    case "accepted":
    case "declined":
    case "removed":
    case "withdrawn":
    case "cancelled":
    case "expired":
      return value;
    default:
      return "pending";
  }
}

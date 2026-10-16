import type { MatchFormat, VenueType } from "./types";

export const AGE_GROUPS = [
  "U6",
  "U7",
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

export const LEVELS = [
  "Beginner",
  "Development",
  "Intermediate",
  "Competitive",
] as const;

export const GENDERS = ["Boys", "Girls", "Mixed"] as const;

export const MATCH_FORMATS: MatchFormat[] = [
  "3v3",
  "5v5",
  "7v7",
  "9v9",
  "11v11",
];

export const DISTANCES = ["5", "10", "20", "30", "50"] as const;

export const VENUE_OPTIONS: { value: VenueType; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "away", label: "Away" },
  { value: "either", label: "Either" },
];

export const VENUE_DESCRIPTIONS: Record<VenueType, string> = {
  home: "we have a venue",
  away: "we can travel",
  either: "home or away",
};

export const DEFAULT_MATCH_FORMAT: MatchFormat = "9v9";

export function resolveMatchFormat(value: string | null | undefined): MatchFormat {
  return MATCH_FORMATS.includes(value as MatchFormat)
    ? (value as MatchFormat)
    : DEFAULT_MATCH_FORMAT;
}

export function parseMatchFormat(value: string | null | undefined): MatchFormat | "" {
  return MATCH_FORMATS.includes(value as MatchFormat)
    ? (value as MatchFormat)
    : "";
}

export function formatVenueLabel(venueType: string | null): string {
  if (venueType === "either") {
    return "Home or Away";
  }

  if (!venueType) {
    return "";
  }

  return venueType.charAt(0).toUpperCase() + venueType.slice(1);
}

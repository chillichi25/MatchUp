import {
  AGE_GROUP_OPTIONS,
  MATCH_FORMAT_OPTIONS,
  TEAM_CATEGORY_OPTIONS,
  TEAM_LEVEL_OPTIONS,
} from "@/features/clubs/constants";

import type { MatchFormat, VenueType } from "./types";

// Reuse the team options so setup and filters stay consistent.
export const AGE_GROUPS = AGE_GROUP_OPTIONS;

export const LEVELS = TEAM_LEVEL_OPTIONS;

export const GENDERS = TEAM_CATEGORY_OPTIONS;

export const MATCH_FORMATS: MatchFormat[] = [
  ...MATCH_FORMAT_OPTIONS,
];

export const DISTANCES = ["5", "10", "20", "30", "50"] as const;

export const VENUE_OPTIONS: {
  value: VenueType;
  label: string;
}[] = [
  { value: "home", label: "Home" },
  { value: "away", label: "Away" },
  { value: "either", label: "Either" },
];

export const VENUE_DESCRIPTIONS: Record<VenueType, string> = {
  home: "We have a venue",
  away: "We can travel",
  either: "We can host or travel",
};

export const DEFAULT_MATCH_FORMAT: MatchFormat = "9v9";

export function resolveMatchFormat(
  value: string | null | undefined
): MatchFormat {
  return MATCH_FORMATS.includes(value as MatchFormat)
    ? (value as MatchFormat)
    : DEFAULT_MATCH_FORMAT;
}

export function parseMatchFormat(
  value: string | null | undefined
): MatchFormat | "" {
  return MATCH_FORMATS.includes(value as MatchFormat)
    ? (value as MatchFormat)
    : "";
}

export function formatVenueLabel(
  venueType: string | null
): string {
  if (venueType === "either") {
    return "Home or Away";
  }

  if (!venueType) {
    return "";
  }

  return venueType.charAt(0).toUpperCase() + venueType.slice(1);
}
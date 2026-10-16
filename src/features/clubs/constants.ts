export const AGE_GROUP_OPTIONS = [
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
  "Adult",
] as const;

export const MATCH_FORMAT_OPTIONS = [
  "5v5",
  "7v7",
  "9v9",
  "11v11",
] as const;

export const TEAM_CATEGORY_OPTIONS = [
  "Boys",
  "Girls",
  "Mixed",
  "Men",
  "Women",
] as const;

export const TEAM_LEVEL_OPTIONS = [
  "Beginner",
  "Development",
  "Intermediate",
  "Competitive",
  "Elite",
] as const;

export type AgeGroup = (typeof AGE_GROUP_OPTIONS)[number];
export type MatchFormat = (typeof MATCH_FORMAT_OPTIONS)[number];
export type TeamCategory = (typeof TEAM_CATEGORY_OPTIONS)[number];
export type TeamLevel = (typeof TEAM_LEVEL_OPTIONS)[number];

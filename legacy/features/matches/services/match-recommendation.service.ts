export type MatchScoreInput = {
  activeAgeGroup: string | null;
  activeLevel: string | null;
  activeGender: string | null;

  opportunityAgeGroup: string | null;
  opportunityLevel: string | null;
  opportunityGender: string | null;

  distanceMiles: number | null;

  activeMatchFormat: string | null;
  opportunityMatchFormat: string | null;

  activeVenueType: "home" | "away" | null;
opportunityVenueType: "home" | "away" | null;
};

export function calculateFriendlyScore(
  input: MatchScoreInput
) {
  let score = 0;

  // Age group
  if (
    input.activeAgeGroup &&
    input.opportunityAgeGroup &&
    input.activeAgeGroup ===
      input.opportunityAgeGroup
  ) {
    score += 30;
  }

  // Team level
  if (
    input.activeLevel &&
    input.opportunityLevel &&
    input.activeLevel ===
      input.opportunityLevel
  ) {
    score += 25;
  }

  // Category / gender
  if (
    input.activeGender &&
    input.opportunityGender &&
    input.activeGender ===
      input.opportunityGender
  ) {
    score += 20;
  }

  // Distance
  if (input.distanceMiles !== null) {
    if (input.distanceMiles <= 5) {
      score += 15;
    } else if (
      input.distanceMiles <= 10
    ) {
      score += 12;
    } else if (
      input.distanceMiles <= 20
    ) {
      score += 8;
    } else if (
      input.distanceMiles <= 30
    ) {
      score += 4;
    }
  }

  // Match format
if (
  input.activeMatchFormat &&
  input.opportunityMatchFormat &&
  input.activeMatchFormat ===
    input.opportunityMatchFormat
) {
  score += 5;
}

// Home / away compatibility
if (
  input.activeVenueType &&
  input.opportunityVenueType &&
  input.activeVenueType !== input.opportunityVenueType
) {
  score += 5;
}

  return score;
}
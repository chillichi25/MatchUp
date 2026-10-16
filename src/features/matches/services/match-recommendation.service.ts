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

/**
 * Ranks a friendly listing against the active team's profile. Level stays a
 * preference: a mismatch lowers the score but never rejects the listing.
 */
export function calculateFriendlyScore(input: MatchScoreInput): number {
  let score = 0;

  if (
    input.activeAgeGroup &&
    input.opportunityAgeGroup &&
    input.activeAgeGroup === input.opportunityAgeGroup
  ) {
    score += 30;
  }

  if (
    input.activeLevel &&
    input.opportunityLevel &&
    input.activeLevel === input.opportunityLevel
  ) {
    score += 25;
  }

  if (
    input.activeGender &&
    input.opportunityGender &&
    input.activeGender === input.opportunityGender
  ) {
    score += 20;
  }

  if (input.distanceMiles !== null) {
    if (input.distanceMiles <= 5) {
      score += 15;
    } else if (input.distanceMiles <= 10) {
      score += 12;
    } else if (input.distanceMiles <= 20) {
      score += 8;
    } else if (input.distanceMiles <= 30) {
      score += 4;
    }
  }

  if (
    input.activeMatchFormat &&
    input.opportunityMatchFormat &&
    input.activeMatchFormat === input.opportunityMatchFormat
  ) {
    score += 5;
  }

  if (
    input.activeVenueType &&
    input.opportunityVenueType &&
    input.activeVenueType !== input.opportunityVenueType
  ) {
    score += 5;
  }

  return score;
}

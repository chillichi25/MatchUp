export type ScoredCandidate = {
  score: number;
  distanceMiles: number | null;
  /** ISO date used as the final tie-breaker (match date / start date). */
  date: string;
};

/**
 * Orders recommended listings by relevance, then proximity, then soonest.
 * Listings with a known distance rank ahead of listings without one.
 */
export function compareScoredCandidates(
  a: ScoredCandidate,
  b: ScoredCandidate
): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  if (
    a.distanceMiles !== null &&
    b.distanceMiles !== null &&
    a.distanceMiles !== b.distanceMiles
  ) {
    return a.distanceMiles - b.distanceMiles;
  }

  if (a.distanceMiles !== null && b.distanceMiles === null) {
    return -1;
  }

  if (a.distanceMiles === null && b.distanceMiles !== null) {
    return 1;
  }

  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

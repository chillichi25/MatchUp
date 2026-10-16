export type TournamentScoreInput = {
  activeAgeGroup: string | null;
  activeLevel: string | null;
  activeGender: string | null;
  activeMatchFormat: string | null;

  tournamentAgeGroup: string | null;
  tournamentLevel: string | null;
  tournamentGender: string | null;
  tournamentMatchFormat: string | null;

  distanceMiles: number | null;

  startDate: string | null;
  status: string | null;
};

/**
 * Ranks an open tournament against the active team's profile. Age group and
 * gender compatibility are filtered before scoring; this only orders what is
 * already eligible.
 */
export function calculateTournamentScore(input: TournamentScoreInput): number {
  let score = 0;

  if (
    input.activeAgeGroup &&
    input.tournamentAgeGroup &&
    input.activeAgeGroup === input.tournamentAgeGroup
  ) {
    score += 30;
  }

  if (
    input.activeLevel &&
    input.tournamentLevel &&
    input.activeLevel === input.tournamentLevel
  ) {
    score += 20;
  }

  if (
    input.activeGender &&
    input.tournamentGender &&
    input.activeGender === input.tournamentGender
  ) {
    score += 15;
  }

  if (input.distanceMiles !== null) {
    if (input.distanceMiles <= 5) {
      score += 15;
    } else if (input.distanceMiles <= 10) {
      score += 12;
    } else if (input.distanceMiles <= 20) {
      score += 8;
    } else if (input.distanceMiles <= 50) {
      score += 4;
    }
  }

  if (
    input.activeMatchFormat &&
    input.tournamentMatchFormat &&
    input.activeMatchFormat === input.tournamentMatchFormat
  ) {
    score += 10;
  }

  if (input.startDate) {
    const tournamentDate = new Date(`${input.startDate}T00:00:00`).getTime();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tournamentDate >= today.getTime()) {
      score += 5;
    }
  }

  if (input.status === "open") {
    score += 5;
  }

  return score;
}

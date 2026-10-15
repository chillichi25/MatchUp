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

export function calculateTournamentScore(
  input: TournamentScoreInput
) {
  let score = 0;

  // Age group
  if (
    input.activeAgeGroup &&
    input.tournamentAgeGroup &&
    input.activeAgeGroup ===
      input.tournamentAgeGroup
  ) {
    score += 30;
  }

  // Level
  if (
    input.activeLevel &&
    input.tournamentLevel &&
    input.activeLevel ===
      input.tournamentLevel
  ) {
    score += 20;
  }

  // Category / gender
  if (
    input.activeGender &&
    input.tournamentGender &&
    input.activeGender ===
      input.tournamentGender
  ) {
    score += 15;
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
      input.distanceMiles <= 50
    ) {
      score += 4;
    }
  }

  // Match format
  if (
    input.activeMatchFormat &&
    input.tournamentMatchFormat &&
    input.activeMatchFormat ===
      input.tournamentMatchFormat
  ) {
    score += 10;
  }

  // Upcoming date
  if (input.startDate) {
    const tournamentDate =
      new Date(
        `${input.startDate}T00:00:00`
      ).getTime();

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    if (
      tournamentDate >=
      today.getTime()
    ) {
      score += 5;
    }
  }

  // Open tournament
  if (input.status === "open") {
    score += 5;
  }

  return score;
}
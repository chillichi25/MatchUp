export type TournamentEligibilityCheckInput = {
  teamAgeGroup: string | null;
  teamGender: string | null;
  teamLevel?: string | null;

  tournamentAgeGroup: string | null;
  tournamentGender: string | null;
  tournamentLevel?: string | null;

  /** Level is a preference unless the organiser enforces it (e.g. on edits). */
  enforceLevel?: boolean;
};

export type TournamentEligibilityResult = {
  eligible: boolean;
  reasons: string[];
};

function normalise(value: string | null | undefined): string | null {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

/**
 * Age group and gender are hard gates when both sides specify them; a "mixed"
 * tournament is open to everyone. Level is only enforced when explicitly
 * requested, matching the legacy join flow.
 */
export function checkTournamentEligibility(
  input: TournamentEligibilityCheckInput
): TournamentEligibilityResult {
  const reasons: string[] = [];

  const teamAge = normalise(input.teamAgeGroup);
  const tournamentAge = normalise(input.tournamentAgeGroup);

  if (teamAge && tournamentAge && teamAge !== tournamentAge) {
    reasons.push(`This tournament is for ${input.tournamentAgeGroup} teams.`);
  }

  const teamGender = normalise(input.teamGender);
  const tournamentGender = normalise(input.tournamentGender);

  if (
    teamGender &&
    tournamentGender &&
    tournamentGender !== "mixed" &&
    teamGender !== tournamentGender
  ) {
    reasons.push(
      `This tournament is for ${input.tournamentGender} teams.`
    );
  }

  if (input.enforceLevel) {
    const teamLevel = normalise(input.teamLevel);
    const tournamentLevel = normalise(input.tournamentLevel);

    if (teamLevel && tournamentLevel && teamLevel !== tournamentLevel) {
      reasons.push(
        `This tournament is for ${input.tournamentLevel} level teams.`
      );
    }
  }

  return { eligible: reasons.length === 0, reasons };
}

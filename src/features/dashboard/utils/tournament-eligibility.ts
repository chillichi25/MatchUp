export type TournamentEligibilityInput = {
  teamAgeGroup: string | null;
  tournamentAgeGroup: string | null;
  teamGender: string | null;
  tournamentGender: string | null;
};

/**
 * Age group must match when both sides specify one. A gendered team cannot
 * enter a tournament for a different gender; "mixed" tournaments remain open
 * to everyone.
 */
export function isTournamentEligible(
  input: TournamentEligibilityInput
): boolean {
  if (
    input.teamAgeGroup &&
    input.tournamentAgeGroup &&
    input.teamAgeGroup.trim().toLowerCase() !==
      input.tournamentAgeGroup.trim().toLowerCase()
  ) {
    return false;
  }

  const teamGender = input.teamGender?.trim().toLowerCase() ?? null;
  const tournamentGender =
    input.tournamentGender?.trim().toLowerCase() ?? null;

  if (
    teamGender &&
    tournamentGender &&
    tournamentGender !== "mixed" &&
    teamGender !== tournamentGender
  ) {
    return false;
  }

  return true;
}

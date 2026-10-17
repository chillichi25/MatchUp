import { checkTournamentEligibility } from "@/features/tournaments/utils/eligibility";

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
  return checkTournamentEligibility({
    teamAgeGroup: input.teamAgeGroup,
    tournamentAgeGroup: input.tournamentAgeGroup,
    teamGender: input.teamGender,
    tournamentGender: input.tournamentGender,
  }).eligible;
}

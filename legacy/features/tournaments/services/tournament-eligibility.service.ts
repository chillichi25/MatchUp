export type TournamentEligibilityInput = {
  teamAgeGroup: string | null;
  teamGender: string | null;
  teamMatchFormat: string | null;

  tournamentAgeGroup: string | null;
  tournamentGender: string | null;
  tournamentMatchFormat: string | null;

  teamLevel?: string | null;
  tournamentLevel?: string | null;

  enforceLevel?: boolean;
};

export type TournamentEligibilityResult = {
  eligible: boolean;
  reasons: string[];
};

function normalise(
  value: string | null | undefined
) {
  return (
    value?.trim().toLowerCase() ??
    null
  );
}

export function checkTournamentEligibility({
  teamAgeGroup,
  teamGender,

  tournamentAgeGroup,
  tournamentGender,

  teamLevel = null,
  tournamentLevel = null,

  enforceLevel = false,
}: TournamentEligibilityInput): TournamentEligibilityResult {
  const reasons: string[] = [];

  const activeAge =
    normalise(teamAgeGroup);

  const requiredAge =
    normalise(tournamentAgeGroup);

  const activeGender =
    normalise(teamGender);

  const requiredGender =
    normalise(tournamentGender);

  const activeLevel =
    normalise(teamLevel);

  const requiredLevel =
    normalise(tournamentLevel);

  // --------------------------------------------------
  // AGE
  // Hard eligibility rule
  // --------------------------------------------------

  if (
    requiredAge &&
    activeAge &&
    activeAge !== requiredAge
  ) {
    reasons.push(
      `This tournament is for ${tournamentAgeGroup} teams.`
    );
  }

  // --------------------------------------------------
  // GENDER
  // Mixed tournaments accept all genders.
  // --------------------------------------------------

  if (
    requiredGender &&
    activeGender &&
    requiredGender !== "mixed" &&
    activeGender !== requiredGender
  ) {
    reasons.push(
      `This tournament is for ${tournamentGender} teams.`
    );
  }

  // --------------------------------------------------
  // LEVEL
  // Soft during normal joining.
  // Can be enforced when validating tournament edits.
  // --------------------------------------------------

  if (
    enforceLevel &&
    requiredLevel &&
    activeLevel &&
    activeLevel !== requiredLevel
  ) {
    reasons.push(
      `This tournament is for ${tournamentLevel} level teams.`
    );
  }

  return {
    eligible:
      reasons.length === 0,
    reasons,
  };
}
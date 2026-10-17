import { describe, expect, it } from "@jest/globals";

import { checkTournamentEligibility } from "./eligibility";

describe("checkTournamentEligibility", () => {
  it("allows a matching age group and gender", () => {
    const result = checkTournamentEligibility({
      teamAgeGroup: "U12",
      tournamentAgeGroup: "U12",
      teamGender: "Boys",
      tournamentGender: "Boys",
    });

    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it("rejects a mismatched age group", () => {
    const result = checkTournamentEligibility({
      teamAgeGroup: "U12",
      tournamentAgeGroup: "U14",
      teamGender: "Boys",
      tournamentGender: "Boys",
    });

    expect(result.eligible).toBe(false);
    expect(result.reasons[0]).toContain("U14");
  });

  it("allows a mixed tournament for any gender", () => {
    const result = checkTournamentEligibility({
      teamAgeGroup: "U12",
      tournamentAgeGroup: "U12",
      teamGender: "Girls",
      tournamentGender: "Mixed",
    });

    expect(result.eligible).toBe(true);
  });

  it("rejects a mismatched gender", () => {
    const result = checkTournamentEligibility({
      teamAgeGroup: "U12",
      tournamentAgeGroup: "U12",
      teamGender: "Girls",
      tournamentGender: "Boys",
    });

    expect(result.eligible).toBe(false);
  });

  it("treats level as a preference unless enforced", () => {
    const preferred = checkTournamentEligibility({
      teamAgeGroup: "U12",
      tournamentAgeGroup: "U12",
      teamGender: "Boys",
      tournamentGender: "Boys",
      teamLevel: "Beginner",
      tournamentLevel: "Competitive",
    });

    expect(preferred.eligible).toBe(true);

    const enforced = checkTournamentEligibility({
      teamAgeGroup: "U12",
      tournamentAgeGroup: "U12",
      teamGender: "Boys",
      tournamentGender: "Boys",
      teamLevel: "Beginner",
      tournamentLevel: "Competitive",
      enforceLevel: true,
    });

    expect(enforced.eligible).toBe(false);
  });

  it("ignores missing values on either side", () => {
    const result = checkTournamentEligibility({
      teamAgeGroup: null,
      tournamentAgeGroup: "U12",
      teamGender: null,
      tournamentGender: "Boys",
    });

    expect(result.eligible).toBe(true);
  });
});

import { describe, expect, it } from "@jest/globals";

import { isTournamentEligible } from "./tournament-eligibility";

describe("isTournamentEligible", () => {
  it("rejects a mismatched age group", () => {
    expect(
      isTournamentEligible({
        teamAgeGroup: "U12",
        tournamentAgeGroup: "U14",
        teamGender: "Male",
        tournamentGender: "Male",
      })
    ).toBe(false);
  });

  it("matches age groups case-insensitively after trimming", () => {
    expect(
      isTournamentEligible({
        teamAgeGroup: " u12 ",
        tournamentAgeGroup: "U12",
        teamGender: null,
        tournamentGender: null,
      })
    ).toBe(true);
  });

  it("rejects a gendered team entering a different gender tournament", () => {
    expect(
      isTournamentEligible({
        teamAgeGroup: null,
        tournamentAgeGroup: null,
        teamGender: "Female",
        tournamentGender: "Male",
      })
    ).toBe(false);
  });

  it("allows any team into a mixed tournament", () => {
    expect(
      isTournamentEligible({
        teamAgeGroup: null,
        tournamentAgeGroup: null,
        teamGender: "Female",
        tournamentGender: "Mixed",
      })
    ).toBe(true);
  });

  it("allows an unspecified tournament profile", () => {
    expect(
      isTournamentEligible({
        teamAgeGroup: "U12",
        tournamentAgeGroup: null,
        teamGender: "Male",
        tournamentGender: null,
      })
    ).toBe(true);
  });
});

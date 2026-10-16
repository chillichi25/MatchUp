import { describe, expect, it } from "@jest/globals";

import {
  calculateTournamentScore,
  type TournamentScoreInput,
} from "./tournament-recommendation.service";

const base: TournamentScoreInput = {
  activeAgeGroup: "U12",
  activeLevel: "Intermediate",
  activeGender: "Male",
  activeMatchFormat: "11",
  tournamentAgeGroup: "U12",
  tournamentLevel: "Intermediate",
  tournamentGender: "Male",
  tournamentMatchFormat: "11",
  distanceMiles: null,
  startDate: "2099-06-01",
  status: "open",
};

describe("calculateTournamentScore", () => {
  it("scores a close, soon, open tournament highest", () => {
    expect(calculateTournamentScore({ ...base, distanceMiles: 2 })).toBe(
      30 + 20 + 15 + 15 + 10 + 5 + 5
    );
  });

  it("does not award the upcoming bonus for past tournaments", () => {
    const score = calculateTournamentScore({
      ...base,
      startDate: "2000-01-01",
    });

    expect(score).toBe(30 + 20 + 15 + 10 + 5);
  });

  it("does not award the open bonus for closed tournaments", () => {
    const score = calculateTournamentScore({ ...base, status: "closed" });

    expect(score).toBe(30 + 20 + 15 + 10 + 5);
  });

  it("rewards closer tournaments more", () => {
    expect(
      calculateTournamentScore({ ...base, distanceMiles: 5 })
    ).toBeGreaterThan(
      calculateTournamentScore({ ...base, distanceMiles: 40 })
    );
  });

  it("handles a null profile without throwing", () => {
    expect(
      calculateTournamentScore({
        activeAgeGroup: null,
        activeLevel: null,
        activeGender: null,
        activeMatchFormat: null,
        tournamentAgeGroup: null,
        tournamentLevel: null,
        tournamentGender: null,
        tournamentMatchFormat: null,
        distanceMiles: null,
        startDate: null,
        status: null,
      })
    ).toBe(0);
  });
});

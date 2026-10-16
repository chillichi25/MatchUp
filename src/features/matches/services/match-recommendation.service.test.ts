import { describe, expect, it } from "@jest/globals";

import {
  calculateFriendlyScore,
  type MatchScoreInput,
} from "./match-recommendation.service";

const base: MatchScoreInput = {
  activeAgeGroup: "U12",
  activeLevel: "Intermediate",
  activeGender: "Male",
  opportunityAgeGroup: "U12",
  opportunityLevel: "Intermediate",
  opportunityGender: "Male",
  distanceMiles: null,
  activeMatchFormat: "11",
  opportunityMatchFormat: "11",
  activeVenueType: "home",
  opportunityVenueType: "away",
};

describe("calculateFriendlyScore", () => {
  it("scores a perfect match across every dimension", () => {
    expect(
      calculateFriendlyScore({
        ...base,
        distanceMiles: 3,
      })
    ).toBe(30 + 25 + 20 + 15 + 5 + 5);
  });

  it("rewards closer opponents more than distant ones", () => {
    const near = calculateFriendlyScore({ ...base, distanceMiles: 5 });
    const mid = calculateFriendlyScore({ ...base, distanceMiles: 10 });
    const far = calculateFriendlyScore({ ...base, distanceMiles: 20 });
    const beyond = calculateFriendlyScore({ ...base, distanceMiles: 45 });

    expect(near).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(far);
    expect(far).toBeGreaterThan(beyond);
  });

  it("treats level and distance as preferences, not requirements", () => {
    const score = calculateFriendlyScore({
      ...base,
      activeLevel: "Advanced",
      opportunityLevel: "Beginner",
      distanceMiles: null,
    });

    expect(score).toBe(30 + 20 + 5 + 5);
  });

  it("only awards venue points when the sides are compatible", () => {
    expect(
      calculateFriendlyScore({
        ...base,
        activeVenueType: "home",
        opportunityVenueType: "home",
      })
    ).toBe(30 + 25 + 20 + 5);
  });

  it("handles an empty opportunity profile without throwing", () => {
    expect(
      calculateFriendlyScore({
        activeAgeGroup: null,
        activeLevel: null,
        activeGender: null,
        opportunityAgeGroup: null,
        opportunityLevel: null,
        opportunityGender: null,
        distanceMiles: null,
        activeMatchFormat: null,
        opportunityMatchFormat: null,
        activeVenueType: null,
        opportunityVenueType: null,
      })
    ).toBe(0);
  });
});

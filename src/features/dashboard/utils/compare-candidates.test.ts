import { describe, expect, it } from "@jest/globals";

import {
  compareScoredCandidates,
  type ScoredCandidate,
} from "./compare-candidates";

function candidate(overrides: Partial<ScoredCandidate>): ScoredCandidate {
  return {
    score: 0,
    distanceMiles: null,
    date: "2026-01-01",
    ...overrides,
  };
}

describe("compareScoredCandidates", () => {
  it("ranks the higher score first", () => {
    const high = candidate({ score: 80 });
    const low = candidate({ score: 20 });

    expect(compareScoredCandidates(high, low)).toBeLessThan(0);
    expect(compareScoredCandidates(low, high)).toBeGreaterThan(0);
  });

  it("breaks score ties by nearest distance", () => {
    const near = candidate({ score: 50, distanceMiles: 3 });
    const far = candidate({ score: 50, distanceMiles: 18 });

    expect(compareScoredCandidates(near, far)).toBeLessThan(0);
  });

  it("prefers a known distance over an unknown one", () => {
    const known = candidate({ score: 50, distanceMiles: 40 });
    const unknown = candidate({ score: 50, distanceMiles: null });

    expect(compareScoredCandidates(known, unknown)).toBeLessThan(0);
    expect(compareScoredCandidates(unknown, known)).toBeGreaterThan(0);
  });

  it("falls back to soonest date when score and distance tie", () => {
    const sooner = candidate({ score: 50, distanceMiles: null, date: "2026-02-01" });
    const later = candidate({ score: 50, distanceMiles: null, date: "2026-03-01" });

    expect(compareScoredCandidates(sooner, later)).toBeLessThan(0);
  });
});

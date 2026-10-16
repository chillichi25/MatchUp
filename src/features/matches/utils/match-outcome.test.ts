import { describe, expect, it } from "@jest/globals";

import { computeOutcome } from "./match-outcome";

describe("computeOutcome", () => {
  it("returns win when the team scores more", () => {
    expect(computeOutcome(3, 1)).toBe("win");
  });

  it("returns loss when the team scores fewer", () => {
    expect(computeOutcome(0, 2)).toBe("loss");
  });

  it("returns draw when scores are level", () => {
    expect(computeOutcome(2, 2)).toBe("draw");
    expect(computeOutcome(0, 0)).toBe("draw");
  });
});

import { describe, expect, it } from "@jest/globals";

import {
  formatAgeGroup,
  formatGender,
  formatMatchFormat,
  formatTeamDetails,
} from "./team-labels";

describe("formatAgeGroup", () => {
  it("expands U-codes", () => {
    expect(formatAgeGroup("U12")).toBe("Under 12");
    expect(formatAgeGroup("u7")).toBe("Under 7");
  });

  it("passes other values through and handles empties", () => {
    expect(formatAgeGroup("Adult")).toBe("Adult");
    expect(formatAgeGroup(null)).toBe("");
    expect(formatAgeGroup(undefined)).toBe("");
  });
});

describe("formatGender", () => {
  it("maps stored gender values to display labels", () => {
    expect(formatGender("male")).toBe("Boys");
    expect(formatGender("female")).toBe("Girls");
    expect(formatGender("mixed")).toBe("Mixed");
  });

  it("passes unknown values through and handles empties", () => {
    expect(formatGender("Men")).toBe("Men");
    expect(formatGender(null)).toBe("");
  });
});

describe("formatMatchFormat", () => {
  it("expands numeric formats", () => {
    expect(formatMatchFormat("7")).toBe("7v7");
    expect(formatMatchFormat("11")).toBe("11v11");
  });

  it("passes already-formatted values through", () => {
    expect(formatMatchFormat("9v9")).toBe("9v9");
    expect(formatMatchFormat(null)).toBe("");
  });
});

describe("formatTeamDetails", () => {
  it("joins available parts with a separator", () => {
    expect(
      formatTeamDetails({
        age_group: "U12",
        gender: "Boys",
        match_format: "7",
      })
    ).toBe("Under 12 · Boys · 7v7");
  });

  it("omits missing parts", () => {
    expect(
      formatTeamDetails({ age_group: null, gender: "Mixed", match_format: null })
    ).toBe("Mixed");
  });
});

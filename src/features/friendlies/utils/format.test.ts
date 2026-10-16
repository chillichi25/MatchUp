import { describe, expect, it } from "@jest/globals";

import { formatDistance, formatKickOff, formatDateWithYear } from "./format";

describe("formatDateWithYear", () => {
  it("renders a UK weekday, day, month and year", () => {
    expect(formatDateWithYear("2026-10-16")).toBe("Fri 16 Oct 2026");
  });

  it("does not shift the day across timezones for a date-only value", () => {
    expect(formatDateWithYear("2026-01-01")).toBe("Thu 1 Jan 2026");
  });
});

describe("formatKickOff", () => {
  it("trims Postgres seconds", () => {
    expect(formatKickOff("14:30:00")).toBe("14:30");
  });

  it("returns an empty string when no time is set", () => {
    expect(formatKickOff(null)).toBe("");
    expect(formatKickOff(undefined)).toBe("");
  });
});

describe("formatDistance", () => {
  it("returns null when no distance is known", () => {
    expect(formatDistance(null)).toBeNull();
    expect(formatDistance(undefined)).toBeNull();
  });

  it("renders sub-0.1 distances as a less-than label", () => {
    expect(formatDistance(0.05)).toBe("<0.1 mi");
  });

  it("rounds to one decimal place", () => {
    expect(formatDistance(3.44)).toBe("3.4 mi");
    expect(formatDistance(10)).toBe("10.0 mi");
  });
});

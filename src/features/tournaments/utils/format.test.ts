import { describe, expect, it } from "@jest/globals";

import {
  formatCapacity,
  formatEntryFee,
  formatTimeRange,
  formatTournamentDateRange,
} from "./format";

describe("formatTournamentDateRange", () => {
  it("renders a single day when there is no end date", () => {
    expect(formatTournamentDateRange("2026-10-16", null)).toBe("Fri 16 Oct");
  });

  it("renders a range across days", () => {
    expect(formatTournamentDateRange("2026-10-16", "2026-10-18")).toBe(
      "Fri 16 Oct – Sun 18 Oct"
    );
  });
});

describe("formatTimeRange", () => {
  it("trims seconds and joins the range", () => {
    expect(formatTimeRange("09:00:00", "17:00:00")).toBe("09:00 – 17:00");
  });

  it("handles a single time", () => {
    expect(formatTimeRange("09:00:00", null)).toBe("09:00");
  });
});

describe("formatEntryFee", () => {
  it("labels zero or missing fees as free", () => {
    expect(formatEntryFee(0)).toBe("Free");
    expect(formatEntryFee(null)).toBe("Free");
  });

  it("renders whole pounds without decimals", () => {
    expect(formatEntryFee(40)).toBe("£40");
  });

  it("renders pence to two decimals", () => {
    expect(formatEntryFee(25.5)).toBe("£25.50");
  });
});

describe("formatCapacity", () => {
  it("shows joined teams when there is no cap", () => {
    expect(formatCapacity(4, null)).toBe("4 joined");
  });

  it("shows accepted against maximum", () => {
    expect(formatCapacity(4, 16)).toBe("4/16 teams");
  });
});

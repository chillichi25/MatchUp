import { describe, expect, it } from "@jest/globals";

import { formatLongDate, formatTimestamp, getDateParts } from "./format-date";

describe("getDateParts", () => {
  it("returns uppercase weekday and month with a numeric day", () => {
    expect(getDateParts("2026-10-16")).toEqual({
      weekday: "FRI",
      day: "16",
      month: "OCT",
    });
  });

  it("does not shift the day across timezones", () => {
    expect(getDateParts("2026-01-01").day).toBe("1");
    expect(getDateParts("2026-12-31").month).toBe("DEC");
  });
});

describe("formatLongDate", () => {
  it("formats a readable date-only value", () => {
    expect(formatLongDate("2026-10-16")).toBe("Fri 16 Oct");
  });
});

describe("formatTimestamp", () => {
  it("formats a timestamp with zero-padded time", () => {
    const formatted = formatTimestamp(new Date(2026, 5, 3, 9, 5).toISOString());
    expect(formatted).toBe("3 Jun, 09:05");
  });
});

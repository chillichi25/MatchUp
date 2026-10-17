import { describe, expect, it } from "@jest/globals";

import { formatMatchSchedule, formatMessageTime } from "./format";

describe("formatMessageTime", () => {
  it("renders a zero-padded local HH:mm", () => {
    const iso = new Date(2026, 9, 16, 9, 5, 0).toISOString();
    expect(formatMessageTime(iso)).toBe("09:05");
  });
});

describe("formatMatchSchedule", () => {
  it("joins the date and kick-off time", () => {
    expect(formatMatchSchedule("2026-10-16", "14:30:00")).toBe(
      "Fri 16 Oct · 14:30"
    );
  });

  it("omits missing parts", () => {
    expect(formatMatchSchedule("2026-10-16", null)).toBe("Fri 16 Oct");
    expect(formatMatchSchedule(null, null)).toBe("");
  });
});

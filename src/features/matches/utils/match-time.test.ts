import { describe, expect, it } from "@jest/globals";

import {
  addDaysIso,
  isPastSlot,
  nowTimeIso,
  shortTime,
  todayIso,
} from "./match-time";

describe("todayIso", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("nowTimeIso", () => {
  it("returns an HH:mm:ss string", () => {
    expect(nowTimeIso()).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe("addDaysIso", () => {
  it("moves forward and backward by whole days", () => {
    expect(addDaysIso(1) > todayIso()).toBe(true);
    expect(addDaysIso(-1) < todayIso()).toBe(true);
    expect(addDaysIso(0)).toBe(todayIso());
  });
});

describe("isPastSlot", () => {
  it("treats clearly past dates as past", () => {
    expect(isPastSlot("2000-01-01", "12:00:00")).toBe(true);
  });

  it("treats clearly future dates as not past", () => {
    expect(isPastSlot("2999-01-01", "12:00:00")).toBe(false);
  });

  it("checks the time when the date is today", () => {
    expect(isPastSlot(todayIso(), "00:00:00")).toBe(true);
    expect(isPastSlot(todayIso(), "23:59:59")).toBe(false);
  });

  it("treats a missing date as not past", () => {
    expect(isPastSlot("", null)).toBe(false);
  });
});

describe("shortTime", () => {
  it("trims seconds and handles null", () => {
    expect(shortTime("14:30:00")).toBe("14:30");
    expect(shortTime(null)).toBeNull();
  });
});

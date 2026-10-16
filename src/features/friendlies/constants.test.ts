import { describe, expect, it } from "@jest/globals";

import {
  DEFAULT_MATCH_FORMAT,
  formatVenueLabel,
  parseMatchFormat,
  resolveMatchFormat,
} from "./constants";

describe("resolveMatchFormat", () => {
  it("keeps a supported format", () => {
    expect(resolveMatchFormat("11v11")).toBe("11v11");
  });

  it("falls back to the default for null, empty or unknown values", () => {
    expect(resolveMatchFormat(null)).toBe(DEFAULT_MATCH_FORMAT);
    expect(resolveMatchFormat(undefined)).toBe(DEFAULT_MATCH_FORMAT);
    expect(resolveMatchFormat("")).toBe(DEFAULT_MATCH_FORMAT);
    expect(resolveMatchFormat("12v12")).toBe(DEFAULT_MATCH_FORMAT);
  });
});

describe("parseMatchFormat", () => {
  it("returns an empty string for unsupported values", () => {
    expect(parseMatchFormat("12v12")).toBe("");
    expect(parseMatchFormat(null)).toBe("");
  });

  it("returns a supported format unchanged", () => {
    expect(parseMatchFormat("7v7")).toBe("7v7");
  });
});

describe("formatVenueLabel", () => {
  it("capitalises home and away", () => {
    expect(formatVenueLabel("home")).toBe("Home");
    expect(formatVenueLabel("away")).toBe("Away");
  });

  it("expands either to a readable label", () => {
    expect(formatVenueLabel("either")).toBe("Home or Away");
  });

  it("returns an empty string for no venue", () => {
    expect(formatVenueLabel(null)).toBe("");
  });
});

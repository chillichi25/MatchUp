import { describe, expect, it } from "@jest/globals";

import { cn } from "./utils";

describe("cn", () => {
  it("joins truthy class names with a single space", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignores false, null and undefined values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns an empty string when nothing is provided", () => {
    expect(cn()).toBe("");
  });
});

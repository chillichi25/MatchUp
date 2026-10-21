import { describe, expect, it } from "@jest/globals";

import {
  isPlanId,
  planFromEntitlements,
  planFromMetadata,
  resolvePlan,
} from "./resolve";

describe("isPlanId", () => {
  it("accepts known plan ids", () => {
    expect(isPlanId("free")).toBe(true);
    expect(isPlanId("club_pro")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isPlanId("enterprise")).toBe(false);
    expect(isPlanId(undefined)).toBe(false);
  });
});

describe("planFromMetadata", () => {
  it("returns the stored plan", () => {
    expect(planFromMetadata({ subscription_plan: "club" })).toBe("club");
  });

  it("defaults to free for missing or invalid values", () => {
    expect(planFromMetadata(null)).toBe("free");
    expect(planFromMetadata({})).toBe("free");
    expect(planFromMetadata({ subscription_plan: "gold" })).toBe("free");
  });
});

describe("planFromEntitlements", () => {
  it("returns free when nothing is active", () => {
    expect(planFromEntitlements(null)).toBe("free");
    expect(planFromEntitlements({})).toBe("free");
  });

  it("returns the highest active entitlement", () => {
    expect(planFromEntitlements({ team_pro: {}, club_pro: {} })).toBe(
      "club_pro"
    );
    expect(planFromEntitlements({ club: {}, team_pro: {} })).toBe("club");
  });

  it("ignores inactive entitlements", () => {
    expect(planFromEntitlements({ team_pro: {}, club: null })).toBe(
      "team_pro"
    );
  });
});

describe("resolvePlan", () => {
  it("trusts store entitlements when billing is configured", () => {
    expect(
      resolvePlan({
        billingConfigured: true,
        activeEntitlements: {},
        metadata: { subscription_plan: "club" },
      })
    ).toBe("free");
  });

  it("falls back to profile metadata when billing is not configured", () => {
    expect(
      resolvePlan({
        billingConfigured: false,
        activeEntitlements: {},
        metadata: { subscription_plan: "team_pro" },
      })
    ).toBe("team_pro");
  });
});

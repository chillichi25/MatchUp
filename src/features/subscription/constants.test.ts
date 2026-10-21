import { describe, expect, it } from "@jest/globals";

import {
  PAID_PLANS,
  PLAN_BY_ID,
  PLANS,
} from "./constants";

describe("subscription plan catalogue", () => {
  it("lists the four plans in display order", () => {
    expect(PLANS.map((plan) => plan.id)).toEqual([
      "free",
      "team_pro",
      "club",
      "club_pro",
    ]);
  });

  it("matches the published monthly prices", () => {
    expect(PLANS.map((plan) => plan.priceLabel)).toEqual([
      "£0",
      "£5.99",
      "£19.99",
      "£34.99",
    ]);
    expect(PLANS.every((plan) => plan.pricePeriod === "/ month")).toBe(true);
  });

  it("gives every paid plan an entitlement and at least one product", () => {
    for (const plan of PAID_PLANS) {
      expect(plan.entitlementId).toBeTruthy();
      expect(plan.productIds.length).toBeGreaterThan(0);
    }

    expect(PLAN_BY_ID.free.entitlementId).toBeNull();
    expect(PLAN_BY_ID.free.productIds).toHaveLength(0);
  });

  it("uses unique product identifiers", () => {
    const ids = PAID_PLANS.flatMap((plan) => plan.productIds);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ranks plans in ascending order", () => {
    expect(PLANS.map((plan) => plan.rank)).toEqual([0, 1, 2, 3]);
  });
});

export type PlanId = "free" | "team_pro" | "club" | "club_pro";

export type PlanIconName = "leaf" | "star" | "shield" | "crown";

export type SubscriptionPlan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  pricePeriod: string;
  allowanceLabel: string;
  features: readonly string[];
  ctaLabel: string;
  accent: string;
  soft: string;
  icon: PlanIconName;
  entitlementId: string | null;
  productIds: readonly string[];
  rank: number;
};

export type PurchaseFailureReason =
  | "cancelled"
  | "pending"
  | "already-owned"
  | "unavailable"
  | "network"
  | "unknown";

export class PurchaseError extends Error {
  readonly reason: PurchaseFailureReason;

  constructor(reason: PurchaseFailureReason, message: string) {
    super(message);
    this.name = "PurchaseError";
    this.reason = reason;
  }
}

export type SubscriptionStatus = {
  configured: boolean;
  planId: PlanId;
};

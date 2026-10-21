import { PAID_PLANS, PLAN_BY_ID, PLANS } from "../constants";
import type { PlanId } from "../types";

export function isPlanId(value: unknown): value is PlanId {
  return PLANS.some((plan) => plan.id === value);
}

export function planFromMetadata(
  metadata: Record<string, unknown> | null | undefined
): PlanId {
  const value = metadata?.subscription_plan;
  return isPlanId(value) ? value : "free";
}

export function planFromEntitlements(
  activeEntitlements: Record<string, unknown> | null | undefined
): PlanId {
  if (!activeEntitlements) {
    return "free";
  }

  const ordered = [...PAID_PLANS].sort(
    (left, right) => right.rank - left.rank
  );

  for (const plan of ordered) {
    if (plan.entitlementId && activeEntitlements[plan.entitlementId]) {
      return plan.id;
    }
  }

  return "free";
}

export function resolvePlan(input: {
  billingConfigured: boolean;
  activeEntitlements?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}): PlanId {
  if (input.billingConfigured) {
    return planFromEntitlements(input.activeEntitlements);
  }

  return planFromMetadata(input.metadata);
}

export function isDowngrade(from: PlanId, to: PlanId): boolean {
  return PLAN_BY_ID[from].rank > PLAN_BY_ID[to].rank;
}

import type { CustomerInfo } from "react-native-purchases";

import { supabase } from "@/lib/supabase/client";

import type { PlanId } from "../types";
import {
  planFromEntitlements,
  planFromMetadata,
  resolvePlan,
} from "../utils/resolve";

export async function getProfileSubscriptionPlan(): Promise<PlanId> {
  const { data } = await supabase.auth.getSession();
  return planFromMetadata(data.session?.user.user_metadata ?? null);
}

export async function saveSubscriptionPlan(planId: PlanId): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const currentPlan = planFromMetadata(data.session?.user.user_metadata ?? null);

  if (currentPlan === planId) {
    return false;
  }

  const { error } = await supabase.auth.updateUser({
    data: { subscription_plan: planId },
  });

  if (error) {
    console.error("SUBSCRIPTION PLAN SAVE ERROR:", error);
    throw new Error("We couldn't save your plan.");
  }

  return true;
}

export function planFromCustomerInfo(
  customerInfo: CustomerInfo | null | undefined,
  billingConfigured: boolean,
  metadata?: Record<string, unknown> | null
): PlanId {
  return resolvePlan({
    billingConfigured,
    activeEntitlements: customerInfo?.entitlements.active,
    metadata,
  });
}

export async function syncPlanFromCustomerInfo(
  customerInfo: CustomerInfo
): Promise<PlanId> {
  const planId = planFromEntitlements(customerInfo.entitlements.active);

  try {
    await saveSubscriptionPlan(planId);
  } catch (error) {
    console.error("SUBSCRIPTION PLAN SYNC ERROR:", error);
  }

  return planId;
}

import { useEffect, type ReactNode } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/features/auth/providers/auth-provider";

import {
  SUBSCRIPTION_QUERY_KEYS,
  type SubscriptionStatusData,
} from "../hooks/use-subscription";
import {
  clearBillingUser,
  configureBilling,
  identifyBillingUser,
  isBillingConfigured,
  onCustomerInfoChanged,
} from "../services/revenuecat.service";
import { syncPlanFromCustomerInfo } from "../services/subscription.service";
import { planFromEntitlements } from "../utils/resolve";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isBillingConfigured()) {
      return;
    }

    if (userId) {
      void identifyBillingUser(userId);
      return;
    }

    void clearBillingUser();
  }, [userId]);

  useEffect(() => {
    if (!isBillingConfigured() || !configureBilling()) {
      return;
    }

    return onCustomerInfoChanged((customerInfo) => {
      const planId = planFromEntitlements(customerInfo.entitlements.active);

      queryClient.setQueryData<SubscriptionStatusData>(
        SUBSCRIPTION_QUERY_KEYS.status,
        (previous) =>
          previous
            ? { ...previous, planId, customerInfo }
            : previous
      );

      void syncPlanFromCustomerInfo(customerInfo);
    });
  }, [queryClient]);

  return <>{children}</>;
}

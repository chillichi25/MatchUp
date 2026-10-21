import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CustomerInfo, PurchasesOffering } from "react-native-purchases";

import { useSession } from "@/features/auth/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";

import {
  fetchCustomerInfo,
  fetchOffering,
  identifyBillingUser,
  isBillingConfigured,
  openBillingManagement,
  purchasePlan,
  restoreBillingPurchases,
} from "../services/revenuecat.service";
import {
  getProfileSubscriptionPlan,
  planFromCustomerInfo,
  syncPlanFromCustomerInfo,
} from "../services/subscription.service";
import type { PlanId } from "../types";
import { planFromEntitlements, planFromMetadata } from "../utils/resolve";

export const SUBSCRIPTION_QUERY_KEYS = {
  status: ["subscription", "status"] as const,
};

export type SubscriptionStatusData = {
  configured: boolean;
  planId: PlanId;
  customerInfo: CustomerInfo | null;
  offering: PurchasesOffering | null;
};

async function loadSubscriptionStatus(): Promise<SubscriptionStatusData> {
  if (!isBillingConfigured()) {
    return {
      configured: false,
      planId: await getProfileSubscriptionPlan(),
      customerInfo: null,
      offering: null,
    };
  }

  const [customerInfo, offering] = await Promise.all([
    (async () => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;

      if (userId) {
        await identifyBillingUser(userId);
      }

      return fetchCustomerInfo();
    })(),
    fetchOffering().catch((error) => {
      console.error("REVENUECAT OFFERINGS ERROR:", error);
      return null;
    }),
  ]);

  return {
    configured: true,
    planId: planFromCustomerInfo(customerInfo, true),
    customerInfo,
    offering,
  };
}

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: SUBSCRIPTION_QUERY_KEYS.status,
    queryFn: loadSubscriptionStatus,
    staleTime: 60_000,
  });
}

export function useCurrentPlan(): PlanId {
  const { session } = useSession();
  const status = useSubscriptionStatus();

  return (
    status.data?.planId ??
    planFromMetadata(session?.user.user_metadata ?? null)
  );
}

function applyCustomerInfo(
  queryClient: ReturnType<typeof useQueryClient>,
  customerInfo: CustomerInfo
) {
  queryClient.setQueryData<SubscriptionStatusData>(
    SUBSCRIPTION_QUERY_KEYS.status,
    (previous) =>
      previous
        ? {
            ...previous,
            planId: planFromEntitlements(customerInfo.entitlements.active),
            customerInfo,
          }
        : previous
  );
}

export function usePurchasePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: PlanId) => purchasePlan(planId),
    onSuccess: async (customerInfo) => {
      applyCustomerInfo(queryClient, customerInfo);
      await syncPlanFromCustomerInfo(customerInfo);
      await queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_QUERY_KEYS.status,
      });
    },
  });
}

export function useRestorePurchases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => restoreBillingPurchases(),
    onSuccess: async (customerInfo) => {
      applyCustomerInfo(queryClient, customerInfo);
      await syncPlanFromCustomerInfo(customerInfo);
      await queryClient.invalidateQueries({
        queryKey: SUBSCRIPTION_QUERY_KEYS.status,
      });
    },
  });
}

export function useManageSubscription() {
  return useMutation({
    mutationFn: () => openBillingManagement(),
  });
}

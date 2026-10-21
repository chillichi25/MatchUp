import { useState } from "react";
import {
  FlatList,
  Linking,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import { toast } from "sonner-native";

import { BackButton } from "@/components/ui/back-button";
import { ScreenScroll } from "@/components/ui/screen";
import { env } from "@/lib/config";

import { PlanBadge } from "@/features/subscription/components/plan-badge";
import { PlanCard } from "@/features/subscription/components/plan-card";
import { PLANS, PLAN_BY_ID } from "@/features/subscription/constants";
import {
  useCurrentPlan,
  useManageSubscription,
  usePurchasePlan,
  useRestorePurchases,
  useSubscriptionStatus,
} from "@/features/subscription/hooks/use-subscription";
import { findPackageForPlan } from "@/features/subscription/services/revenuecat.service";
import { PurchaseError, type SubscriptionPlan } from "@/features/subscription/types";
import { planFromEntitlements } from "@/features/subscription/utils/resolve";

const CARD_GAP = 12;

export default function SubscriptionScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 48, 340);

  const status = useSubscriptionStatus();
  const currentPlanId = useCurrentPlan();
  const purchase = usePurchasePlan();
  const restore = useRestorePurchases();
  const manage = useManageSubscription();

  const [activeIndex, setActiveIndex] = useState(0);

  const configured = status.data?.configured ?? false;
  const offering = status.data?.offering ?? null;
  const isChecking = status.isLoading;

  function ctaFor(plan: SubscriptionPlan) {
    if (plan.id === currentPlanId) {
      return { label: "Current plan", disabled: true };
    }

    if (isChecking) {
      return { label: "Checking…", disabled: true };
    }

    if (!configured) {
      return { label: "Billing unavailable", disabled: true };
    }

    if (plan.id === "free") {
      return { label: "Manage subscription", disabled: false };
    }

    if (currentPlanId === "free") {
      return { label: plan.ctaLabel, disabled: false };
    }

    return { label: `Switch to ${plan.name}`, disabled: false };
  }

  function handleSelect(plan: SubscriptionPlan) {
    const { disabled } = ctaFor(plan);

    if (disabled) {
      return;
    }

    if (plan.id === "free") {
      manage.mutate(undefined, {
        onError: () => {
          toast.error("We couldn't open your subscription settings.");
        },
      });
      return;
    }

    purchase.mutate(plan.id, {
      onSuccess: (customerInfo) => {
        const nextPlan = planFromEntitlements(
          customerInfo.entitlements.active
        );
        toast.success(
          nextPlan === plan.id
            ? `You're on ${PLAN_BY_ID[nextPlan].name}`
            : "Purchase complete"
        );
      },
      onError: (error) => {
        if (error instanceof PurchaseError && error.reason === "cancelled") {
          return;
        }

        toast.error(
          error instanceof Error
            ? error.message
            : "The purchase couldn't be completed."
        );
      },
    });
  }

  function handleRestore() {
    restore.mutate(undefined, {
      onSuccess: (customerInfo) => {
        const restoredPlan = planFromEntitlements(
          customerInfo.entitlements.active
        );

        toast.success(
          restoredPlan === "free"
            ? "No active subscription found."
            : `Restored ${PLAN_BY_ID[restoredPlan].name}`
        );
      },
      onError: () => {
        toast.error("We couldn't restore your purchases.");
      },
    });
  }

  function handleScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / (cardWidth + CARD_GAP));
    setActiveIndex(Math.max(0, Math.min(PLANS.length - 1, index)));
  }

  return (
    <ScreenScroll contentClassName="pb-16 pt-3">
      <View className="px-5">
        <BackButton fallbackHref="/profile" />

        <Text className="mt-1 text-[24px] font-bold tracking-tight text-slate-950">
          Choose your plan
        </Text>
        <Text className="mt-1.5 text-[13px] leading-5 text-slate-500">
          Simple monthly plans for individual teams and growing clubs.
        </Text>

        <View className="mt-4 flex-row items-center gap-2">
          <Text className="text-[12px] text-slate-500">Your plan</Text>
          <PlanBadge planId={currentPlanId} />
        </View>

        {status.isError ? (
          <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <Text className="flex-1 pr-3 text-[12px] leading-[18px] text-amber-800">
              {"We couldn't check your subscription. Some prices may be out of date."}
            </Text>
            <Text
              onPress={() => status.refetch()}
              accessibilityRole="button"
              className="text-[12px] font-semibold text-amber-900 underline"
            >
              Retry
            </Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={PLANS}
        keyExtractor={(plan) => plan.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + CARD_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 8,
          gap: CARD_GAP,
          alignItems: "stretch",
        }}
        renderItem={({ item }) => {
          const cta = ctaFor(item);

          return (
            <PlanCard
              plan={item}
              isCurrent={item.id === currentPlanId}
              ctaLabel={cta.label}
              ctaDisabled={cta.disabled}
              ctaLoading={
                purchase.isPending && purchase.variables === item.id
              }
              width={cardWidth}
              storePrice={
                findPackageForPlan(offering, item.id)?.product.priceString ??
                null
              }
              onPress={() => handleSelect(item)}
            />
          );
        }}
      />

      <View className="mt-2 flex-row items-center justify-center gap-1.5">
        {PLANS.map((plan, index) => (
          <View
            key={plan.id}
            className={
              index === activeIndex
                ? "h-1.5 w-5 rounded-full bg-[#00B83F]"
                : "h-1.5 w-1.5 rounded-full bg-slate-300"
            }
          />
        ))}
      </View>

      <View className="mt-6 px-5">
        {configured ? (
          <Pressable
            onPress={handleRestore}
            disabled={restore.isPending}
            accessibilityRole="button"
            accessibilityState={{ busy: restore.isPending }}
            className="self-center py-2"
          >
            <Text className="text-[12.5px] font-semibold text-[#00B83F]">
              {restore.isPending ? "Restoring…" : "Restore purchases"}
            </Text>
          </Pressable>
        ) : null}

        <Text className="mt-4 text-center text-[11px] leading-[17px] text-slate-400">
          Subscriptions renew automatically each month until cancelled. Manage
          or cancel anytime in your App Store or Google Play account. Features
          are rolling out gradually.
        </Text>

        {env.termsUrl || env.privacyUrl ? (
          <View className="mt-2 flex-row items-center justify-center gap-4">
            {env.termsUrl ? (
              <Text
                onPress={() => Linking.openURL(env.termsUrl)}
                accessibilityRole="link"
                className="text-[11px] font-medium text-slate-500 underline"
              >
                Terms
              </Text>
            ) : null}
            {env.privacyUrl ? (
              <Text
                onPress={() => Linking.openURL(env.privacyUrl)}
                accessibilityRole="link"
                className="text-[11px] font-medium text-slate-500 underline"
              >
                Privacy
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScreenScroll>
  );
}

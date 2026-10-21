import {
  CircleCheck,
  Crown,
  Leaf,
  ShieldCheck,
  Star,
  type LucideIcon,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { cn } from "@/lib/utils";

import type { PlanIconName, SubscriptionPlan } from "../types";

const PLAN_ICONS: Record<PlanIconName, LucideIcon> = {
  leaf: Leaf,
  star: Star,
  shield: ShieldCheck,
  crown: Crown,
};

type PlanCardProps = {
  plan: SubscriptionPlan;
  isCurrent: boolean;
  ctaLabel: string;
  ctaDisabled: boolean;
  ctaLoading: boolean;
  width: number;
  storePrice: string | null;
  onPress: () => void;
};

export function PlanCard({
  plan,
  isCurrent,
  ctaLabel,
  ctaDisabled,
  ctaLoading,
  width,
  storePrice,
  onPress,
}: PlanCardProps) {
  const Icon = PLAN_ICONS[plan.icon];
  const isOutlineCta = plan.id === "free";
  const price = storePrice ?? plan.priceLabel;
  const showAllowance = plan.id === "club" || plan.id === "club_pro";

  return (
    <View
      style={{ width }}
      accessibilityLabel={`${plan.name} plan, ${price} ${plan.pricePeriod}`}
      className={cn(
        "rounded-3xl border bg-white p-5",
        isCurrent ? "border-[#00B83F]" : "border-slate-200"
      )}
    >
      <View className="flex-row items-start justify-between">
        <View
          style={{ backgroundColor: plan.soft }}
          className="h-14 w-14 items-center justify-center rounded-full"
        >
          <Icon size={26} color={plan.accent} strokeWidth={2.2} />
        </View>

        {isCurrent ? (
          <View
            style={{ backgroundColor: plan.soft }}
            className="rounded-full px-2.5 py-1"
          >
            <Text
              style={{ color: plan.accent }}
              className="text-[10px] font-bold uppercase tracking-wide"
            >
              Current plan
            </Text>
          </View>
        ) : null}
      </View>

      <Text
        style={{ color: plan.accent }}
        className="mt-4 text-[15px] font-bold uppercase tracking-[1px]"
      >
        {plan.name}
      </Text>
      <Text className="mt-1 text-[12.5px] text-slate-500">
        {plan.tagline}
      </Text>

      <View className="mt-4 flex-row items-end">
        <Text className="text-[30px] font-bold leading-none tracking-tight text-slate-950">
          {price}
        </Text>
        <Text className="ml-1.5 pb-0.5 text-[12px] text-slate-500">
          {plan.pricePeriod}
        </Text>
      </View>

      {showAllowance ? (
        <Text
          style={{ color: plan.accent }}
          className="mt-2 text-[12px] font-semibold"
        >
          {plan.allowanceLabel}
        </Text>
      ) : null}

      <View className="my-4 h-px bg-slate-100" />

      <View className="gap-2">
        {plan.features.map((feature) => (
          <View key={feature} className="flex-row items-start gap-2">
            <CircleCheck
              size={16}
              color={plan.accent}
              strokeWidth={2.2}
              style={{ marginTop: 1 }}
            />
            <Text className="flex-1 text-[12.5px] leading-[18px] text-slate-600">
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-1" />

      <Pressable
        onPress={onPress}
        disabled={ctaDisabled || ctaLoading}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        accessibilityState={{
          disabled: ctaDisabled || ctaLoading,
          busy: ctaLoading,
          selected: isCurrent,
        }}
        style={
          isOutlineCta || ctaDisabled
            ? undefined
            : { backgroundColor: plan.accent, borderColor: plan.accent }
        }
        className={cn(
          "mt-6 flex-row items-center justify-center rounded-2xl border px-4 py-3.5",
          ctaDisabled
            ? "border-slate-200 bg-slate-100"
            : isOutlineCta
              ? "border-[#00B83F] bg-white"
              : "",
          (ctaDisabled || ctaLoading) && "opacity-80"
        )}
      >
        {ctaLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text
            style={{
              color: ctaDisabled
                ? "#64748B"
                : isOutlineCta
                  ? "#00B83F"
                  : "#FFFFFF",
            }}
            className="text-[13.5px] font-semibold"
          >
            {ctaLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

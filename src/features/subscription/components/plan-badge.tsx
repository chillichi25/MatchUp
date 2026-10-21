import { Text, View } from "react-native";

import { PLAN_BY_ID } from "../constants";
import type { PlanId } from "../types";

export function PlanBadge({ planId }: { planId: PlanId }) {
  const plan = PLAN_BY_ID[planId];

  return (
    <View
      style={{ backgroundColor: plan.soft }}
      className="rounded-full px-2.5 py-1"
    >
      <Text
        style={{ color: plan.accent }}
        className="text-[11px] font-semibold"
      >
        {plan.name}
      </Text>
    </View>
  );
}

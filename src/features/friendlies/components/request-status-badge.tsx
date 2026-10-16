import { CircleCheck, CircleX } from "lucide-react-native";
import { Text, View } from "react-native";

import type { FriendlyRequestStatus } from "../types";

type RequestStatusBadgeProps = {
  status: FriendlyRequestStatus;
};

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  if (status === "pending") {
    return (
      <View className="rounded-full bg-amber-100 px-2.5 py-1">
        <Text className="text-[11px] font-semibold text-amber-700">Pending</Text>
      </View>
    );
  }

  if (status === "accepted") {
    return (
      <View className="flex-row items-center gap-1 rounded-full bg-green-100 px-2.5 py-1">
        <CircleCheck size={13} color="#15803D" strokeWidth={2.5} />
        <Text className="text-[11px] font-semibold text-green-700">Accepted</Text>
      </View>
    );
  }

  if (status === "declined") {
    return (
      <View className="flex-row items-center gap-1 rounded-full bg-red-100 px-2.5 py-1">
        <CircleX size={13} color="#B91C1C" strokeWidth={2.5} />
        <Text className="text-[11px] font-semibold text-red-700">Declined</Text>
      </View>
    );
  }

  if (status === "cancelled") {
    return (
      <View className="flex-row items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
        <CircleX size={13} color="#475569" strokeWidth={2.5} />
        <Text className="text-[11px] font-semibold text-slate-600">
          Cancelled
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-full bg-slate-100 px-2.5 py-1">
      <Text className="text-[11px] font-semibold text-slate-600">Expired</Text>
    </View>
  );
}

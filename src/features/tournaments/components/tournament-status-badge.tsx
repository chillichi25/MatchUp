import { Text, View } from "react-native";

import type { TournamentStatus } from "../types";

type TournamentStatusBadgeProps = {
  status: TournamentStatus;
  isFull?: boolean;
};

export function TournamentStatusBadge({
  status,
  isFull = false,
}: TournamentStatusBadgeProps) {
  if (status === "cancelled") {
    return (
      <View className="rounded-full bg-red-100 px-2.5 py-1">
        <Text className="text-[11px] font-semibold text-red-700">Cancelled</Text>
      </View>
    );
  }

  if (status === "completed") {
    return (
      <View className="rounded-full bg-slate-100 px-2.5 py-1">
        <Text className="text-[11px] font-semibold text-slate-600">
          Completed
        </Text>
      </View>
    );
  }

  if (isFull) {
    return (
      <View className="rounded-full bg-amber-100 px-2.5 py-1">
        <Text className="text-[11px] font-semibold text-amber-700">Full</Text>
      </View>
    );
  }

  if (status === "closed") {
    return (
      <View className="rounded-full bg-slate-100 px-2.5 py-1">
        <Text className="text-[11px] font-semibold text-slate-600">
          Closed
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-full bg-[#E4F9EB] px-2.5 py-1">
      <Text className="text-[11px] font-semibold text-[#009F37]">Open</Text>
    </View>
  );
}

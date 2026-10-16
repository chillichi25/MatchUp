import { CalendarDays, ChevronRight, Shield } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type { MatchHistoryItem } from "../types";
import { formatKickOff, formatLongDate } from "@/features/friendlies/utils/format";

const resultStyles = {
  win: { badge: "bg-green-100", text: "text-[#00A638]", label: "Won" },
  draw: { badge: "bg-slate-100", text: "text-slate-600", label: "Draw" },
  loss: { badge: "bg-red-100", text: "text-red-500", label: "Lost" },
} as const;

type MatchHistoryCardProps = {
  item: MatchHistoryItem;
  onPress: () => void;
};

export function MatchHistoryCard({ item, onPress }: MatchHistoryCardProps) {
  if (item.status === "completed" && item.result && item.myScore !== null) {
    const style = resultStyles[item.result];

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.opponent.clubName} result`}
        onPress={onPress}
        className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
      >
        <Avatar
          uri={item.opponent.badgeUrl}
          name={item.opponent.clubName}
          size={44}
        />

        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-[13px] font-bold text-slate-950">
            {item.opponent.clubName}
          </Text>

          <Text numberOfLines={1} className="mt-0.5 text-[11px] text-slate-500">
            {item.opponent.teamName}
          </Text>

          <View className={`mt-1.5 self-start rounded-full px-2 py-0.5 ${style.badge}`}>
            <Text className={`text-[9px] font-semibold ${style.text}`}>
              {style.label}
            </Text>
          </View>
        </View>

        <View className="shrink-0 flex-row items-center gap-2">
          <Text className="text-[15px] font-bold tracking-wide text-slate-950">
            <Text
              className={
                item.result === "win"
                  ? "text-[#00B83F]"
                  : item.result === "loss"
                    ? "text-red-500"
                    : "text-slate-950"
              }
            >
              {item.myScore}
            </Text>
            <Text className="text-slate-700"> - </Text>
            {item.opponentScore}
          </Text>

          <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
        </View>
      </Pressable>
    );
  }

  const kickOff = formatKickOff(item.kickOffTime);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.opponent.clubName}, cancelled`}
      onPress={onPress}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-4">
          <View className="h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">
            <Shield size={22} color="#94A3B8" />
          </View>

          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="font-bold leading-5 text-slate-950">
              {item.opponent.clubName}
            </Text>
            <Text numberOfLines={1} className="mt-1 text-sm text-slate-500">
              {item.opponent.teamName}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-red-100 px-3 py-1">
            <Text className="text-xs font-semibold text-red-700">Cancelled</Text>
          </View>
          <ChevronRight size={19} color="#94A3B8" />
        </View>
      </View>

      <View className="mt-4 flex-row items-center gap-2">
        <CalendarDays size={16} color="#00B83F" />
        <Text className="text-sm text-slate-500">
          {formatLongDate(item.matchDate)}
          {kickOff ? ` · ${kickOff}` : ""}
        </Text>
      </View>

      <Text className="mt-3 text-sm text-slate-500">
        {item.cancelledByMyTeam
          ? "Cancelled by your team"
          : "Cancelled by opponent"}
      </Text>
    </Pressable>
  );
}

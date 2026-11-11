import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import type { RecentResult } from "@/features/matches/services/recent-results.service";

import { getDateParts } from "../utils/format-date";

const RESULT_STYLES = {
  win: { label: "Won", background: "#E4F5EB", color: "#007A35" },
  draw: { label: "Drawn", background: "#F1F5F9", color: "#475569" },
  loss: { label: "Lost", background: "#FEF2F2", color: "#B91C1C" },
} satisfies Record<
  RecentResult["result"],
  { label: string; background: string; color: string }
>;

export function ResultCard({ result }: { result: RecentResult }) {
  const router = useRouter();
  const { weekday, day, month } = getDateParts(result.matchDate);
  const { teamName, clubName, badgeUrl } = result.opponent;
  const title = teamName || clubName || "Opponent";
  const subtitle = clubName && clubName !== title ? clubName : null;
  const outcome = RESULT_STYLES[result.result];
  const scoreColor = result.result === "draw" ? "#07192D" : outcome.color;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        title,
        subtitle,
        `${weekday} ${day} ${month}`,
        outcome.label,
        `Your team ${result.myScore}, opponent ${result.opponentScore}`,
      ]
        .filter(Boolean)
        .join(", ")}
      accessibilityHint="Opens match details"
      onPress={() => router.push(`/matches/${result.id}` as never)}
      className="flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white active:bg-slate-50"
    >
      <View className="w-[54px] shrink-0 self-stretch items-center justify-center border-r border-slate-200 bg-slate-100 py-2">
        <Text className="text-[9px] font-semibold text-slate-500">
          {weekday}
        </Text>
        <Text className="text-[24px] font-bold leading-none text-[#009E45]">
          {day}
        </Text>
        <Text className="mt-1 text-[9px] font-semibold text-slate-500">
          {month}
        </Text>
      </View>

      <View className="min-w-0 flex-1 flex-row items-center gap-3 p-3">
        <Avatar uri={badgeUrl} name={clubName || title} size={40} />

        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="text-[14px] font-bold text-[#07192D]"
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              numberOfLines={1}
              className="mt-0.5 text-[12px] text-[#596B80]"
            >
              {subtitle}
            </Text>
          ) : null}

          <View
            className="mt-1.5 self-start rounded-full px-2 py-0.5"
            style={{ backgroundColor: outcome.background }}
          >
            <Text
              className="text-[10px] font-semibold"
              style={{ color: outcome.color }}
            >
              {outcome.label}
            </Text>
          </View>
        </View>

        <View className="shrink-0 flex-row items-center gap-1.5">
          <Text
            className="text-[16px] font-bold text-[#07192D]"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            <Text style={{ color: scoreColor }}>{result.myScore}</Text>
            {" – "}
            {result.opponentScore}
          </Text>
          <ChevronRight size={17} color="#64748B" strokeWidth={1.8} />
        </View>
      </View>
    </Pressable>
  );
}
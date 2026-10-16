import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import type { RecentResult } from "@/features/matches/services/recent-results.service";
import { getDateParts } from "../utils/format-date";

const resultStyles: Record<RecentResult["result"], string> = {
  win: "bg-green-100 text-[#00A638]",
  draw: "bg-slate-100 text-slate-600",
  loss: "bg-red-100 text-red-500",
};

const resultLabels: Record<RecentResult["result"], string> = {
  win: "Won",
  draw: "Draw",
  loss: "Lost",
};

export function ResultCard({ result }: { result: RecentResult }) {
  const router = useRouter();
  const { weekday, day, month } = getDateParts(result.matchDate);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${result.opponent.clubName} result, ${resultLabels[result.result]}`}
      onPress={() => router.push("/matches")}
      className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
    >
      <View className="w-[42px] shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50 py-1.5">
        <Text className="text-[9px] font-semibold text-slate-500">{weekday}</Text>

        <Text className="text-[22px] font-bold leading-none text-[#00B83F]">
          {day}
        </Text>

        <Text className="mt-1 text-[9px] font-semibold text-slate-500">
          {month}
        </Text>
      </View>

      <Avatar uri={result.opponent.badgeUrl} name={result.opponent.clubName} size={44} />

      <View className="min-w-0 flex-1">
        <Text className="text-[13px] font-bold text-slate-950" numberOfLines={1}>
          {result.opponent.clubName}
        </Text>

        <Text className="mt-0.5 text-[11px] text-slate-500" numberOfLines={1}>
          {result.opponent.teamName}
        </Text>

        <View
          className={`mt-1.5 self-start rounded-full px-2 py-0.5 ${
            resultStyles[result.result]
          }`}
        >
          <Text
            className={`text-[9px] font-semibold ${
              result.result === "win"
                ? "text-[#00A638]"
                : result.result === "loss"
                  ? "text-red-500"
                  : "text-slate-600"
            }`}
          >
            {resultLabels[result.result]}
          </Text>
        </View>
      </View>

      <View className="flex-row shrink-0 items-center gap-2">
        <Text className="text-[15px] font-bold tracking-wide text-slate-950">
          <Text
            className={
              result.result === "win"
                ? "text-[#00B83F]"
                : result.result === "loss"
                  ? "text-red-500"
                  : "text-slate-950"
            }
          >
            {result.myScore}
          </Text>
          <Text className="text-slate-700"> - </Text>
          {result.opponentScore}
        </Text>

        <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
      </View>
    </Pressable>
  );
}

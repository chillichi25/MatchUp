import { CalendarDays, ChevronRight, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { MatchSummary } from "../types";
import { formatKickOff, formatLongDate } from "@/features/friendlies/utils/format";

type UpcomingMatchCardProps = {
  match: MatchSummary;
  onPress: () => void;
};

export function UpcomingMatchCard({ match, onPress }: UpcomingMatchCardProps) {
  const kickOff = formatKickOff(match.kickOff);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Match against ${match.opponent.clubName}`}
      onPress={onPress}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-lg font-bold text-slate-950">
            {match.opponent.clubName || "Opponent"}
          </Text>
          <Text numberOfLines={1} className="mt-1 text-sm text-slate-500">
            {match.opponent.teamName}
          </Text>
        </View>

        <View className="shrink-0 rounded-full bg-green-100 px-3 py-1">
          <Text className="text-xs font-semibold text-green-700">Scheduled</Text>
        </View>
      </View>

      <View className="mt-5 gap-3">
        <View className="flex-row items-center gap-2">
          <CalendarDays size={17} color="#94A3B8" />
          <Text className="text-sm text-slate-600">
            {formatLongDate(match.matchDate)}
            {kickOff ? ` · ${kickOff}` : ""}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <MapPin size={17} color="#94A3B8" />
          <Text className="text-sm text-slate-600">
            {match.location || "Location TBC"}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-between border-t border-slate-100 pt-4">
        <Text className="text-sm font-semibold text-brand">View Match</Text>
        <ChevronRight size={18} color="#CBD5E1" />
      </View>
    </Pressable>
  );
}

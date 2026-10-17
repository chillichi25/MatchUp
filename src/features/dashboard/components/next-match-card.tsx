import { useRouter } from "expo-router";
import { Clock3, MapPin, MessageCircle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import type { DashboardMatch, DashboardMatchTeam } from "../types";
import { getDateParts } from "../utils/format-date";

function TeamColumn({ team }: { team: DashboardMatchTeam }) {
  return (
    <View className="min-w-0 flex-1 items-center">
      <Avatar uri={team.badgeUrl} name={team.clubName} size={44} />

      <Text className="mt-1 text-[11px] font-medium text-slate-500" numberOfLines={1}>
        {team.name}
      </Text>

      <Text
        className="mt-0.5 text-center text-[13px] font-bold leading-[15px] text-slate-950"
        numberOfLines={2}
      >
        {team.clubName}
      </Text>
    </View>
  );
}

export function NextMatchCard({ match }: { match: DashboardMatch }) {
  const router = useRouter();
  const { weekday, day, month } = getDateParts(match.matchDate);
  const kickOff = match.kickOff?.slice(0, 5) || "TBC";

  return (
    <View className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <View className="flex-row items-center px-3 pb-3 pt-4">
        <TeamColumn team={match.homeTeam} />

        <View className="items-center justify-center px-2">
          <Text className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {weekday}
          </Text>

          <Text className="mt-0.5 text-[27px] font-bold leading-none text-[#00B83F]">
            {day}
          </Text>

          <Text className="mt-1 text-[10px] font-semibold uppercase text-slate-500">
            {month}
          </Text>

          <Text className="mt-2 text-[12px] font-bold text-slate-700">VS</Text>
        </View>

        <TeamColumn team={match.awayTeam} />
      </View>

      <View className="mx-4 flex-row items-center justify-center gap-8 border-t border-slate-100 py-2.5 text-[12px] font-medium text-slate-500">
        <View className="flex-row items-center gap-1.5">
          <Clock3 size={15} strokeWidth={2} color="#64748B" />
          <Text className="text-[12px] font-medium text-slate-500">
            {kickOff}
          </Text>
        </View>

        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <MapPin size={15} strokeWidth={2} color="#64748B" />

          <Text
            className="flex-1 text-[12px] font-medium text-slate-500"
            numberOfLines={1}
          >
            {match.location || "Location TBC"}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 px-3 pb-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View match"
          onPress={() => router.push(`/matches/${match.id}` as never)}
          className="h-10 flex-1 items-center justify-center rounded-full border border-slate-300 bg-white"
        >
          <Text className="text-[13px] font-semibold text-slate-950">
            View Match
          </Text>
        </Pressable>

        {match.conversationId ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open chat"
            onPress={() => router.push(`/chat/${match.conversationId}` as never)}
            className="h-10 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-[#00B83F]"
          >
            <MessageCircle size={17} strokeWidth={2} color="#FFFFFF" />
            <Text className="text-[13px] font-semibold text-white">
              Open Chat
            </Text>
          </Pressable>
        ) : (
          <View className="h-10 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-slate-100">
            <MessageCircle size={17} strokeWidth={2} color="#94A3B8" />
            <Text className="text-[13px] font-semibold text-slate-400">
              Open Chat
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

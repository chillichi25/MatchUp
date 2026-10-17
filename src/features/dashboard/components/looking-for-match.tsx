import { useRouter } from "expo-router";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Shield,
  Trophy,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import type {
  DashboardFriendly,
  DashboardRecommendedTournament,
} from "../types";
import { getDateParts } from "../utils/format-date";

function DateChip({
  date,
  accent,
}: {
  date: string;
  accent: string;
}) {
  const { weekday, day, month } = getDateParts(date);

  return (
    <View className="w-[44px] shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50 py-2">
      <Text className="text-[9px] font-semibold text-slate-500">{weekday}</Text>

      <Text className={`text-[24px] font-bold leading-none ${accent}`}>
        {day}
      </Text>

      <Text className="mt-1 text-[9px] font-semibold text-slate-500">
        {month}
      </Text>
    </View>
  );
}

function FriendlyRow({ friendly }: { friendly: DashboardFriendly }) {
  const router = useRouter();

  const distanceText =
    friendly.distance !== null ? `${friendly.distance.toFixed(1)} miles · ` : "";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${friendly.clubName} friendly`}
      onPress={() => router.push("/matches")}
      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        <DateChip date={friendly.matchDate} accent="text-[#00B83F]" />

        <Avatar uri={friendly.badgeUrl} name={friendly.clubName} size={48} />

        <View className="min-w-0 flex-1">
          <Text className="text-[13px] font-bold text-slate-950" numberOfLines={1}>
            {friendly.clubName}
          </Text>

          <Text className="mt-0.5 text-[11px] text-slate-500">
            Friendly match
          </Text>

          <View className="mt-1 flex-row items-center gap-1">
            <MapPin size={12} color="#64748B" strokeWidth={2} />

            <Text className="flex-1 text-[11px] text-slate-500" numberOfLines={1}>
              {distanceText}
              {friendly.location ?? ""}
            </Text>
          </View>

          <View className="mt-1.5 flex-row items-center justify-between gap-2">
            <View className="rounded-full bg-green-50 px-2 py-1">
              <Text className="text-[10px] font-semibold text-[#00A638]">
                Looking for opponent
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Clock3 size={12} color="#64748B" strokeWidth={2} />
              <Text className="text-[10px] font-medium text-slate-500">
                {friendly.kickOff ?? "TBC"}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-lg text-slate-500">›</Text>
      </View>
    </Pressable>
  );
}

function TournamentRow({
  tournament,
}: {
  tournament: DashboardRecommendedTournament;
}) {
  const router = useRouter();

  const distanceText =
    tournament.distance !== null
      ? `${tournament.distance.toFixed(1)} miles · `
      : "";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tournament.name} tournament`}
      onPress={() => router.push(`/tournaments/${tournament.id}` as never)}
      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        <DateChip date={tournament.date} accent="text-[#00B83F]" />

        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-50">
          <Trophy size={25} color="#7C3AED" strokeWidth={2} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-[13px] font-bold text-slate-950" numberOfLines={1}>
            {tournament.name}
          </Text>

          <Text className="mt-0.5 text-[11px] text-slate-500">
            {tournament.ageGroup} · {tournament.teams} teams
          </Text>

          <View className="mt-1 flex-row items-center gap-1">
            <MapPin size={12} color="#64748B" strokeWidth={2} />

            <Text className="flex-1 text-[11px] text-slate-500" numberOfLines={1}>
              {distanceText}
              {tournament.location}
            </Text>
          </View>

          <View className="mt-1.5">
            <View className="self-start rounded-full bg-violet-50 px-2 py-1">
              <Text className="text-[10px] font-semibold text-violet-600">
                Tournament
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-lg text-slate-500">›</Text>
      </View>
    </Pressable>
  );
}

export function LookingForMatch({
  friendly,
  tournament,
}: {
  friendly: DashboardFriendly | null;
  tournament: DashboardRecommendedTournament | null;
}) {
  const router = useRouter();
  const hasRecommendations = Boolean(friendly || tournament);

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between">
        <Text className="text-[18px] font-bold tracking-tight text-slate-950">
          Recommended for You
        </Text>

        {hasRecommendations ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View all recommendations"
            onPress={() => router.push("/matches")}
          >
            <Text className="text-[13px] font-semibold text-[#00B83F]">
              View all ›
            </Text>
          </Pressable>
        ) : null}
      </View>

      {!hasRecommendations ? (
        <View className="mt-3 flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
          <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
            <Shield size={19} color="#00B83F" strokeWidth={2} />
          </View>

          <View className="min-w-0 flex-1">
            <Text className="text-[13px] font-bold leading-tight text-slate-950">
              No recommendations right now
            </Text>

            <Text className="mt-1 text-[11px] leading-[15px] text-slate-500">
              We&apos;ll show suitable matches and tournaments here.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Browse matches"
            onPress={() => router.push("/matches")}
            className="flex-row items-center gap-1"
          >
            <Text className="text-[11px] font-bold text-[#00A638]">Browse</Text>
            <ArrowRight size={13} color="#00A638" strokeWidth={2.2} />
          </Pressable>
        </View>
      ) : (
        <View className="mt-3 gap-3">
          {friendly ? <FriendlyRow friendly={friendly} /> : null}
          {tournament ? <TournamentRow tournament={tournament} /> : null}
        </View>
      )}
    </View>
  );
}

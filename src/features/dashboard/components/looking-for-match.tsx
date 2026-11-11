import { useRouter } from "expo-router";
import { ChevronRight, Clock3, MapPin, Trophy } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type {
  DashboardFriendly,
  DashboardRecommendedTournament,
} from "../types";
import { getDateParts } from "../utils/format-date";

function DateChip({ date }: { date: string }) {
  const { weekday, day, month } = getDateParts(date);

  return (
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
  );
}

function FriendlyRow({ friendly }: { friendly: DashboardFriendly }) {
  const router = useRouter();
  const teamName = friendly.teamName.trim();
  const clubName = friendly.clubName.trim();
  const title = teamName || clubName || "Friendly";

  const location = friendly.location?.trim();
  const distance =
    friendly.distance != null && Number.isFinite(friendly.distance)
      ? `${friendly.distance.toFixed(1)} mi`
      : null;
  const locationText = [location, distance].filter(Boolean).join(" · ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, teamName && clubName, "Friendly match"]
        .filter(Boolean)
        .join(", ")}
      accessibilityHint="Opens friendly details"
      onPress={() => router.push(`/friendlies/${friendly.id}` as never)}
      className="flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white active:bg-slate-50"
    >
      <DateChip date={friendly.matchDate} />

      <View className="min-w-0 flex-1 flex-row items-center gap-3 p-3">
        <Avatar uri={friendly.badgeUrl} name={clubName || title} size={40} />

        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="text-[14px] font-bold text-[#07192D]"
          >
            {title}
          </Text>

          {teamName && clubName ? (
            <Text
              numberOfLines={1}
              className="mt-0.5 text-[12px] text-[#596B80]"
            >
              {clubName}
            </Text>
          ) : null}

          <View className="mt-2 flex-row items-center gap-1.5">
            <Clock3 size={13} color="#009E45" strokeWidth={1.8} />
            <Text className="min-w-0 flex-1 text-[12px] font-medium text-[#07192D]">
              {friendly.kickOff || "Time to be confirmed"}
            </Text>
          </View>

          {locationText ? (
            <View className="mt-1 flex-row items-start gap-1.5">
              <View className="mt-0.5">
                <MapPin size={13} color="#009E45" strokeWidth={1.8} />
              </View>
              <Text
                numberOfLines={2}
                className="min-w-0 flex-1 text-[12px] text-[#596B80]"
              >
                {locationText}
              </Text>
            </View>
          ) : null}
        </View>

        <ChevronRight size={17} color="#64748B" strokeWidth={1.8} />
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
  const distance =
    tournament.distance != null && Number.isFinite(tournament.distance)
      ? `${tournament.distance.toFixed(1)} mi`
      : null;
  const locationText = [tournament.location, distance]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${tournament.name} tournament`}
      onPress={() => router.push(`/tournaments/${tournament.id}` as never)}
      className="flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white active:bg-slate-50"
    >
      <DateChip date={tournament.date} />

      <View className="min-w-0 flex-1 flex-row items-center gap-3 p-3">
        <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50">
          <Trophy size={21} color="#7C3AED" strokeWidth={1.8} />
        </View>

        <View className="min-w-0 flex-1">
          <Text
            numberOfLines={1}
            className="text-[14px] font-bold text-[#07192D]"
          >
            {tournament.name}
          </Text>

          <Text className="mt-0.5 text-[12px] text-[#596B80]">
            {tournament.ageGroup} · {tournament.teams} teams
          </Text>

          {locationText ? (
            <View className="mt-1 flex-row items-start gap-1.5">
              <View className="mt-0.5">
                <MapPin size={13} color="#7C3AED" strokeWidth={1.8} />
              </View>
              <Text
                numberOfLines={2}
                className="min-w-0 flex-1 text-[12px] text-[#596B80]"
              >
                {locationText}
              </Text>
            </View>
          ) : null}

          <View className="mt-1.5 self-start rounded-full bg-violet-50 px-2 py-1">
            <Text className="text-[10px] font-semibold text-violet-600">
              Tournament
            </Text>
          </View>
        </View>

        <ChevronRight size={17} color="#64748B" strokeWidth={1.8} />
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

  if (!friendly && !tournament) return null;

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[18px] font-bold tracking-tight text-[#07192D]">
          Recommended for you
        </Text>

        {friendly ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View all recommended matches"
            onPress={() =>
              router.push({
                pathname: "/matches",
                params: {
                  view: "recommended",
                  featuredFriendlyId: friendly.id,
                },
              })
            }
            hitSlop={8}
          >
            <Text className="text-[13px] font-semibold text-[#009E45]">
              View all ›
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-3 gap-3">
        {friendly ? <FriendlyRow friendly={friendly} /> : null}
        {tournament ? <TournamentRow tournament={tournament} /> : null}
      </View>
    </View>
  );
}
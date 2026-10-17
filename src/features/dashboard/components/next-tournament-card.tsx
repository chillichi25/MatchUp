import { useRouter } from "expo-router";
import { CalendarDays, MapPin, Trophy } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import type { DashboardTournament } from "../types";
import { formatLongDate } from "../utils/format-date";

export function NextTournamentCard({
  tournament,
}: {
  tournament: DashboardTournament;
}) {
  const router = useRouter();

  const formattedStartDate = formatLongDate(tournament.startDate);
  const formattedEndDate = tournament.endDate
    ? formatLongDate(tournament.endDate)
    : null;

  const start = tournament.startTime?.slice(0, 5) ?? null;
  const end = tournament.endTime?.slice(0, 5) ?? null;

  const schedule = [
    formattedStartDate,
    start ? ` · ${start}` : "",
    formattedEndDate && formattedEndDate !== formattedStartDate
      ? ` – ${formattedEndDate}`
      : "",
    end ? ` · ${end}` : "",
  ].join("");

  return (
    <View className="mt-4 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
      <View className="flex-row items-start gap-4">
        <View className="h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
          <Trophy size={27} color="#7C3AED" strokeWidth={2} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            Tournament
          </Text>

          <Text className="mt-1 text-lg font-bold text-slate-950">
            {tournament.name}
          </Text>

          {tournament.ageGroup ? (
            <Text className="mt-1 text-sm text-slate-500">
              {tournament.ageGroup}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-5 gap-3">
        <View className="flex-row items-start gap-3">
          <CalendarDays size={18} color="#475569" strokeWidth={2} />

          <Text className="flex-1 text-sm text-slate-600">{schedule}</Text>
        </View>

        <View className="flex-row items-center gap-3">
          <MapPin size={18} color="#475569" strokeWidth={2} />

          <Text className="flex-1 text-sm text-slate-600">
            {tournament.location || "Location TBC"}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View tournament"
        onPress={() => router.push(`/tournaments/${tournament.id}` as never)}
        className="mt-5 h-12 w-full items-center justify-center rounded-2xl bg-[#00B83F]"
      >
        <Text className="font-semibold text-white">View Tournament</Text>
      </Pressable>
    </View>
  );
}

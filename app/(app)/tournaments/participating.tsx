import { useRouter } from "expo-router";
import { CalendarDays, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { formatDateWithYear } from "@/features/friendlies/utils/format";
import { useParticipatingTournaments } from "@/features/tournaments/hooks/use-tournaments";

export default function ParticipatingTournamentsScreen() {
  const router = useRouter();
  const tournaments = useParticipatingTournaments();

  const items = tournaments.data ?? [];

  return (
    <Screen>
      <PageHeader title="Joined Tournaments" fallbackHref="/tournaments" />

      {tournaments.isLoading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="No tournaments joined"
            description="Tournaments your team has entered will appear here."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <View className="mt-8 gap-3">
            {items.map((tournament) => (
              <Pressable
                key={tournament.requestId}
                accessibilityRole="button"
                onPress={() =>
                  router.push(`/tournaments/${tournament.id}` as never)
                }
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <View className="flex-row items-center justify-between gap-3">
                  <Text
                    numberOfLines={1}
                    className="min-w-0 flex-1 text-[14px] font-bold text-slate-950"
                  >
                    {tournament.name}
                  </Text>
                  <View className="rounded-full bg-[#E4F9EB] px-2.5 py-1">
                    <Text className="text-[10px] font-semibold text-[#009F37]">
                      Accepted
                    </Text>
                  </View>
                </View>

                <View className="mt-3 gap-2">
                  <View className="flex-row items-center gap-2">
                    <CalendarDays size={14} color="#64748B" />
                    <Text className="text-[12px] text-slate-600">
                      {formatDateWithYear(tournament.startDate)}
                      {tournament.endDate && tournament.endDate !== tournament.startDate
                        ? ` – ${formatDateWithYear(tournament.endDate)}`
                        : ""}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <MapPin size={14} color="#64748B" />
                    <Text numberOfLines={1} className="flex-1 text-[12px] text-slate-600">
                      {tournament.location || "Location TBC"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ScreenScroll>
      )}
    </Screen>
  );
}

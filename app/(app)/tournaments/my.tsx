import { useRouter } from "expo-router";
import { CalendarDays, MapPin, Users } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { formatDateWithYear } from "@/features/friendlies/utils/format";

import { TournamentStatusBadge } from "@/features/tournaments/components/tournament-status-badge";
import { useMyTournaments } from "@/features/tournaments/hooks/use-tournaments";
import type { MyTournament } from "@/features/tournaments/types";
import { formatCapacity } from "@/features/tournaments/utils/format";

export default function MyTournamentsScreen() {
  const router = useRouter();
  const tournaments = useMyTournaments();

  const active = tournaments.data?.active ?? [];
  const history = tournaments.data?.history ?? [];

  return (
    <Screen>
      <PageHeader title="My Tournaments" fallbackHref="/tournaments" />

      {tournaments.isLoading ? (
        <LoadingState />
      ) : active.length === 0 && history.length === 0 ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="No tournaments yet"
            description="Tournaments you organise will appear here."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          {active.length > 0 ? (
            <View className="mt-8">
              <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active
              </Text>
              <View className="gap-3">
                {active.map((tournament) => (
                  <MyTournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onPress={() =>
                      router.push(`/tournaments/${tournament.id}/manage` as never)
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}

          {history.length > 0 ? (
            <View className="mt-9">
              <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                History
              </Text>
              <View className="gap-3">
                {history.map((tournament) => (
                  <MyTournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onPress={() =>
                      router.push(`/tournaments/${tournament.id}` as never)
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}
        </ScreenScroll>
      )}
    </Screen>
  );
}

function MyTournamentCard({
  tournament,
  onPress,
}: {
  tournament: MyTournament;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text
          numberOfLines={1}
          className="min-w-0 flex-1 text-[14px] font-bold text-slate-950"
        >
          {tournament.name}
        </Text>
        <TournamentStatusBadge status={tournament.status} />
      </View>

      <View className="mt-3 gap-2">
        <View className="flex-row items-center gap-2">
          <CalendarDays size={14} color="#64748B" />
          <Text className="text-[12px] text-slate-600">
            {formatDateWithYear(tournament.startDate)}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <MapPin size={14} color="#64748B" />
          <Text numberOfLines={1} className="flex-1 text-[12px] text-slate-600">
            {tournament.location || "Location TBC"}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Users size={14} color="#64748B" />
          <Text className="text-[12px] text-slate-600">
            {formatCapacity(tournament.acceptedCount, tournament.maxTeams)}
          </Text>
        </View>
      </View>

      {tournament.pendingCount > 0 ? (
        <View className="mt-3 self-start rounded-full bg-amber-100 px-2.5 py-1">
          <Text className="text-[10px] font-semibold text-amber-700">
            {tournament.pendingCount}{" "}
            {tournament.pendingCount === 1 ? "request" : "requests"} pending
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

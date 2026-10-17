import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, MapPin } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { formatLongDate, formatTimestamp } from "@/features/dashboard/utils/format-date";
import { useTournamentUpdateDetail } from "@/features/tournaments/hooks/use-tournament-organiser";

export default function TournamentUpdateDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const update = useTournamentUpdateDetail(id);
  const detail = update.data;

  return (
    <Screen>
      <PageHeader title="Tournament Update" fallbackHref="/notifications" />

      {update.isLoading ? (
        <LoadingState />
      ) : !detail ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="Update not found"
            description="This update may have been removed."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <View className="mt-8 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
            <Text className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">
              {detail.tournamentName}
            </Text>

            <Text className="mt-3 text-[15px] leading-6 text-slate-700">
              {detail.message}
            </Text>

            <Text className="mt-4 text-[11px] text-slate-400">
              {formatTimestamp(detail.createdAt)}
            </Text>
          </View>

          <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <View className="flex-row items-center gap-2">
              <CalendarDays size={16} color="#64748B" />
              <Text className="text-[13px] text-slate-600">
                {formatLongDate(detail.tournamentStartDate)}
              </Text>
            </View>

            {detail.tournamentLocation ? (
              <View className="mt-2 flex-row items-center gap-2">
                <MapPin size={16} color="#64748B" />
                <Text className="flex-1 text-[13px] text-slate-600">
                  {detail.tournamentLocation}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-6">
            <Button
              onPress={() =>
                router.push(`/tournaments/${detail.tournamentId}` as never)
              }
            >
              View Tournament
            </Button>
          </View>
        </ScreenScroll>
      )}
    </Screen>
  );
}

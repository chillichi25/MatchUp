import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { TournamentUpdateForm } from "@/features/tournaments/components/tournament-update-form";
import { formatTimestamp } from "@/features/dashboard/utils/format-date";
import { useTournamentUpdates } from "@/features/tournaments/hooks/use-tournament-organiser";
import { useTournamentDetail } from "@/features/tournaments/hooks/use-tournaments";

export default function MessageParticipantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useTournamentDetail(id);
  const updates = useTournamentUpdates(id);

  const tournament = detail.data;

  return (
    <Screen>
      <PageHeader title="Message Teams" fallbackHref={`/tournaments/${id}/manage`} />

      {detail.isLoading ? (
        <LoadingState />
      ) : !tournament || !tournament.isOwner ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="Not authorised"
            description="Only the organiser can message participants."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <View className="mt-6">
            <TournamentUpdateForm tournamentId={id} onSent={() => undefined} />
          </View>

          <View className="mt-9">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sent updates
            </Text>

            {updates.isLoading ? (
              <LoadingState />
            ) : (updates.data ?? []).length === 0 ? (
              <EmptyState
                title="No updates sent"
                description="Updates you send to participants will appear here."
              />
            ) : (
              <View className="gap-3">
                {(updates.data ?? []).map((update) => (
                  <View
                    key={update.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <Text className="text-[13px] leading-5 text-slate-700">
                      {update.message}
                    </Text>
                    <Text className="mt-2 text-[11px] text-slate-400">
                      {formatTimestamp(update.createdAt)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScreenScroll>
      )}
    </Screen>
  );
}

import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { TournamentParticipantCard } from "@/features/tournaments/components/tournament-participant-card";
import { useTournamentParticipants } from "@/features/tournaments/hooks/use-tournaments";

export default function TournamentParticipantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const participants = useTournamentParticipants(id);

  return (
    <Screen>
      <PageHeader title="Participating Teams" fallbackHref={`/tournaments/${id}`} />

      {participants.isLoading ? (
        <LoadingState />
      ) : (participants.data ?? []).length === 0 ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="No teams yet"
            description="Accepted teams will appear here."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <Text className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {participants.data?.length}{" "}
            {participants.data?.length === 1 ? "team" : "teams"}
          </Text>

          <View className="gap-3">
            {(participants.data ?? []).map((participant) => (
              <TournamentParticipantCard
                key={participant.teamId}
                participant={participant}
              />
            ))}
          </View>
        </ScreenScroll>
      )}
    </Screen>
  );
}

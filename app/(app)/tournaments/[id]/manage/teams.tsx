import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { toast } from "sonner-native";

import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { useIncomingTournamentRequests, useRemoveTournamentParticipant } from "@/features/tournaments/hooks/use-tournament-requests";
import type { TournamentRequestSummary } from "@/features/tournaments/types";

export default function ManageTournamentTeamsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const requests = useIncomingTournamentRequests();
  const removeParticipant = useRemoveTournamentParticipant();

  const [selected, setSelected] = useState<TournamentRequestSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const participants = (requests.data ?? []).filter(
    (request) => request.tournamentId === id && request.status === "accepted"
  );

  async function handleRemove() {
    if (!selected) return;

    setError(null);

    try {
      await removeParticipant.mutateAsync(selected.id);
      toast.success("Team removed");
      setSelected(null);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "The team could not be removed."
      );
    }
  }

  return (
    <Screen>
      <PageHeader title="Participating Teams" fallbackHref={`/tournaments/${id}/manage`} />

      {requests.isLoading ? (
        <LoadingState />
      ) : participants.length === 0 ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="No teams yet"
            description="Accepted teams will appear here."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <Text className="mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {participants.length}{" "}
            {participants.length === 1 ? "team" : "teams"}
          </Text>

          <View className="gap-3">
            {participants.map((request) => (
              <View
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <View className="flex-row items-center gap-2.5">
                  <Avatar
                    uri={request.team.badgeUrl}
                    name={request.team.clubName}
                    size={40}
                  />

                  <View className="min-w-0 flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-[13px] font-bold leading-tight text-slate-950"
                    >
                      {request.team.clubName}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="mt-0.5 text-[10px] text-slate-500"
                    >
                      {request.team.teamName}
                      {request.team.ageGroup ? ` · ${request.team.ageGroup}` : ""}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${request.team.clubName}`}
                    onPress={() => {
                      setError(null);
                      setSelected(request);
                    }}
                    className="h-9 items-center justify-center rounded-xl border border-red-200 bg-white px-3"
                  >
                    <Text className="text-[11px] font-semibold text-red-600">
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScreenScroll>
      )}

      <ConfirmDialog
        visible={selected !== null}
        title="Remove this team?"
        description={
          selected
            ? `${selected.team.clubName} will lose their place and be notified.`
            : ""
        }
        warning="This cannot be undone."
        confirmLabel="Yes, Remove Team"
        cancelLabel="Keep Team"
        loadingLabel="Removing..."
        loading={removeParticipant.isPending}
        error={error}
        onConfirm={handleRemove}
        onCancel={() => setSelected(null)}
      />
    </Screen>
  );
}

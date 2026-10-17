import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { useSendTournamentRequest } from "@/features/tournaments/hooks/use-tournament-requests";
import { useTournamentDetail } from "@/features/tournaments/hooks/use-tournaments";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function TournamentRequestScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const activeTeam = useActiveTeam();
  const detail = useTournamentDetail(id);
  const sendRequest = useSendTournamentRequest();

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const team = activeTeam.data;
  const tournament = detail.data;

  const loading = activeTeam.isLoading || detail.isLoading;

  async function handleSubmit() {
    setErrorMessage("");

    if (!team) {
      setErrorMessage("You need an active team to enter.");
      return;
    }

    try {
      await sendRequest.mutateAsync({
        tournamentId: id,
        teamId: team.id,
        message: message.trim() || undefined,
      });

      toast.success("Request sent");
      router.replace(`/tournaments/${id}` as never);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your request."
      );
    }
  }

  return (
    <Screen>
      <PageHeader title="Request to Enter" fallbackHref={`/tournaments/${id}`} />

      {loading ? (
        <LoadingState />
      ) : !team ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="You need an active team"
            description="Select or create a team before entering a tournament."
          />
        </View>
      ) : !tournament ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="Tournament not found"
            description="This tournament may have been removed."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <View className="mt-6 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
            <Text className="text-[11px] font-medium text-slate-400">
              Entering as
            </Text>
            <Text className="mt-1 font-bold text-slate-900">
              {team.clubs?.name ?? ""}
            </Text>
            <Text className="mt-1 text-sm text-slate-500">{team.name}</Text>
          </View>

          <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Text className="text-[11px] font-medium text-slate-400">
              Tournament
            </Text>
            <Text className="mt-1 font-bold text-slate-900">
              {tournament.name}
            </Text>
            {tournament.location ? (
              <Text className="mt-1 text-sm text-slate-500">
                {tournament.location}
              </Text>
            ) : null}
          </View>

          <View className="mt-6">
            <Label>Message (optional)</Label>
            <Input
              placeholder="Add a note for the organiser"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              maxLength={500}
              className="h-auto min-h-[104px] py-3"
              textAlignVertical="top"
            />
          </View>

          {errorMessage ? (
            <View className="mt-4 rounded-2xl bg-red-50 px-4 py-3">
              <Text className="text-sm text-red-600">{errorMessage}</Text>
            </View>
          ) : null}

          <View className="mt-6">
            <Button onPress={handleSubmit} loading={sendRequest.isPending}>
              {sendRequest.isPending ? "Sending..." : "Send Request"}
            </Button>
          </View>
        </ScreenScroll>
      )}
    </Screen>
  );
}

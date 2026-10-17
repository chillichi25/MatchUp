import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { toast } from "sonner-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/state-views";import { TournamentRequestCard } from "@/features/tournaments/components/tournament-request-card";
import {
  useAcceptTournamentRequest,
  useDeclineTournamentRequest,
  useIncomingTournamentRequests,
} from "@/features/tournaments/hooks/use-tournament-requests";

export default function TournamentRequestsScreen() {
  const router = useRouter();

  const requests = useIncomingTournamentRequests();
  const accept = useAcceptTournamentRequest();
  const decline = useDeclineTournamentRequest();

  const [pendingId, setPendingId] = useState<string | null>(null);

  const pending = (requests.data ?? []).filter(
    (request) => request.status === "pending"
  );

  const history = (requests.data ?? []).filter(
    (request) => request.status !== "pending"
  );

  async function handleAccept(id: string) {
    setPendingId(id);

    try {
      await accept.mutateAsync(id);
      toast.success("Team accepted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not accept this request."
      );
    } finally {
      setPendingId(null);
    }
  }

  async function handleDecline(id: string) {
    setPendingId(id);

    try {
      await decline.mutateAsync(id);
      toast.success("Request declined");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not decline this request."
      );
    } finally {
      setPendingId(null);
    }
  }

  const busy = accept.isPending || decline.isPending;

  return (
    <Screen>
      <PageHeader title="Tournament Requests" fallbackHref="/tournaments" />

      {requests.isLoading ? (
        <LoadingState />
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <View className="mt-8">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending
            </Text>

            {pending.length === 0 ? (
              <View className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
                <Text className="text-center font-bold text-slate-900">
                  No pending requests
                </Text>
                <Text className="mt-2 text-center text-sm text-slate-500">
                  You&apos;re all caught up.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {pending.map((request) => (
                  <TournamentRequestCard
                    key={request.id}
                    request={request}
                    focus="team"
                    onPress={() =>
                      router.push(`/tournaments/${request.tournamentId}` as never)
                    }
                  >
                    <View className="flex-row gap-2">
                      <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={() => handleAccept(request.id)}
                        className={
                          busy
                            ? "h-10 flex-1 items-center justify-center rounded-xl bg-slate-200"
                            : "h-10 flex-1 items-center justify-center rounded-xl bg-brand"
                        }
                      >
                        <Text
                          className={
                            busy
                              ? "text-[12px] font-bold text-slate-400"
                              : "text-[12px] font-bold text-white"
                          }
                        >
                          {pendingId === request.id && accept.isPending
                            ? "Accepting…"
                            : "Accept"}
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        disabled={busy}
                        onPress={() => handleDecline(request.id)}
                        className="h-10 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white"
                      >
                        <Text className="text-[12px] font-bold text-slate-600">
                          {pendingId === request.id && decline.isPending
                            ? "Declining…"
                            : "Decline"}
                        </Text>
                      </Pressable>
                    </View>
                  </TournamentRequestCard>
                ))}
              </View>
            )}
          </View>

          {history.length > 0 ? (
            <View className="mt-9">
              <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                History
              </Text>

              <View className="gap-3">
                {history.map((request) => (
                  <TournamentRequestCard
                    key={request.id}
                    request={request}
                    focus="team"
                    onPress={() =>
                      router.push(`/tournaments/${request.tournamentId}` as never)
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

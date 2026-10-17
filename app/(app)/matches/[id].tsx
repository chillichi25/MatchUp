import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, Clock, MapPin } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import {
  useCancelMatch,
  useMatchDetail,
} from "@/features/matches/hooks/use-matches";
import {
  formatDateWithYear,
  formatKickOff,
} from "@/features/friendlies/utils/format";

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusStyles: Record<string, { badge: string; text: string }> = {
  scheduled: { badge: "bg-green-100", text: "text-green-700" },
  completed: { badge: "bg-blue-100", text: "text-blue-700" },
  cancelled: { badge: "bg-red-100", text: "text-red-700" },
};

export default function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useMatchDetail(id);
  const cancelMatch = useCancelMatch();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const match = detail.data;

  async function handleCancel() {
    if (!match) return;

    setError(null);

    try {
      await cancelMatch.mutateAsync(match.id);
      setConfirmOpen(false);
      router.replace("/matches/upcoming" as never);
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "The match could not be cancelled."
      );
    }
  }

  return (
    <Screen>
      <PageHeader title="Match Details" fallbackHref="/matches/upcoming" />

      {detail.isLoading ? (
        <LoadingState />
      ) : !match ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="Match not found"
            description="This match may have been removed or you may not have access."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <View className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <View className="flex-row justify-end">
              <View
                className={`rounded-full px-3 py-1 ${
                  statusStyles[match.status]?.badge ?? "bg-slate-100"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    statusStyles[match.status]?.text ?? "text-slate-600"
                  }`}
                >
                  {statusLabels[match.status] ?? "Scheduled"}
                </Text>
              </View>
            </View>

            <View className="mt-3 flex-row items-center gap-3">
              <Avatar
                uri={match.opponent.badgeUrl}
                name={match.opponent.clubName}
                size={52}
              />

              <View className="min-w-0 flex-1">
                <Text numberOfLines={2} className="text-2xl font-bold text-slate-950">
                  {match.opponent.clubName || "Opponent"}
                </Text>
                <Text numberOfLines={1} className="mt-1 text-slate-500">
                  {match.opponent.teamName}
                </Text>
              </View>
            </View>

            {match.status === "completed" &&
            match.homeScore !== null &&
            match.awayScore !== null ? (
              <View className="mt-5 items-center rounded-2xl bg-slate-50 py-4">
                <Text className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Final score
                </Text>
                <Text className="mt-1 text-3xl font-bold text-slate-950">
                  {match.isHome ? match.homeScore : match.awayScore}
                  <Text className="text-slate-400"> - </Text>
                  {match.isHome ? match.awayScore : match.homeScore}
                </Text>
              </View>
            ) : null}

            <View className="mt-6 gap-3">
              <View className="flex-row items-center gap-3">
                <CalendarDays size={18} color="#64748B" />
                <Text className="text-slate-700">
                  {formatDateWithYear(match.matchDate)}
                </Text>
              </View>

              {match.kickOff ? (
                <View className="flex-row items-center gap-3">
                  <Clock size={18} color="#64748B" />
                  <Text className="text-slate-700">{formatKickOff(match.kickOff)}</Text>
                </View>
              ) : null}

              <View className="flex-row items-center gap-3">
                <MapPin size={18} color="#64748B" />
                <Text className="text-slate-700">
                  {match.location || "Location TBC"}
                </Text>
              </View>
            </View>
          </View>

          {match.status === "scheduled" ? (
            <View className="mt-6">
              <Button
                variant="outline"
                textClassName="text-red-600"
                className="border-red-200"
                onPress={() => {
                  setError(null);
                  setConfirmOpen(true);
                }}
              >
                Cancel Match
              </Button>
            </View>
          ) : null}

          {match.conversationId ? (
            <View className="mt-3">
              <Button onPress={() => router.push(`/chat/${match.conversationId}` as never)}>
                Open Chat
              </Button>
            </View>
          ) : null}
        </ScreenScroll>
      )}

      <ConfirmDialog
        visible={confirmOpen}
        title="Cancel this match?"
        description="This will cancel the confirmed fixture for both teams. Your opponent will be notified."
        warning="This cannot be undone."
        confirmLabel="Yes, Cancel Match"
        loadingLabel="Cancelling..."
        loading={cancelMatch.isPending}
        error={error}
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </Screen>
  );
}

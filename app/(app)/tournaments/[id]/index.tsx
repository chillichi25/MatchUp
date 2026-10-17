import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CalendarDays,
  Clock,
  MapPin,
  Trophy,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { formatDateWithYear } from "@/features/friendlies/utils/format";

import { TournamentRequestStatusBadge } from "@/features/tournaments/components/tournament-request-status-badge";
import { TournamentStatusBadge } from "@/features/tournaments/components/tournament-status-badge";
import { useWithdrawTournamentParticipant } from "@/features/tournaments/hooks/use-tournament-requests";
import { useTournamentDetail } from "@/features/tournaments/hooks/use-tournaments";
import {
  formatCapacity,
  formatEntryFee,
  formatTimeRange,
} from "@/features/tournaments/utils/format";

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useTournamentDetail(id);
  const withdraw = useWithdrawTournamentParticipant();

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tournament = detail.data;

  const request = tournament?.existingRequest ?? null;

  const canRequestAgain =
    request === null ||
    request.status === "removed" ||
    request.status === "withdrawn" ||
    request.status === "cancelled" ||
    request.status === "expired";

  const canRequest =
    tournament &&
    !tournament.isOwner &&
    tournament.status === "open" &&
    !tournament.isFull &&
    tournament.eligibility.eligible &&
    canRequestAgain;

  async function handleWithdraw() {
    if (!request) return;

    setError(null);

    try {
      await withdraw.mutateAsync(request.id);
      setWithdrawOpen(false);
    } catch (withdrawError) {
      setError(
        withdrawError instanceof Error
          ? withdrawError.message
          : "The entry could not be withdrawn."
      );
    }
  }

  return (
    <Screen>
      <PageHeader title="Tournament" fallbackHref="/tournaments" />

      {detail.isLoading ? (
        <LoadingState />
      ) : !tournament ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="Tournament not found"
            description="This tournament may have been removed or you may not have access."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <View className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <View className="flex-row items-start justify-between gap-3">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                <Trophy size={27} color="#7C3AED" strokeWidth={2} />
              </View>

              <TournamentStatusBadge
                status={tournament.status}
                isFull={tournament.isFull}
              />
            </View>

            <Text className="mt-4 text-2xl font-bold text-slate-950">
              {tournament.name}
            </Text>

            <View className="mt-3 flex-row flex-wrap items-center gap-1.5">
              {[tournament.ageGroup, tournament.gender, tournament.level, tournament.matchFormat]
                .filter(Boolean)
                .map((tag) => (
                  <View key={tag} className="rounded-full bg-slate-100 px-2.5 py-1">
                    <Text className="text-[11px] font-medium text-slate-600">
                      {tag}
                    </Text>
                  </View>
                ))}
            </View>

            <View className="mt-6 gap-3">
              <View className="flex-row items-center gap-3">
                <CalendarDays size={18} color="#64748B" />
                <Text className="text-slate-700">
                  {formatDateWithYear(tournament.startDate)}
                  {tournament.endDate && tournament.endDate !== tournament.startDate
                    ? ` – ${formatDateWithYear(tournament.endDate)}`
                    : ""}
                </Text>
              </View>

              {tournament.startTime ? (
                <View className="flex-row items-center gap-3">
                  <Clock size={18} color="#64748B" />
                  <Text className="text-slate-700">
                    {formatTimeRange(tournament.startTime, tournament.endTime)}
                  </Text>
                </View>
              ) : null}

              <View className="flex-row items-center gap-3">
                <MapPin size={18} color="#64748B" />
                <Text className="flex-1 text-slate-700">
                  {tournament.location || "Location TBC"}
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <Users size={18} color="#64748B" />
                <Text className="text-slate-700">
                  {formatCapacity(tournament.acceptedCount, tournament.maxTeams)}
                </Text>
              </View>
            </View>

            {tournament.description ? (
              <View className="mt-6 border-t border-slate-100 pt-5">
                <Text className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                  About
                </Text>
                <Text className="mt-2 text-sm leading-6 text-slate-600">
                  {tournament.description}
                </Text>
              </View>
            ) : null}

            <View className="mt-6 flex-row items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <Text className="text-[12px] font-semibold text-slate-500">
                Entry fee
              </Text>
              <Text className="text-[15px] font-bold text-violet-600">
                {formatEntryFee(tournament.entryFee)}
              </Text>
            </View>
          </View>

          {/* Eligibility */}
          {!tournament.isOwner &&
          tournament.status === "open" &&
          !tournament.eligibility.eligible &&
          tournament.eligibility.reasons.length > 0 ? (
            <View className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Text className="text-[12px] font-semibold text-amber-700">
                Not eligible to enter
              </Text>
              {tournament.eligibility.reasons.map((reason) => (
                <Text key={reason} className="mt-1 text-[12px] text-amber-700">
                  {reason}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Existing request */}
          {request && request.status !== "removed" && request.status !== "withdrawn" ? (
            <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Text className="text-[13px] font-medium text-slate-600">
                Your entry
              </Text>
              <TournamentRequestStatusBadge status={request.status} />
            </View>
          ) : null}

          {/* Actions */}
          {tournament.isOwner ? (
            <View className="mt-6">
              <Button onPress={() => router.push(`/tournaments/${tournament.id}/manage` as never)}>
                Manage Tournament
              </Button>
            </View>
          ) : request?.status === "accepted" ? (
            <View className="mt-6">
              <Button
                variant="outline"
                textClassName="text-red-600"
                className="border-red-200"
                onPress={() => {
                  setError(null);
                  setWithdrawOpen(true);
                }}
              >
                Withdraw Entry
              </Button>
            </View>
          ) : request?.status === "pending" ? (
            <View className="mt-6">
              <Button disabled>Request Pending</Button>
            </View>
          ) : request?.status === "declined" ? (
            <View className="mt-6">
              <Button disabled>Request Declined</Button>
            </View>
          ) : tournament.status !== "open" ? (
            <View className="mt-6">
              <Button disabled>
                {tournament.status === "completed"
                  ? "Tournament Completed"
                  : "Entries Closed"}
              </Button>
            </View>
          ) : tournament.isFull ? (
            <View className="mt-6">
              <Button disabled>Tournament Full</Button>
            </View>
          ) : canRequest ? (
            <View className="mt-6">
              <Button
                onPress={() =>
                  router.push(`/tournaments/${tournament.id}/request` as never)
                }
              >
                Request to Enter
              </Button>
            </View>
          ) : null}

          {/* Participants */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View participating teams"
            onPress={() => router.push(`/tournaments/${tournament.id}/participants` as never)}
            className="mt-4 flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
          >
            <View className="flex-row items-center gap-3">
              <Avatar uri={null} name={tournament.name} size={36} />
              <Text className="text-[13px] font-semibold text-slate-700">
                Participating teams
              </Text>
            </View>
            <Text className="text-[13px] font-bold text-brand">
              {tournament.acceptedCount}
            </Text>
          </Pressable>
        </ScreenScroll>
      )}

      <ConfirmDialog
        visible={withdrawOpen}
        title="Withdraw from this tournament?"
        description="This will release your team's place and the organiser will be notified."
        warning="This cannot be undone."
        confirmLabel="Yes, Withdraw"
        cancelLabel="Keep Entry"
        loadingLabel="Withdrawing..."
        loading={withdraw.isPending}
        error={error}
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawOpen(false)}
      />
    </Screen>
  );
}

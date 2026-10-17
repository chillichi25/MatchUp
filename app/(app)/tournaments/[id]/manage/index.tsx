import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CalendarDays,
  MapPin,
  Pencil,
  Send,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { toast } from "sonner-native";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { formatDateWithYear } from "@/features/friendlies/utils/format";

import { TournamentStatusBadge } from "@/features/tournaments/components/tournament-status-badge";
import {
  useCancelTournament,
  useCompleteTournament,
  useSetTournamentStatus,
} from "@/features/tournaments/hooks/use-tournament-organiser";
import { useTournamentDetail } from "@/features/tournaments/hooks/use-tournaments";
import { formatCapacity } from "@/features/tournaments/utils/format";

type Dialog = "cancel" | "complete" | null;

export default function ManageTournamentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useTournamentDetail(id);
  const setStatus = useSetTournamentStatus();
  const cancelTournament = useCancelTournament();
  const completeTournament = useCompleteTournament();

  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState<string | null>(null);

  const tournament = detail.data;

  async function toggleEntries() {
    if (!tournament) return;

    try {
      await setStatus.mutateAsync({
        tournamentId: tournament.id,
        status: tournament.status === "open" ? "closed" : "open",
      });
      toast.success(
        tournament.status === "open" ? "Entries closed" : "Entries reopened"
      );
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "Could not update entries."
      );
    }
  }

  async function handleCancel() {
    if (!tournament) return;

    setError(null);

    try {
      await cancelTournament.mutateAsync(tournament.id);
      setDialog(null);
      toast.success("Tournament cancelled");
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "The tournament could not be cancelled."
      );
    }
  }

  async function handleComplete() {
    if (!tournament) return;

    setError(null);

    try {
      await completeTournament.mutateAsync(tournament.id);
      setDialog(null);
      toast.success("Tournament completed");
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : "The tournament could not be completed."
      );
    }
  }

  return (
    <Screen>
      <PageHeader title="Manage" fallbackHref={`/tournaments/${id}`} />

      {detail.isLoading ? (
        <LoadingState />
      ) : !tournament ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="Tournament not found"
            description="This tournament may have been removed."
          />
        </View>
      ) : !tournament.isOwner ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="Not authorised"
            description="Only the organiser can manage this tournament."
          />
        </View>
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <View className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="min-w-0 flex-1 text-xl font-bold text-slate-950">
                {tournament.name}
              </Text>
              <TournamentStatusBadge
                status={tournament.status}
                isFull={tournament.isFull}
              />
            </View>

            <View className="mt-4 gap-2">
              <View className="flex-row items-center gap-2.5">
                <CalendarDays size={16} color="#64748B" />
                <Text className="text-[13px] text-slate-600">
                  {formatDateWithYear(tournament.startDate)}
                </Text>
              </View>

              <View className="flex-row items-center gap-2.5">
                <MapPin size={16} color="#64748B" />
                <Text className="flex-1 text-[13px] text-slate-600">
                  {tournament.location || "Location TBC"}
                </Text>
              </View>

              <View className="flex-row items-center gap-2.5">
                <Users size={16} color="#64748B" />
                <Text className="text-[13px] text-slate-600">
                  {formatCapacity(tournament.acceptedCount, tournament.maxTeams)}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-6 gap-3">
            <ManageRow
              icon={<Users size={18} color="#7C3AED" />}
              title="Participating teams"
              subtitle="View and remove accepted teams"
              onPress={() =>
                router.push(`/tournaments/${tournament.id}/manage/teams` as never)
              }
            />

            <ManageRow
              icon={<Send size={18} color="#7C3AED" />}
              title="Message participants"
              subtitle="Send an update to every accepted team"
              onPress={() =>
                router.push(`/tournaments/${tournament.id}/manage/message` as never)
              }
            />

            <ManageRow
              icon={<Pencil size={18} color="#7C3AED" />}
              title="Edit tournament"
              subtitle="Update details, times and eligibility"
              onPress={() =>
                router.push(`/tournaments/${tournament.id}/manage/edit` as never)
              }
            />
          </View>

          {tournament.status === "open" || tournament.status === "closed" ? (
            <View className="mt-6 gap-3">
              <Button
                variant="outline"
                loading={setStatus.isPending}
                onPress={toggleEntries}
              >
                {tournament.status === "open"
                  ? "Close Entries"
                  : "Reopen Entries"}
              </Button>

              <Button
                variant="secondary"
                onPress={() => {
                  setError(null);
                  setDialog("complete");
                }}
              >
                Mark as Completed
              </Button>

              <Button
                variant="outline"
                textClassName="text-red-600"
                className="border-red-200"
                onPress={() => {
                  setError(null);
                  setDialog("cancel");
                }}
              >
                Cancel Tournament
              </Button>
            </View>
          ) : null}
        </ScreenScroll>
      )}

      <ConfirmDialog
        visible={dialog === "cancel"}
        title="Cancel this tournament?"
        description="This will cancel the tournament and notify all teams with pending or accepted entries."
        warning="This cannot be undone."
        confirmLabel="Yes, Cancel Tournament"
        loadingLabel="Cancelling..."
        loading={cancelTournament.isPending}
        error={error}
        onConfirm={handleCancel}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        visible={dialog === "complete"}
        title="Mark tournament as completed?"
        description="This will close the tournament and move it to your history."
        confirmLabel="Yes, Mark Completed"
        cancelLabel="Keep Open"
        loadingLabel="Completing..."
        loading={completeTournament.isPending}
        error={error}
        onConfirm={handleComplete}
        onCancel={() => setDialog(null)}
      />
    </Screen>
  );
}

function ManageRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
        {icon}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[13px] font-semibold text-slate-950">{title}</Text>
        <Text numberOfLines={1} className="mt-0.5 text-[11px] text-slate-500">
          {subtitle}
        </Text>
      </View>

      <Text className="text-lg text-slate-400">›</Text>
    </Pressable>
  );
}

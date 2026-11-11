import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, Clock, MapPin } from "lucide-react-native";
import { useRef, useState, type ReactNode } from "react";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/state-views";
import {
  formatDateWithYear,
  formatKickOff,
} from "@/features/friendlies/utils/format";
import { MatchResultPanel } from "@/features/matches/components/match-result-panel";
import {
  useCancelMatch,
  useMatchDetail,
  usePendingMatchResult,
} from "@/features/matches/hooks/use-matches";
import type { MatchTeamSummary } from "@/features/matches/types";

const GREEN = "#009E45";

const STATUS_STYLES = {
  scheduled: {
    label: "Scheduled",
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  completed: {
    label: "Completed",
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
  },
  cancelled: {
    label: "Cancelled",
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
};

export default function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useMatchDetail(id);
  const cancelMatch = useCancelMatch();
  const cancellingRef = useRef(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const match = detail.data;

  const needsResult =
    match?.status === "scheduled" && Boolean(match.isPast);

  // Uses the same query key as MatchResultPanel.
  const pendingResult = usePendingMatchResult(id, needsResult);

  async function handleCancel() {
    if (
      !match ||
      match.status !== "scheduled" ||
      match.isPast ||
      cancellingRef.current
    ) {
      return;
    }

    cancellingRef.current = true;
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
    } finally {
      cancellingRef.current = false;
    }
  }

  if (detail.isLoading) {
    return (
      <Screen>
        <PageHeader
          title="Match details"
          fallbackHref="/matches/upcoming"
        />
        <LoadingState />
      </Screen>
    );
  }

  if (detail.isError) {
    return (
      <Screen>
        <PageHeader
          title="Match details"
          fallbackHref="/matches/upcoming"
        />

        <ErrorState
          className="mt-6"
          description="We couldn't load this match."
          onRetry={() => void detail.refetch()}
        />
      </Screen>
    );
  }

  if (!match) {
    return (
      <Screen>
        <PageHeader
          title="Match details"
          fallbackHref="/matches/upcoming"
        />

        <View className="px-6 pt-6">
          <EmptyState
            title="Match not found"
            description="This match may have been removed or you may not have access."
          />
        </View>
      </Screen>
    );
  }

  const status = !needsResult
    ? STATUS_STYLES[match.status]
    : pendingResult.data
      ? {
          label: "Awaiting confirmation",
          backgroundColor: "#FFF7DB",
          color: "#92400E",
        }
      : pendingResult.isLoading
        ? {
            label: "Checking result…",
            backgroundColor: "#F1F5F9",
            color: "#475569",
          }
        : pendingResult.isError
          ? {
              label: "Result status unavailable",
              backgroundColor: "#F1F5F9",
              color: "#475569",
            }
          : {
              label: "Result not recorded",
              backgroundColor: "#FFF7DB",
              color: "#92400E",
            };

  const hasFinalScore =
    match.status === "completed" &&
    match.homeScore != null &&
    match.awayScore != null;

  return (
    <Screen>
      <PageHeader
        title="Match details"
        fallbackHref="/matches/upcoming"
      />

      <ScreenScroll contentClassName="px-6 pb-8 pt-6">
        <View className="overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white">
          <View className="px-4 pb-5 pt-4">
            <View className="items-center">
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: status.backgroundColor }}
              >
                <Text
                  accessibilityLiveRegion="polite"
                  style={{
                    color: status.color,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {status.label}
                </Text>
              </View>
            </View>

            <View className="mt-5 flex-row items-start gap-3">
              <TeamColumn team={match.homeTeam} label="Home" />

              <View className="self-center">
                <Text className="text-[13px] font-semibold text-[#596B80]">
                  vs
                </Text>
              </View>

              <TeamColumn team={match.awayTeam} label="Away" />
            </View>

            {hasFinalScore ? (
              <View className="mt-5 items-center rounded-2xl bg-slate-50 px-4 py-4">
                <Text className="text-[12px] font-semibold text-[#596B80]">
                  Final score · Home – Away
                </Text>

                <Text className="mt-1 text-[30px] font-bold text-[#07192D]">
                  {match.homeScore} – {match.awayScore}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="gap-3 border-t border-slate-100 p-4">
            <DetailRow
              icon={
                <CalendarDays
                  size={18}
                  color={GREEN}
                  strokeWidth={1.9}
                />
              }
              label="Match date"
              value={formatDateWithYear(match.matchDate)}
            />

            {match.kickOff ? (
              <DetailRow
                icon={
                  <Clock
                    size={18}
                    color={GREEN}
                    strokeWidth={1.9}
                  />
                }
                label="Kick-off time"
                value={formatKickOff(match.kickOff)}
              />
            ) : null}

            <DetailRow
              icon={
                <MapPin
                  size={18}
                  color={GREEN}
                  strokeWidth={1.9}
                />
              }
              label="Town or city"
              value={match.location?.trim() || "To be confirmed"}
            />
          </View>
        </View>

        <MatchResultPanel key={match.id} match={match} />

        {match.status === "cancelled" ? (
          <View className="mt-4 rounded-2xl bg-slate-100 p-4">
            <Text className="text-center text-[13px] leading-5 text-[#596B80]">
              This match has been cancelled. You can still view
              previous messages.
            </Text>
          </View>
        ) : null}

        <View className="mt-5 gap-3">
          {match.conversationId ? (
            <Button
              variant="outline"
              className="min-h-[50px] w-full rounded-full border-slate-200 bg-white"
              onPress={() =>
                router.push(`/chat/${match.conversationId}` as never)
              }
            >
              <Text className="text-[15px] font-semibold text-[#07192D]">
                {match.status === "cancelled"
                  ? "View chat"
                  : "Open chat"}
              </Text>
            </Button>
          ) : null}

          {match.status === "scheduled" && !match.isPast ? (
            <Button
              variant="outline"
              className="min-h-[50px] w-full rounded-full border-red-200"
              disabled={cancelMatch.isPending}
              onPress={() => {
                setError(null);
                setConfirmOpen(true);
              }}
            >
              <Text
                style={{
                  color: "#B91C1C",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Cancel match
              </Text>
            </Button>
          ) : null}
        </View>
      </ScreenScroll>

      <ConfirmDialog
        visible={confirmOpen}
        title="Cancel this match?"
        description="This will cancel the match for both teams."
        warning="This cannot be undone."
        confirmLabel="Cancel match"
        cancelLabel="Keep match"
        loadingLabel="Cancelling…"
        loading={cancelMatch.isPending}
        error={error}
        onConfirm={handleCancel}
        onCancel={() => {
          if (!cancellingRef.current) {
            setConfirmOpen(false);
          }
        }}
      />
    </Screen>
  );
}

function TeamColumn({
  team,
  label,
}: {
  team: MatchTeamSummary;
  label: string;
}) {
  return (
    <View className="min-w-0 flex-1 items-center">
      <Text className="mb-3 text-[12px] font-medium text-[#596B80]">
        {label}
      </Text>

      <Avatar
        uri={team.badgeUrl}
        name={team.clubName || team.teamName || "Team"}
        size={52}
      />

      <Text className="mt-3 text-center text-[15px] font-bold leading-5 text-[#07192D]">
        {team.teamName || "Team"}
      </Text>

      {team.clubName ? (
        <Text className="mt-1 text-center text-[12px] leading-[18px] text-[#596B80]">
          {team.clubName}
        </Text>
      ) : null}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-50">
        {icon}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[12px] text-[#596B80]">
          {label}
        </Text>

        <Text className="mt-0.5 text-[14px] font-semibold text-[#07192D]">
          {value}
        </Text>
      </View>
    </View>
  );
}
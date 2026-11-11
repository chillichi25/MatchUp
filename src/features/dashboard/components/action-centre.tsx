import { useCallback, type ReactNode } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Mail,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import {
  useCanManageClub,
  useMyClub,
  usePendingTeamJoinRequests,
} from "@/features/clubs/hooks/use-club-queries";
import { useMatchesToConfirm } from "@/features/matches/hooks/use-matches";

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null;

  return (
    <View className="absolute -right-1 -top-1 h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-500 px-1">
      <Text className="text-[10px] font-bold leading-none text-white">
        {value > 9 ? "9+" : value}
      </Text>
    </View>
  );
}

type ActionRowProps = {
  onPress: () => void;
  iconBackground: string;
  icon: ReactNode;
  title: string;
  description: string;
  count: number;
  accessibilityLabel?: string;
};

function ActionRow({
  onPress,
  iconBackground,
  icon,
  title,
  description,
  count,
  accessibilityLabel,
}: ActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ??
        `${title}. ${description}${
          count > 0 ? `. ${count} pending` : ""
        }`
      }
      onPress={onPress}
      className="min-h-[76px] flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm active:bg-slate-50"
    >
      <View
        className={`relative h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBackground}`}
      >
        {icon}
        <CountBadge value={count} />
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-bold leading-tight text-slate-950">
          {title}
        </Text>

        <Text className="mt-1 text-[12px] leading-[17px] text-slate-500">
          {description}
        </Text>
      </View>

      <ChevronRight
        size={18}
        color="#64748B"
        strokeWidth={2}
      />
    </Pressable>
  );
}

export function ActionCentre({
  pendingRequests,
  awaitingResponses,
}: {
  pendingRequests: number;
  awaitingResponses: number;
}) {
  const router = useRouter();

  const myClubQuery = useMyClub();
  const clubId = myClubQuery.data?.club_id ?? "";

  const permissionQuery = useCanManageClub(clubId);

  const canManageClub =
    Boolean(clubId) &&
    !myClubQuery.isError &&
    !permissionQuery.isError &&
    permissionQuery.data === true;

  const clubRequestsQuery = usePendingTeamJoinRequests(
    canManageClub ? clubId : ""
  );

  const resultsQuery = useMatchesToConfirm();

  const { refetch: refreshClub } = myClubQuery;
  const { refetch: refreshPermission } = permissionQuery;
  const { refetch: refreshClubRequests } = clubRequestsQuery;
  const { refetch: refreshResults } = resultsQuery;

  useFocusEffect(
    useCallback(() => {
      void refreshClub();
      void refreshResults();

      if (clubId) {
        void refreshPermission();
      }

      if (canManageClub) {
        void refreshClubRequests();
      }
    }, [
      clubId,
      canManageClub,
      refreshClub,
      refreshPermission,
      refreshClubRequests,
      refreshResults,
    ])
  );

  const hasMatchUpdates =
    pendingRequests > 0 || awaitingResponses > 0;

  const clubRequestCount =
    clubRequestsQuery.data?.length ?? 0;

  const displayedClubCount =
    clubRequestsQuery.isError ? 0 : clubRequestCount;

  const resultCount = resultsQuery.isError
    ? 0
    : resultsQuery.data?.length ?? 0;

  const showResultsRow =
    resultCount > 0 || resultsQuery.isError;

  let clubDescription = "No requests awaiting approval";

  if (clubRequestsQuery.isError) {
    clubDescription = "Open to check join requests";
  } else if (clubRequestsQuery.isLoading) {
    clubDescription = "Checking join requests…";
  } else if (clubRequestCount > 0) {
    clubDescription = `${clubRequestCount} ${
      clubRequestCount === 1 ? "request" : "requests"
    } awaiting approval`;
  }

  const resultDescription = resultsQuery.isError
    ? "Couldn't check results. Tap to try again."
    : `${resultCount} ${
        resultCount === 1 ? "score needs" : "scores need"
      } your confirmation`;

  if (!hasMatchUpdates && !canManageClub && !showResultsRow) {
    return null;
  }

  return (
    <View className="mt-8">
      <Text className="text-[18px] font-bold tracking-tight text-slate-950">
        Requests &amp; Updates
      </Text>

      <View className="mt-3 gap-3">
        {showResultsRow ? (
          <ActionRow
            onPress={() =>
              router.push(
                "/matches/upcoming?filter=results-to-confirm" as never
              )
            }
            iconBackground="bg-amber-50"
            icon={
              <ClipboardCheck
                size={24}
                strokeWidth={2}
                color="#B45309"
              />
            }
            title="Results to confirm"
            description={resultDescription}
            count={resultCount}
            accessibilityLabel={`Results to confirm. ${resultDescription}`}
          />
        ) : null}

        {canManageClub ? (
          <ActionRow
            onPress={() =>
              router.push("/clubs/requests" as never)
            }
            iconBackground="bg-green-50"
            icon={
              <ClipboardList
                size={24}
                strokeWidth={2}
                color="#009E45"
              />
            }
            title="Club join requests"
            description={clubDescription}
            count={displayedClubCount}
            accessibilityLabel={`Club join requests. ${clubDescription}`}
          />
        ) : null}

        {hasMatchUpdates ? (
          <>
            <ActionRow
              onPress={() =>
                router.push("/friendlies/requests" as never)
              }
              iconBackground="bg-green-50"
              icon={
                <Mail
                  size={24}
                  strokeWidth={2.2}
                  color="#009E45"
                />
              }
              title="Match requests"
              description="Teams interested in playing"
              count={pendingRequests}
            />

            <ActionRow
              onPress={() =>
                router.push("/friendlies/sent" as never)
              }
              iconBackground="bg-amber-50"
              icon={
                <Clock3
                  size={25}
                  strokeWidth={2.2}
                  color="#F59E0B"
                />
              }
              title="Awaiting response"
              description="Requests you've sent"
              count={awaitingResponses}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}
import { useRouter } from "expo-router";
import { Volleyball } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { ScreenScroll } from "@/components/ui/screen";
import { ErrorState, LoadingState } from "@/components/ui/state-views";
import { ActionCentre } from "@/features/dashboard/components/action-centre";
import { DashboardActions } from "@/features/dashboard/components/dashboard-actions";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { LookingForMatch } from "@/features/dashboard/components/looking-for-match";
import { NextMatchCard } from "@/features/dashboard/components/next-match-card";
import { NextTournamentCard } from "@/features/dashboard/components/next-tournament-card";
import { ResultCard } from "@/features/dashboard/components/result-card";
import { TeamPerformance } from "@/features/dashboard/components/team-performance";
import { Upcoming } from "@/features/dashboard/components/upcoming";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function DashboardScreen() {
  const router = useRouter();

  const { data: activeTeam } = useActiveTeam();
  const dashboard = useDashboard(activeTeam?.id);

  const data = dashboard.data;

  if (dashboard.isLoading) {
    return (
      <ScreenScroll contentClassName="px-5 pb-24 pt-6">
        <DashboardHeader coachName="Coach" />
        <LoadingState label="Loading your dashboard…" />
      </ScreenScroll>
    );
  }

  if (dashboard.isError || !data) {
    return (
      <ScreenScroll contentClassName="px-5 pb-24 pt-6">
        <DashboardHeader coachName="Coach" />
        <ErrorState
          title="Couldn't load your dashboard"
          description="Check your connection and try again."
          onRetry={() => dashboard.refetch()}
        />
      </ScreenScroll>
    );
  }

  const {
    coachName,
    nextMatch,
    nextTournament,
    upcomingMatches,
    upcomingTournaments,
    friendly,
    tournament,
    stats,
    statistics,
    recentResults,
  } = data;

  const nextMatchDateTime = nextMatch
    ? new Date(
        `${nextMatch.matchDate}T${nextMatch.kickOff ?? "00:00:00"}`
      ).getTime()
    : null;

  const nextTournamentDateTime = nextTournament
    ? new Date(
        `${nextTournament.startDate}T${nextTournament.startTime ?? "00:00:00"}`
      ).getTime()
    : null;

  let nextEvent: "match" | "tournament" | null = null;

  if (nextMatchDateTime !== null && nextTournamentDateTime !== null) {
    nextEvent =
      nextMatchDateTime <= nextTournamentDateTime ? "match" : "tournament";
  } else if (nextMatchDateTime !== null) {
    nextEvent = "match";
  } else if (nextTournamentDateTime !== null) {
    nextEvent = "tournament";
  }

  const nextEventId =
    nextEvent === "match"
      ? nextMatch?.id ?? null
      : nextEvent === "tournament"
        ? nextTournament?.id ?? null
        : null;

  return (
    <ScreenScroll contentClassName="px-5 pb-24 pt-6">
      <DashboardHeader coachName={coachName} />

      <DashboardActions />

      {/* Up Next */}
      <View className="mt-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-[18px] font-bold tracking-tight text-slate-950">
            Up Next
          </Text>

          {nextEvent ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View all upcoming"
              onPress={() => router.push("/matches")}
            >
              <Text className="text-[13px] font-semibold text-[#00B83F]">
                View all ›
              </Text>
            </Pressable>
          ) : null}
        </View>

        {nextEvent === "match" && nextMatch ? (
          <NextMatchCard match={nextMatch} />
        ) : null}

        {nextEvent === "tournament" && nextTournament ? (
          <NextTournamentCard tournament={nextTournament} />
        ) : null}

        {!nextEvent ? (
          <View className="mt-3 flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
            <View className="h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
              <Volleyball size={20} color="#00B83F" strokeWidth={2} />
            </View>

            <View className="min-w-0 flex-1">
              <Text className="text-[13px] font-bold text-slate-950">
                Nothing scheduled yet
              </Text>

              <Text className="mt-0.5 text-[11px] leading-[16px] text-slate-500">
                Your next match or tournament will appear here.
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <ActionCentre
        pendingRequests={stats.pendingRequests}
        awaitingResponses={stats.awaitingResponses}
      />

      <LookingForMatch friendly={friendly} tournament={tournament} />

      <Upcoming
        matches={upcomingMatches}
        tournaments={upcomingTournaments}
        nextEventType={nextEvent}
        nextEventId={nextEventId}
      />

      {(statistics?.played ?? 0) > 0 && statistics ? (
        <TeamPerformance
          played={statistics.played}
          wins={statistics.wins}
          draws={statistics.draws}
          losses={statistics.losses}
        />
      ) : null}

      {recentResults.length > 0 ? (
        <View className="mt-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-[18px] font-bold tracking-tight text-slate-950">
              Recent Results
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View all results"
              onPress={() => router.push("/matches")}
            >
              <Text className="text-[13px] font-semibold text-[#00B83F]">
                View all ›
              </Text>
            </Pressable>
          </View>

          <View className="mt-3 gap-3">
            {recentResults.slice(0, 3).map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </View>
        </View>
      ) : null}
    </ScreenScroll>
  );
}

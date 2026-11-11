import { useCallback } from "react";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { CalendarDays, ClipboardCheck } from "lucide-react-native";
import { Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/state-views";
import { UpcomingMatchCard } from "@/features/matches/components/upcoming-match-card";
import {
  useMatchesToConfirm,
  useUpcomingMatches,
} from "@/features/matches/hooks/use-matches";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function UpcomingMatchesScreen() {
  const router = useRouter();
  const { filter } = useLocalSearchParams<{
    filter?: string;
  }>();

  const showingResults = filter === "results-to-confirm";

  const matches = useUpcomingMatches();
  const results = useMatchesToConfirm();
  const activeTeam = useActiveTeam();

  const { refetch: refreshMatches } = matches;
  const { refetch: refreshResults } = results;

  useFocusEffect(
    useCallback(() => {
      if (showingResults) {
        void refreshResults();
      } else {
        void refreshMatches();
      }
    }, [showingResults, refreshMatches, refreshResults])
  );

  const items = matches.data ?? [];
  const upcoming = items.filter((match) => !match.isPast);
  const past = items
    .filter((match) => match.isPast)
    .slice()
    .reverse();

  const visibleQuery = showingResults ? results : matches;

  return (
    <Screen>
      <PageHeader
        title={
          showingResults
            ? "Results to confirm"
            : "Upcoming matches"
        }
        fallbackHref="/dashboard"
      />

      <ScreenScroll
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 128,
        }}
      >
        <Text className="text-[26px] font-bold tracking-tight text-[#07192D]">
          {showingResults
            ? "Results to confirm"
            : "Your schedule"}
        </Text>

        <Text className="mt-1 text-[13px] leading-5 text-[#596B80]">
          {showingResults
            ? "Review scores submitted by opposing coaches."
            : `Confirmed matches for ${
                activeTeam.data?.name ?? "your team"
              }.`}
        </Text>

        {visibleQuery.isLoading ? (
          <LoadingState className="mt-6" />
        ) : visibleQuery.isError ? (
          <ErrorState
            className="mt-6"
            description={
              showingResults
                ? "We couldn't load results to confirm."
                : "We couldn't load your matches."
            }
            onRetry={() => void visibleQuery.refetch()}
          />
        ) : showingResults ? (
          <View className="mt-6">
            {(results.data ?? []).length === 0 ? (
              <EmptyState
                icon={
                  <ClipboardCheck
                    size={24}
                    color="#009E45"
                    strokeWidth={1.8}
                  />
                }
                title="No results to confirm"
                description="Scores submitted by opposing coaches will appear here."
              />
            ) : (
              <View className="gap-3">
                {(results.data ?? []).map((match) => (
                  <UpcomingMatchCard
                    key={match.id}
                    match={match}
                    onPress={() =>
                      router.push(`/matches/${match.id}` as never)
                    }
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            <View className="mt-6">
              {upcoming.length === 0 ? (
                <EmptyState
                  icon={
                    <CalendarDays
                      size={24}
                      color="#009E45"
                      strokeWidth={1.8}
                    />
                  }
                  title="No upcoming matches"
                  description="Your next confirmed match will appear here."
                />
              ) : (
                <View className="gap-3">
                  {upcoming.map((match) => (
                    <UpcomingMatchCard
                      key={match.id}
                      match={match}
                      onPress={() =>
                        router.push(`/matches/${match.id}` as never)
                      }
                    />
                  ))}
                </View>
              )}
            </View>

            {past.length > 0 ? (
              <View className="mt-8">
                <Text className="text-[15px] font-bold text-[#07192D]">
                  Past matches
                </Text>

                <Text className="mt-1 text-[13px] leading-5 text-[#596B80]">
                  Past matches with results to record or confirm.
                </Text>

                <View className="mt-3 gap-3">
                  {past.map((match) => (
                    <UpcomingMatchCard
                      key={match.id}
                      match={match}
                      onPress={() =>
                        router.push(`/matches/${match.id}` as never)
                      }
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScreenScroll>
    </Screen>
  );
}
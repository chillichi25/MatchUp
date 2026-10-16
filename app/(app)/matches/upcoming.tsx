import { useRouter } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import { Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state-views";
import { UpcomingMatchCard } from "@/features/matches/components/upcoming-match-card";
import { useUpcomingMatches } from "@/features/matches/hooks/use-matches";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function UpcomingMatchesScreen() {
  const router = useRouter();
  const matches = useUpcomingMatches();
  const activeTeam = useActiveTeam();

  return (
    <Screen>
      <PageHeader title="Upcoming Matches" fallbackHref="/dashboard" />

      <ScreenScroll contentContainerClassName="px-5 pb-32">
        <View className="mt-8">
          <Text className="text-2xl font-bold text-slate-950">Your Schedule</Text>
          <Text className="mt-2 text-sm text-slate-500">
            Confirmed matches for {activeTeam.data?.name ?? "your team"}.
          </Text>
        </View>

        {matches.isLoading ? (
          <LoadingState className="mt-7" />
        ) : matches.isError ? (
          <ErrorState
            className="mt-7"
            description="We couldn't load your matches."
            onRetry={() => matches.refetch()}
          />
        ) : (matches.data ?? []).length === 0 ? (
          <View className="mt-7">
            <EmptyState
              icon={<CalendarDays size={24} color="#00B83F" strokeWidth={1.9} />}
              title="No upcoming matches"
              description="You don't have any matches scheduled yet."
            />
          </View>
        ) : (
          <View className="mt-7 gap-4">
            {(matches.data ?? []).map((match) => (
              <UpcomingMatchCard
                key={match.id}
                match={match}
                onPress={() => router.push(`/matches/${match.id}` as never)}
              />
            ))}
          </View>
        )}
      </ScreenScroll>
    </Screen>
  );
}

import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { TournamentForm } from "@/features/tournaments/components/tournament-form";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function CreateTournamentScreen() {
  const router = useRouter();
  const activeTeam = useActiveTeam();

  if (activeTeam.isLoading) {
    return (
      <Screen>
        <PageHeader title="Create a Tournament" fallbackHref="/create" />
        <LoadingState />
      </Screen>
    );
  }

  const team = activeTeam.data;

  if (!team) {
    return (
      <Screen>
        <PageHeader title="Create a Tournament" fallbackHref="/create" />
        <View className="px-4 pt-6">
          <EmptyState
            title="You need an active team"
            description="Select or create a team before organising a tournament."
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader title="Create a Tournament" fallbackHref="/create" />

      <ScreenScroll contentContainerClassName="px-5 pb-32">
        <View className="mt-6">
          <Text className="text-[26px] font-bold tracking-tight text-slate-900">
            Organise your tournament
          </Text>
          <Text className="mt-0.5 text-[13px] leading-5 text-slate-500">
            Add the tournament details and open it for team entries.
          </Text>
        </View>

        <TournamentForm
          teamName={team.name}
          clubName={team.clubs?.name ?? ""}
          onSaved={(id) => router.replace(`/tournaments/${id}` as never)}
        />
      </ScreenScroll>
    </Screen>
  );
}

import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { FriendlyForm } from "@/features/friendlies/components/friendly-form";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function CreateFriendlyScreen() {
  const router = useRouter();
  const activeTeam = useActiveTeam();

  if (activeTeam.isLoading) {
    return (
      <Screen>
        <PageHeader title="Create a Match" fallbackHref="/create" />
        <LoadingState />
      </Screen>
    );
  }

  const team = activeTeam.data;

  if (!team) {
    return (
      <Screen>
        <PageHeader title="Create a Match" fallbackHref="/create" />
        <View className="px-4 pt-6">
          <EmptyState
            title="You need an active team"
            description="Select or create a team before posting a friendly."
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader title="Create a Match" fallbackHref="/create" />

      <ScreenScroll contentContainerClassName="px-5 pb-32">
        <View className="mt-6">
          <Text className="text-[26px] font-bold tracking-tight text-slate-900">
            Find your next opponent
          </Text>
          <Text className="mt-0.5 text-[13px] leading-5 text-slate-500">
            Add the match details and find your next opponent.
          </Text>
        </View>

        <FriendlyForm
          teamId={team.id}
          teamName={team.name}
          clubName={team.clubs?.name ?? ""}
          teamMatchFormat={team.match_format}
          onSaved={(id) => router.replace(`/friendlies/${id}` as never)}
        />
      </ScreenScroll>
    </Screen>
  );
}

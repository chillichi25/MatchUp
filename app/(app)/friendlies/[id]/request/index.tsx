import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { FriendlyRequestForm } from "@/features/friendlies/components/friendly-request-form";
import { useFriendlyDetail } from "@/features/friendlies/hooks/use-friendlies";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function RequestFriendlyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useFriendlyDetail(id);
  const activeTeam = useActiveTeam();

  if (detail.isLoading || activeTeam.isLoading) {
    return (
      <Screen>
        <PageHeader title="Request Match" fallbackHref={`/friendlies/${id}`} />
        <LoadingState />
      </Screen>
    );
  }

  const friendly = detail.data;
  const team = activeTeam.data;

  if (!friendly) {
    return (
      <Screen>
        <PageHeader title="Request Match" fallbackHref="/matches" />
        <View className="px-4 pt-6">
          <EmptyState
            title="Match not found"
            description="This match may have been removed."
          />
        </View>
      </Screen>
    );
  }

  if (friendly.isOwner || friendly.status !== "open") {
    return <Redirect href={`/friendlies/${friendly.id}` as never} />;
  }

  if (!team) {
    return (
      <Screen>
        <PageHeader title="Request Match" fallbackHref={`/friendlies/${friendly.id}`} />
        <View className="px-4 pt-6">
          <EmptyState
            title="You need an active team"
            description="Select a team before requesting a match."
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PageHeader title="Request Match" fallbackHref={`/friendlies/${friendly.id}`} />

      <ScreenScroll contentContainerClassName="px-5 pb-32">
        <View className="mt-6">
          <Text className="text-[26px] font-bold tracking-tight text-slate-900">
            Request this match?
          </Text>
          <Text className="mt-0.5 text-[13px] leading-5 text-slate-500">
            Send a request if you&apos;re interested in this match.
          </Text>
        </View>

        <View className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
          <View className="flex-row items-center gap-3">
            <View className="min-w-0 flex-1 items-center">
              <Avatar
                uri={team.clubs?.badge_url ?? null}
                name={team.clubs?.name ?? team.name}
                size={52}
              />
              <Text
                numberOfLines={2}
                className="mt-3 text-center text-[13px] font-bold leading-4 text-slate-950"
              >
                {team.clubs?.name ?? team.name}
              </Text>
              <Text numberOfLines={1} className="mt-1 text-[12px] text-slate-500">
                {team.name}
              </Text>
            </View>

            <Text className="px-1 text-[11px] font-bold uppercase text-slate-500">
              VS
            </Text>

            <View className="min-w-0 flex-1 items-center">
              <Avatar
                uri={friendly.badgeUrl}
                name={friendly.clubName}
                size={52}
              />
              <Text
                numberOfLines={2}
                className="mt-3 text-center text-[13px] font-bold leading-4 text-slate-950"
              >
                {friendly.clubName}
              </Text>
              <Text numberOfLines={1} className="mt-1 text-[12px] text-slate-500">
                {friendly.teamName}
              </Text>
            </View>
          </View>

          <View className="mt-5 flex-row border-t border-slate-100 pt-3">
            <Text className="flex-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Your Team
            </Text>
            <Text className="flex-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Opponent
            </Text>
          </View>
        </View>

        <FriendlyRequestForm
          friendlyId={friendly.id}
          requestingTeamId={team.id}
          onSent={() =>
            router.replace(`/friendlies/${friendly.id}/request/sent` as never)
          }
        />
      </ScreenScroll>
    </Screen>
  );
}

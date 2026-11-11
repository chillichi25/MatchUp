import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, Clock, MapPin } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { FriendlyRequestForm } from "@/features/friendlies/components/friendly-request-form";
import { useFriendlyDetail } from "@/features/friendlies/hooks/use-friendlies";
import {
  formatDateWithYear,
  formatKickOff,
} from "@/features/friendlies/utils/format";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";
import { useOutgoingRequests } from "@/features/friendlies/hooks/use-friendly-requests";

const GREEN = "#009E45";

export default function RequestFriendlyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useFriendlyDetail(id);
  const activeTeam = useActiveTeam();

  const outgoingRequests = useOutgoingRequests();

const hasPendingRequest = Boolean(
  outgoingRequests.data?.some(
    (request) =>
      request.friendlyId === detail.data?.id &&
      request.requester.teamId === activeTeam.data?.id &&
      request.status === "pending"
  )
);

  if (detail.isLoading || activeTeam.isLoading) {
    return (
      <Screen>
        <PageHeader
          title="Request to play"
          fallbackHref={`/friendlies/${id}`}
        />
        <LoadingState />
      </Screen>
    );
  }

  const friendly = detail.data;
  const team = activeTeam.data;

  if (!friendly) {
    return (
      <Screen>
        <PageHeader title="Request to play" fallbackHref="/matches" />

        <View className="px-6 pt-6">
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
        <PageHeader
          title="Request to play"
          fallbackHref={`/friendlies/${friendly.id}`}
        />

        <View className="px-6 pt-6">
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
      <PageHeader
        title="Request to play"
        fallbackHref={`/friendlies/${friendly.id}`}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScreenScroll
          contentClassName="px-6 pb-8 pt-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center">
  <Text
    accessibilityRole="header"
    className="text-center text-[28px] tracking-tight text-[#07192D]"
    style={{ fontWeight: "800" }}
  >
    {hasPendingRequest ? "Request sent" : "Request to play"}
  </Text>

  <Text className="mt-2 max-w-[320px] text-center text-[15px] leading-[22px] text-[#596B80]">
    {hasPendingRequest
      ? "You’re waiting for the other coach to respond."
      : "Let the other coach know your team would like to play."}
  </Text>
</View>

          <View className="mt-6 overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white">
            <View className="flex-row items-start gap-3 px-4 py-5">
              <View className="min-w-0 flex-1 items-center">
                <Text className="mb-3 text-[11px] font-semibold text-[#596B80]">
                  Your team
                </Text>

                <Avatar
                  uri={team.clubs?.badge_url ?? null}
                  name={team.clubs?.name ?? team.name}
                  size={52}
                />

                <Text className="mt-3 text-center text-[15px] font-bold leading-5 text-[#07192D]">
                  {team.name}
                </Text>

                {team.clubs?.name ? (
                  <Text className="mt-1 text-center text-[12px] leading-[18px] text-[#596B80]">
                    {team.clubs.name}
                  </Text>
                ) : null}
              </View>

              <View className="self-center">
                <Text className="text-[12px] font-semibold text-[#596B80]">
                  vs
                </Text>
              </View>

              <View className="min-w-0 flex-1 items-center">
                <Text className="mb-3 text-[11px] font-semibold text-[#596B80]">
                  Opponent
                </Text>

                <Avatar
                  uri={friendly.badgeUrl}
                  name={friendly.clubName || friendly.teamName}
                  size={52}
                />

                <Text className="mt-3 text-center text-[15px] font-bold leading-5 text-[#07192D]">
                  {friendly.teamName || friendly.clubName}
                </Text>

                {friendly.teamName && friendly.clubName ? (
                  <Text className="mt-1 text-center text-[12px] leading-[18px] text-[#596B80]">
                    {friendly.clubName}
                  </Text>
                ) : null}
              </View>
            </View>

            <View className="gap-3 border-t border-slate-100 px-4 py-4">
              <View
                className="flex-row flex-wrap items-center"
                style={{ columnGap: 16, rowGap: 8 }}
              >
                <View className="flex-row items-center gap-2">
                  <CalendarDays
                    size={17}
                    color={GREEN}
                    strokeWidth={1.9}
                  />

                  <Text className="text-[13px] font-semibold text-[#07192D]">
                    {formatDateWithYear(friendly.matchDate)}
                  </Text>
                </View>

                {friendly.kickOff ? (
                  <View className="flex-row items-center gap-2">
                    <Clock
                      size={17}
                      color={GREEN}
                      strokeWidth={1.9}
                    />

                    <Text className="text-[13px] font-semibold text-[#07192D]">
                      {formatKickOff(friendly.kickOff)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {friendly.location?.trim() ? (
                <View className="flex-row items-start gap-2">
                  <MapPin
                    size={17}
                    color={GREEN}
                    strokeWidth={1.9}
                  />

                  <Text className="min-w-0 flex-1 text-[13px] leading-[18px] text-[#596B80]">
                    {friendly.location}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <FriendlyRequestForm
            friendlyId={friendly.id}
            requestingTeamId={team.id}
            onSent={() =>
              router.replace(
                `/friendlies/${friendly.id}/request/sent` as never
              )
            }
          />
        </ScreenScroll>
      </KeyboardAvoidingView>
    </Screen>
  );
}
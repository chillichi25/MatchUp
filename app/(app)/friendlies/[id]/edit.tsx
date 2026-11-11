import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { FriendlyForm } from "@/features/friendlies/components/friendly-form";
import { resolveMatchFormat } from "@/features/friendlies/constants";
import { useFriendlyDetail } from "@/features/friendlies/hooks/use-friendlies";

export default function EditFriendlyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useFriendlyDetail(id);

  if (detail.isLoading) {
    return (
      <Screen>
        <PageHeader
          title="Edit match"
          fallbackHref={`/friendlies/${id}`}
        />
        <LoadingState />
      </Screen>
    );
  }

  const friendly = detail.data;

  if (!friendly) {
    return (
      <Screen>
        <PageHeader title="Edit match" fallbackHref="/matches" />

        <View className="px-5 pt-6">
          <EmptyState
            title="Match not found"
            description="This match may have been removed."
          />
        </View>
      </Screen>
    );
  }

  if (!friendly.isOwner || friendly.status !== "open") {
    return (
      <Redirect href={`/friendlies/${friendly.id}` as never} />
    );
  }

  return (
    <Screen>
      <PageHeader
        title="Edit match"
        fallbackHref={`/friendlies/${friendly.id}`}
      />

      <ScreenScroll
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 128,
        }}
      >
        <View>
          <Text
            accessibilityRole="header"
            className="text-[26px] font-bold tracking-tight text-[#07192D]"
          >
            Update match details
          </Text>

          <Text className="mt-1 text-[13px] leading-5 text-[#596B80]">
            Make changes to your match below.
          </Text>
        </View>

        <FriendlyForm
          key={friendly.id}
          mode="edit"
          friendlyId={friendly.id}
          teamId={friendly.teamId}
          teamName={friendly.teamName}
          clubName={friendly.clubName}
          clubBadgeUrl={friendly.badgeUrl}
          initialValues={{
            matchDate: friendly.matchDate,
            kickOffTime: friendly.kickOff?.slice(0, 5) ?? "",
            venueType: friendly.venueType,
            matchFormat: resolveMatchFormat(friendly.matchFormat),
            location: friendly.location ?? "",
            notes: friendly.notes ?? "",
          }}
          onSaved={(savedId) => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(`/friendlies/${savedId}` as never);
  }
}}
        />
      </ScreenScroll>
    </Screen>
  );
}
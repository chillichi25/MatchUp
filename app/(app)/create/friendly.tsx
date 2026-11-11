import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { FriendlyForm } from "@/features/friendlies/components/friendly-form";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function CreateFriendlyScreen() {
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const team = activeTeam.data;

  return (
    <Screen>
      <PageHeader title="Create a match" fallbackHref="/create" />

      {activeTeam.isLoading ? (
        <LoadingState />
      ) : team ? (
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
                Find an opponent
              </Text>

              <Text className="mt-2 max-w-[320px] text-center text-[15px] leading-[22px] text-[#596B80]">
                Post a friendly so other coaches can request to play.
              </Text>
            </View>

            <FriendlyForm
              teamId={team.id}
              teamName={team.name}
              clubName={team.clubs?.name ?? ""}
              clubBadgeUrl={team.clubs?.badge_url ?? null}
              teamMatchFormat={team.match_format}
              onSaved={(id) => router.replace(`/friendlies/${id}` as never)}
            />
          </ScreenScroll>
        </KeyboardAvoidingView>
      ) : (
        <View className="px-6 pt-6">
          <EmptyState
            title="You need an active team"
            description="Select or create a team before posting a friendly."
          />
        </View>
      )}
    </Screen>
  );
}
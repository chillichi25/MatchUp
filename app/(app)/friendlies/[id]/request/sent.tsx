import { useLocalSearchParams, useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { useOutgoingRequests } from "@/features/friendlies/hooks/use-friendly-requests";
import { useFriendlyDetail } from "@/features/friendlies/hooks/use-friendlies";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

const GREEN = "#009E45";

export default function RequestSentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useFriendlyDetail(id);
  const outgoing = useOutgoingRequests();
  const activeTeam = useActiveTeam();

  const friendly = detail.data;

  const request = outgoing.data?.find(
    (item) =>
      item.friendlyId === id &&
      item.requester.teamId === activeTeam.data?.id
  );

  const teamName = friendly?.teamName?.trim();
  const clubName = friendly?.clubName?.trim();

  const recipient =
    teamName && clubName
      ? `${teamName} at ${clubName}`
      : teamName || clubName || "the other team";

  const findingRequest =
    outgoing.isLoading || activeTeam.isLoading;

  function handleViewRequest() {
    if (request) {
      router.replace(
        `/friendlies/requests/${request.id}` as never
      );
      return;
    }

    // The request screen also handles an already-sent request.
    router.replace(`/friendlies/${id}/request` as never);
  }

  return (
    <Screen>
      <ScreenScroll
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 64,
        }}
      >
        <View className="items-center">
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#E4F5EB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check
              size={38}
              color={GREEN}
              strokeWidth={2.4}
            />
          </View>

          <Text
            accessibilityRole="header"
            className="mt-6 text-center text-[28px] font-bold tracking-tight text-[#07192D]"
          >
            Request sent
          </Text>

          <Text className="mt-3 max-w-[300px] text-center text-[14px] leading-[22px] text-[#596B80]">
            Your request has been sent to{" "}
            <Text className="font-semibold text-[#07192D]">
              {recipient}
            </Text>
            .
          </Text>

          <Text className="mt-2 max-w-[300px] text-center text-[14px] leading-[22px] text-[#596B80]">
            You&apos;re waiting for the other coach to respond.
          </Text>
        </View>

        <View className="mt-8 gap-3">
          <Button
            className="min-h-[50px] rounded-full bg-[#009E45]"
            textClassName="text-[15px] font-semibold text-white"
            loading={findingRequest}
            onPress={handleViewRequest}
          >
            View request
          </Button>

          <Button
            variant="outline"
            className="min-h-[50px] rounded-full border-slate-200 bg-white"
            textClassName="text-[15px] font-semibold text-[#07192D]"
            onPress={() => router.replace("/matches" as never)}
          >
            Back to matches
          </Button>
        </View>
      </ScreenScroll>
    </Screen>
  );
}
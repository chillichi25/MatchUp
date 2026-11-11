import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/state-views";
import { FriendlyRequestCard } from "@/features/friendlies/components/friendly-request-card";
import {
  useOutgoingRequestHistory,
  useOutgoingRequests,
} from "@/features/friendlies/hooks/use-friendly-requests";

export default function SentRequestsScreen() {
  const router = useRouter();

  const requests = useOutgoingRequests();
  const history = useOutgoingRequestHistory();

  const pending = requests.data ?? [];
  const past = history.data ?? [];

  return (
    <Screen>
      <PageHeader title="Sent requests" fallbackHref="/matches" />

      <ScreenScroll
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 128,
        }}
      >
        <View className="items-center">
          <Text
            accessibilityRole="header"
            className="text-center text-[26px] font-bold tracking-tight text-[#07192D]"
          >
            Requests you&apos;ve sent
          </Text>

          <Text className="mt-2 text-center text-[14px] leading-5 text-[#596B80]">
            Track responses from other teams.
          </Text>
        </View>

        <View className="mt-6">
          <Text
            accessibilityRole="header"
            className="text-[14px] font-bold text-[#07192D]"
          >
            Awaiting response
            {!requests.isLoading && !requests.isError
              ? ` · ${pending.length}`
              : ""}
          </Text>

          <View className="mt-3">
            {requests.isLoading ? (
              <LoadingState />
            ) : requests.isError ? (
              <ErrorState
                description="We couldn't load your pending requests."
                onRetry={() => requests.refetch()}
              />
            ) : pending.length === 0 ? (
              <View>
                <EmptyState
                  title="No requests awaiting response"
                  description="Requests you've sent will appear here while the other coach reviews them."
                />

                <View className="mt-4">
                  <Button
                    className="min-h-[50px] rounded-full bg-[#009E45]"
                    onPress={() => router.push("/matches" as never)}
                  >
                    Find a match
                  </Button>
                </View>
              </View>
            ) : (
              <View className="gap-3">
                {pending.map((request) => (
                  <FriendlyRequestCard
                    key={request.id}
                    request={request}
                    role="outgoing"
                    onPress={() =>
                      router.push(
                        `/friendlies/requests/${request.id}` as never
                      )
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {history.isLoading || history.isError || past.length > 0 ? (
          <View className="mt-7">
            <Text
              accessibilityRole="header"
              className="text-[14px] font-bold text-[#07192D]"
            >
              History
            </Text>

            <View className="mt-3">
              {history.isLoading ? (
                <LoadingState />
              ) : history.isError ? (
                <ErrorState
                  description="We couldn't load your request history."
                  onRetry={() => history.refetch()}
                />
              ) : (
                <View className="gap-3">
                  {past.map((request) => (
                    <FriendlyRequestCard
                      key={request.id}
                      request={request}
                      role="outgoing"
                      onPress={() =>
                        router.push(
                          `/friendlies/requests/${request.id}` as never
                        )
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}
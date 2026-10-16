import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { FriendlyRequestCard } from "@/features/friendlies/components/friendly-request-card";
import {
  useOutgoingRequestHistory,
  useOutgoingRequests,
} from "@/features/friendlies/hooks/use-friendly-requests";

export default function SentRequestsScreen() {
  const router = useRouter();

  const requests = useOutgoingRequests();
  const history = useOutgoingRequestHistory();

  const isLoading = requests.isLoading || history.isLoading;
  const pending = requests.data ?? [];
  const past = history.data ?? [];

  return (
    <Screen>
      <PageHeader title="Awaiting response" fallbackHref="/dashboard" />

      {isLoading ? (
        <LoadingState />
      ) : (
        <ScreenScroll contentContainerClassName="px-6 pb-32">
          <View className="mt-8">
            <Text className="text-2xl font-bold tracking-tight text-slate-950">
              Awaiting response
            </Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">
              Track friendly requests you&apos;ve sent to other teams.
            </Text>
          </View>

          <View className="mt-8">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-slate-500">
                Sent requests
              </Text>
              <Text className="text-sm text-slate-400">{pending.length}</Text>
            </View>

            {pending.length === 0 ? (
              <View className="mt-3">
                <EmptyState
                  title="No requests waiting"
                  description="Friendly requests waiting for a response will appear here."
                />

                <View className="mt-4">
                  <Button onPress={() => router.push("/matches" as never)}>
                    Find matches
                  </Button>
                </View>
              </View>
            ) : (
              <View className="mt-3 gap-4">
                {pending.map((request) => (
                  <FriendlyRequestCard
                    key={request.id}
                    request={request}
                    role="outgoing"
                    onPress={() =>
                      router.push(`/friendlies/requests/${request.id}` as never)
                    }
                  />
                ))}
              </View>
            )}
          </View>

          {past.length > 0 ? (
            <View className="mt-10">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-slate-500">
                  History
                </Text>
                <Text className="text-sm text-slate-400">{past.length}</Text>
              </View>

              <View className="mt-3 gap-4">
                {past.map((request) => (
                  <FriendlyRequestCard
                    key={request.id}
                    request={request}
                    role="outgoing"
                    onPress={() =>
                      router.push(`/friendlies/requests/${request.id}` as never)
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}
        </ScreenScroll>
      )}
    </Screen>
  );
}

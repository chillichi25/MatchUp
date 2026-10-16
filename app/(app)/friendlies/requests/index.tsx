import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/state-views";
import { FriendlyRequestCard } from "@/features/friendlies/components/friendly-request-card";
import { useIncomingRequests } from "@/features/friendlies/hooks/use-friendly-requests";

export default function IncomingRequestsScreen() {
  const router = useRouter();
  const requests = useIncomingRequests();

  const pending = (requests.data ?? []).filter(
    (request) => request.status === "pending"
  );

  const history = (requests.data ?? []).filter(
    (request) => request.status !== "pending"
  );

  return (
    <Screen>
      <PageHeader title="Friendly Requests" fallbackHref="/matches" />

      {requests.isLoading ? (
        <LoadingState />
      ) : (
        <ScreenScroll contentContainerClassName="px-5 pb-32">
          <View className="mt-8">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending
            </Text>

            {pending.length === 0 ? (
              <View className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
                <Text className="text-center font-bold text-slate-900">
                  No pending requests
                </Text>
                <Text className="mt-2 text-center text-sm text-slate-500">
                  You&apos;re all caught up.
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {pending.map((request) => (
                  <FriendlyRequestCard
                    key={request.id}
                    request={request}
                    role="incoming"
                    onPress={() =>
                      router.push(`/friendlies/requests/${request.id}` as never)
                    }
                  />
                ))}
              </View>
            )}
          </View>

          {history.length > 0 ? (
            <View className="mt-9">
              <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                History
              </Text>

              <View className="gap-3">
                {history.map((request) => (
                  <FriendlyRequestCard
                    key={request.id}
                    request={request}
                    role="incoming"
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

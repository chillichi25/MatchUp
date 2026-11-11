import { useRouter } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
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
      <PageHeader title="Match requests" fallbackHref="/matches" />

      {requests.isLoading ? (
        <LoadingState />
      ) : (
        <ScreenScroll contentClassName="px-6 pb-8 pt-6">
          <View className="items-center">
            <Text
              accessibilityRole="header"
              className="text-center text-[28px] tracking-tight text-[#07192D]"
              style={{ fontWeight: "800" }}
            >
              Requests to play
            </Text>

            <Text className="mt-2 max-w-[320px] text-center text-[15px] leading-[22px] text-[#596B80]">
              Review teams interested in your friendlies.
            </Text>
          </View>

          {requests.isError ? (
            <View className="mt-6 rounded-2xl border border-[#CBD5E1] bg-white p-5">
              <Text className="text-center text-[15px] font-bold text-[#07192D]">
                Couldn’t load requests
              </Text>

              <Text className="mt-2 text-center text-[14px] leading-5 text-[#596B80]">
                Please try again to see your latest match requests.
              </Text>

              <Button
                className="mt-4 min-h-[50px] rounded-full"
                style={{ backgroundColor: "#009E45" }}
                loading={requests.isFetching}
                disabled={requests.isFetching}
                onPress={() => {
                  void requests.refetch();
                }}
              >
                Try again
              </Button>
            </View>
          ) : (
            <>
              <View className="mt-6">
                <Text
                  accessibilityRole="header"
                  className="mb-3 text-[15px] font-bold text-[#07192D]"
                >
                  Awaiting your response · {pending.length}
                </Text>

                {pending.length === 0 ? (
                  <View className="items-center rounded-2xl border border-[#CBD5E1] bg-white px-5 py-7">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-green-50">
                      <CheckCircle2
                        size={24}
                        color="#009E45"
                        strokeWidth={1.8}
                      />
                    </View>

                    <Text className="mt-3 text-center text-[15px] font-bold text-[#07192D]">
                      You’re all caught up
                    </Text>

                    <Text className="mt-2 text-center text-[14px] leading-5 text-[#596B80]">
                      New requests to play your friendlies will appear here.
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
                          router.push(
                            `/friendlies/requests/${request.id}` as never
                          )
                        }
                      />
                    ))}
                  </View>
                )}
              </View>

              {history.length > 0 ? (
                <View className="mt-7">
                  <Text
                    accessibilityRole="header"
                    className="mb-3 text-[15px] font-bold text-[#07192D]"
                  >
                    History
                  </Text>

                  <View className="gap-3">
                    {history.map((request) => (
                      <FriendlyRequestCard
                        key={request.id}
                        request={request}
                        role="incoming"
                        onPress={() =>
                          router.push(
                            `/friendlies/requests/${request.id}` as never
                          )
                        }
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          )}
        </ScreenScroll>
      )}
    </Screen>
  );
}
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CalendarDays,
  Clock,
  MapPin,
  MessageCircle,
} from "lucide-react-native";
import { View, Text } from "react-native";
import { toast } from "sonner-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/state-views";
import { RequestStatusBadge } from "@/features/friendlies/components/request-status-badge";
import {
  useAcceptFriendlyRequest,
  useDeclineFriendlyRequest,
  useFriendlyRequestDetail,
  useWithdrawFriendlyRequest,
} from "@/features/friendlies/hooks/use-friendly-requests";
import {
  formatDateWithYear,
  formatKickOff,
} from "@/features/friendlies/utils/format";

export default function FriendlyRequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useFriendlyRequestDetail(id);

  const accept = useAcceptFriendlyRequest();
  const decline = useDeclineFriendlyRequest();
  const withdraw = useWithdrawFriendlyRequest();

  const request = detail.data;

  async function handleAccept() {
    if (!request) return;

    try {
      const result = await accept.mutateAsync(request.id);
      toast.success("Match confirmed");

      if (result.matchId) {
        router.replace(`/matches/${result.matchId}` as never);
      } else {
        router.replace("/matches" as never);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The request could not be accepted."
      );
    }
  }

  async function handleDecline() {
    if (!request) return;

    try {
      await decline.mutateAsync(request.id);
      toast.success("Request declined");
      router.back();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The request could not be declined."
      );
    }
  }

  async function handleWithdraw() {
    if (!request) return;

    try {
      await withdraw.mutateAsync(request.id);
      toast.success("Request cancelled");
      router.replace("/friendlies/sent" as never);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The request could not be cancelled."
      );
    }
  }

  if (detail.isLoading) {
    return (
      <Screen>
        <PageHeader title="Friendly Request" fallbackHref="/friendlies/requests" />
        <LoadingState />
      </Screen>
    );
  }

  if (!request) {
    return (
      <Screen>
        <PageHeader title="Friendly Request" fallbackHref="/matches" />
        <View className="px-5 pt-8">
          <View className="rounded-2xl border border-slate-200 bg-white p-6">
            <Text className="text-center text-lg font-bold text-slate-900">
              Request not found
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-500">
              This friendly request may no longer be available.
            </Text>
          </View>
        </View>
      </Screen>
    );
  }

  const isHost = request.viewer === "host";
  const isRequester = request.viewer === "requester";

  const displayed =
    request.viewer === "requester" ? request.host : request.requester;

  const isPending = request.status === "pending";
  const isAccepted = request.status === "accepted";
  const isDeclined = request.status === "declined";
  const isExpired = request.status === "expired";

  return (
    <Screen>
      <PageHeader
        title={isPending && isHost ? "Review Request" : "Friendly Request"}
        fallbackHref={isRequester ? "/friendlies/sent" : "/friendlies/requests"}
      />

      <ScreenScroll contentContainerClassName="px-5 pb-28">
        <View className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <Avatar
                uri={displayed.badgeUrl}
                name={displayed.clubName}
                size={56}
              />

              <View className="min-w-0 flex-1">
                <Text
                  numberOfLines={2}
                  className="text-lg font-bold leading-tight text-slate-950"
                >
                  {displayed.clubName || "Club"}
                </Text>
                <Text className="mt-1 text-sm text-slate-500">
                  {displayed.teamName || "Team"}
                </Text>
              </View>
            </View>

            <RequestStatusBadge status={request.status} />
          </View>

          {isPending && isRequester ? (
            <>
              <View className="mt-5 border-t border-slate-100 pt-5">
                <View className="rounded-2xl bg-amber-50 px-5 py-4">
                  <View className="items-center">
                    <Clock size={19} color="#D97706" strokeWidth={2} />
                    <Text className="mt-3 text-sm font-semibold text-slate-900">
                      Waiting for response
                    </Text>
                    <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                      The other team will review your friendly request.
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4">
                <Button
                  variant="outline"
                  textClassName="text-red-600"
                  className="border-red-200"
                  loading={withdraw.isPending}
                  onPress={handleWithdraw}
                >
                  {withdraw.isPending ? "Cancelling..." : "Cancel Request"}
                </Button>
              </View>
            </>
          ) : null}

          <View className="ml-1 mt-4 gap-1.5">
            <DetailRow
              icon={<CalendarDays size={16} color="#64748B" />}
              value={formatDateWithYear(request.matchDate)}
            />
            {request.kickOff ? (
              <DetailRow
                icon={<Clock size={16} color="#64748B" />}
                value={formatKickOff(request.kickOff)}
              />
            ) : null}
            {request.location ? (
              <DetailRow
                icon={<MapPin size={16} color="#64748B" />}
                value={request.location}
              />
            ) : null}
          </View>

          {request.message ? (
            <View className="mb-1 mt-4 rounded-xl bg-[#F5F6F8] px-5 py-4">
              <Text className="text-sm text-slate-700">{request.message}</Text>
            </View>
          ) : null}

          {isPending && isHost ? (
            <View className="mt-5 flex-row gap-3">
              <View className="flex-1">
                <Button
                  variant="outline"
                  textClassName="text-red-600"
                  className="border-red-200"
                  loading={decline.isPending}
                  onPress={handleDecline}
                >
                  {decline.isPending ? "Declining..." : "Decline"}
                </Button>
              </View>

              <View className="flex-1">
                <Button loading={accept.isPending} onPress={handleAccept}>
                  {accept.isPending ? "Accepting..." : "Accept"}
                </Button>
              </View>
            </View>
          ) : null}

          {isAccepted ? (
            <View className="mt-4 gap-2 border-t border-slate-100 pt-4">
              <Button
                onPress={() =>
                  router.push(
                    (request.matchId
                      ? `/matches/${request.matchId}`
                      : "/matches") as never
                  )
                }
              >
                View Match
              </Button>

              <Button
                variant="outline"
                textClassName="text-brand"
                className="border-brand"
                onPress={() => router.push("/chat" as never)}
              >
                Open Chat
              </Button>
            </View>
          ) : null}

          {isDeclined ? (
            <View className="mt-5 gap-3 border-t border-slate-200 pt-5">
              {isRequester && request.friendlyStatus === "open" ? (
                <Button
                  onPress={() =>
                    router.replace(`/friendlies/${request.friendlyId}/request` as never)
                  }
                >
                  Request Again
                </Button>
              ) : null}

              <Button variant="outline" onPress={() => router.replace("/matches" as never)}>
                Find Another Match
              </Button>
            </View>
          ) : null}

          {isExpired ? (
            <View className="mt-5 border-t border-slate-200 pt-5">
              <View className="rounded-2xl bg-slate-50 px-5 py-4">
                <View className="items-center">
                  <Clock size={20} color="#94A3B8" />
                  <Text className="mt-3 text-sm font-semibold text-slate-900">
                    Request expired
                  </Text>
                  <Text className="mt-1 text-center text-sm leading-5 text-slate-500">
                    This friendly&apos;s match time has passed.
                  </Text>
                </View>
              </View>

              <View className="mt-4">
                <Button onPress={() => router.replace("/matches" as never)}>
                  Find Another Match
                </Button>
              </View>
            </View>
          ) : null}
        </View>

        {request.status === "cancelled" ? (
          <View className="mt-5 items-center">
            <MessageCircle size={20} color="#94A3B8" />
            <Text className="mt-2 text-sm text-slate-500">
              This request was withdrawn.
            </Text>
          </View>
        ) : null}
      </ScreenScroll>
    </Screen>
  );
}

function DetailRow({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-1">
      {icon}
      <Text className="text-sm text-slate-700">{value}</Text>
    </View>
  );
}

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react-native";
import { useRef, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Screen, ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
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

const GREEN = "#009E45";

export default function FriendlyRequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useFriendlyRequestDetail(id);
  const accept = useAcceptFriendlyRequest();
  const decline = useDeclineFriendlyRequest();
  const withdraw = useWithdrawFriendlyRequest();

  const actionInProgress = useRef(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [declineConfirmOpen, setDeclineConfirmOpen] = useState(false);
  const [declineError, setDeclineError] = useState<string | null>(null);

  const request = detail.data;

  const busy =
    accept.isPending || decline.isPending || withdraw.isPending;

  async function handleAccept() {
    if (
      !request ||
      request.status !== "pending" ||
      request.viewer !== "host" ||
      actionInProgress.current
    ) {
      return;
    }

    actionInProgress.current = true;

    try {
      const result = await accept.mutateAsync(request.id);

      if (result.matchId) {
        toast.success("Match confirmed");
        router.replace(`/matches/${result.matchId}` as never);
      } else {
        toast.success("Request accepted");
        router.replace("/matches" as never);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The request could not be accepted."
      );
    } finally {
      actionInProgress.current = false;
    }
  }

  async function handleDecline() {
    if (
      !request ||
      request.status !== "pending" ||
      request.viewer !== "host" ||
      actionInProgress.current
    ) {
      return;
    }

    actionInProgress.current = true;
    setDeclineError(null);

    try {
      await decline.mutateAsync(request.id);

      setDeclineConfirmOpen(false);
      toast.success("Request declined");
      router.replace("/friendlies/requests" as never);
    } catch (error) {
      setDeclineError(
        error instanceof Error
          ? error.message
          : "The request could not be declined."
      );
    } finally {
      actionInProgress.current = false;
    }
  }

  async function handleWithdraw() {
    if (
      !request ||
      request.status !== "pending" ||
      request.viewer !== "requester" ||
      actionInProgress.current
    ) {
      return;
    }

    actionInProgress.current = true;
    setCancelError(null);

    try {
      await withdraw.mutateAsync(request.id);

      setConfirmOpen(false);
      toast.success("Request cancelled");
      router.replace("/friendlies/sent" as never);
    } catch (error) {
      setCancelError(
        error instanceof Error
          ? error.message
          : "The request could not be cancelled."
      );
    } finally {
      actionInProgress.current = false;
    }
  }

  if (detail.isLoading) {
    return (
      <Screen>
        <PageHeader
          title="Request status"
          fallbackHref="/friendlies/sent"
        />
        <LoadingState />
      </Screen>
    );
  }

  if (!request) {
    return (
      <Screen>
        <PageHeader
          title="Request status"
          fallbackHref="/matches"
        />

        <View className="px-6 pt-6">
          <EmptyState
            title="Request not found"
            description="This match request may no longer be available."
          />
        </View>
      </Screen>
    );
  }

  const isHost = request.viewer === "host";
  const isRequester = request.viewer === "requester";
  const isPending = request.status === "pending";
  const isAccepted = request.status === "accepted";
  const isDeclined = request.status === "declined";
  const isExpired = request.status === "expired";
  const isCancelled = request.status === "cancelled";

  const displayed = isRequester ? request.host : request.requester;
  const message = request.message?.trim();

  const statusTitle = isPending
    ? isHost
      ? "Review this request"
      : "Awaiting response"
    : isAccepted
      ? "Request accepted"
      : isDeclined
        ? "Request declined"
        : isExpired
          ? "Request expired"
          : "Request cancelled";

  const statusDescription = isPending
    ? isHost
      ? "This team would like to play your friendly."
      : "The other coach will review your request."
    : isAccepted
      ? "This request has been accepted."
      : isDeclined
        ? isHost
          ? "You declined this team's request."
          : "Your request was declined. The friendly may no longer be available."
        : isExpired
          ? "The match date has passed, so this request is no longer active."
          : "This request has been cancelled.";

  return (
    <Screen>
      <PageHeader
        title={isPending && isHost ? "Review request" : "Request status"}
        fallbackHref={
          isRequester ? "/friendlies/sent" : "/friendlies/requests"
        }
      />

      <ScreenScroll contentClassName="px-6 pb-8 pt-6">
        <View className="overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white">
          <View className="p-4">
            <View className="flex-row items-center gap-3">
              <Avatar
                uri={displayed.badgeUrl}
                name={displayed.clubName || displayed.teamName}
                size={48}
              />

              <View className="min-w-0 flex-1">
                <Text
                  accessibilityRole="header"
                  className="text-[20px] font-bold tracking-tight text-[#07192D]"
                >
                  {displayed.teamName || "Team"}
                </Text>

                {displayed.clubName ? (
                  <Text className="mt-0.5 text-[13px] text-[#596B80]">
                    {displayed.clubName}
                  </Text>
                ) : null}
              </View>
            </View>

            <View className="mt-3 self-start">
              <RequestStatusBadge status={request.status} />
            </View>
          </View>

          <View className="gap-3 border-t border-slate-100 p-4">
            <DetailRow
              icon={
                <CalendarDays
                  size={18}
                  color={GREEN}
                  strokeWidth={1.9}
                />
              }
              label="Match date"
              value={formatDateWithYear(request.matchDate)}
            />

            {request.kickOff ? (
              <DetailRow
                icon={
                  <Clock
                    size={18}
                    color={GREEN}
                    strokeWidth={1.9}
                  />
                }
                label="Kick-off time"
                value={formatKickOff(request.kickOff)}
              />
            ) : null}

            {request.location?.trim() ? (
              <DetailRow
                icon={
                  <MapPin
                    size={18}
                    color={GREEN}
                    strokeWidth={1.9}
                  />
                }
                label="Town or city"
                value={request.location}
              />
            ) : null}
          </View>
        </View>

        <View
          className={`mt-4 rounded-2xl p-4 ${
            isPending
              ? "bg-amber-50"
              : isAccepted
                ? "bg-green-50"
                : "bg-slate-100"
          }`}
        >
          <View className="flex-row items-center gap-2">
            {isAccepted ? (
              <CheckCircle2 size={20} color={GREEN} />
            ) : (
              <Clock
                size={20}
                color={isPending ? "#D97706" : "#64748B"}
              />
            )}

            <Text className="min-w-0 flex-1 text-[15px] font-bold text-[#07192D]">
              {statusTitle}
            </Text>
          </View>

          <Text className="mt-2 text-[14px] leading-5 text-[#596B80]">
            {statusDescription}
          </Text>
        </View>

        {message ? (
          <View className="mt-4 rounded-2xl border border-[#CBD5E1] bg-white p-4">
            <Text
              accessibilityRole="header"
              className="text-[14px] font-bold text-[#07192D]"
            >
              {isRequester ? "Your message" : "Message from the coach"}
            </Text>

            <Text className="mt-2 text-[14px] leading-5 text-[#596B80]">
              {message}
            </Text>
          </View>
        ) : null}

        <View className="mt-5 gap-3">
          {isPending && isRequester ? (
            <Button
              variant="outline"
              className="min-h-[50px] w-full rounded-full border-red-200"
              disabled={busy}
              onPress={() => {
                if (busy || actionInProgress.current) return;

                setCancelError(null);
                setConfirmOpen(true);
              }}
            >
              <Text
                style={{
                  color: "#B91C1C",
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Cancel request
              </Text>
            </Button>
          ) : null}

          {isPending && isHost ? (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button
                  variant="outline"
                  className="min-h-[50px] rounded-full border-red-200"
                  loading={decline.isPending}
                  disabled={busy}
                  onPress={() => {
                    if (busy || actionInProgress.current) return;

                    setDeclineError(null);
                    setDeclineConfirmOpen(true);
                  }}
                >
                  <Text
                    style={{
                      color: "#B91C1C",
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {decline.isPending ? "Declining…" : "Decline"}
                  </Text>
                </Button>
              </View>

              <View className="flex-1">
                <Button
                  className="min-h-[50px] rounded-full"
                  style={{ backgroundColor: GREEN }}
                  loading={accept.isPending}
                  disabled={busy}
                  onPress={handleAccept}
                >
                  {accept.isPending ? "Accepting…" : "Accept"}
                </Button>
              </View>
            </View>
          ) : null}

          {isAccepted ? (
            <>
              <Button
                className="min-h-[50px] w-full rounded-full"
                style={{ backgroundColor: GREEN }}
                onPress={() =>
                  router.push(
                    (request.matchId
                      ? `/matches/${request.matchId}`
                      : "/matches") as never
                  )
                }
              >
                View match
              </Button>

              <Button
                variant="outline"
                className="min-h-[50px] w-full rounded-full border-[#009E45]"
                onPress={() =>
                  router.push(
                    (request.conversationId
                      ? `/chat/${request.conversationId}`
                      : "/chat") as never
                  )
                }
              >
                <Text
                  style={{
                    color: GREEN,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  Open chat
                </Text>
              </Button>
            </>
          ) : null}

          {isDeclined ? (
            <>
              {isRequester && request.friendlyStatus === "open" ? (
                <Button
                  className="min-h-[50px] w-full rounded-full"
                  style={{ backgroundColor: GREEN }}
                  onPress={() =>
                    router.replace(
                      `/friendlies/${request.friendlyId}/request` as never
                    )
                  }
                >
                  Request again
                </Button>
              ) : null}

              <Button
                variant="outline"
                className="min-h-[50px] w-full rounded-full"
                onPress={() => router.replace("/matches" as never)}
              >
                Find another match
              </Button>
            </>
          ) : null}

          {isExpired || isCancelled ? (
            <Button
              className="min-h-[50px] w-full rounded-full"
              style={{ backgroundColor: GREEN }}
              onPress={() => router.replace("/matches" as never)}
            >
              Find another match
            </Button>
          ) : null}
        </View>
      </ScreenScroll>

      <ConfirmDialog
        visible={declineConfirmOpen}
        title="Decline this request?"
        description={`Decline the request from ${
          request.requester.teamName ||
          request.requester.clubName ||
          "this team"
        } to play your friendly?`}
        confirmLabel="Decline request"
        cancelLabel="Keep pending"
        loadingLabel="Declining…"
        loading={decline.isPending}
        error={declineError}
        onConfirm={handleDecline}
        onCancel={() => {
          if (!actionInProgress.current) {
            setDeclineConfirmOpen(false);
          }
        }}
      />

      <ConfirmDialog
        visible={confirmOpen}
        title="Cancel request?"
        description={`Withdraw your request to play ${
          request.host.teamName || request.host.clubName
        }?`}
        confirmLabel="Cancel request"
        cancelLabel="Keep request"
        loading={withdraw.isPending}
        error={cancelError}
        onConfirm={handleWithdraw}
        onCancel={() => {
          if (!actionInProgress.current) {
            setConfirmOpen(false);
          }
        }}
      />
    </Screen>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-50">
        {icon}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[12px] text-[#596B80]">
          {label}
        </Text>

        <Text className="mt-0.5 text-[14px] font-semibold text-[#07192D]">
          {value}
        </Text>
      </View>
    </View>
  );
}
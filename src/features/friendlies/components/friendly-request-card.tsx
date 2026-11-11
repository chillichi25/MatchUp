import { CalendarDays, ChevronRight, MapPin, Shield } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type { FriendlyRequestSummary } from "../types";
import { formatKickOff, formatLongDate } from "../utils/format";

type FriendlyRequestCardProps = {
  request: FriendlyRequestSummary;
  role: "incoming" | "outgoing";
  onPress: () => void;
};

const GREEN = "#009E45";

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  accepted: {
    label: "Accepted",
    backgroundColor: "#DCFCE7",
    color: "#166534",
  },
  declined: {
    label: "Declined",
    backgroundColor: "#FEE2E2",
    color: "#991B1B",
  },
  cancelled: {
    label: "Cancelled",
    backgroundColor: "#F1F5F9",
    color: "#475569",
  },
  expired: {
    label: "Expired",
    backgroundColor: "#F1F5F9",
    color: "#475569",
  },
};

export function FriendlyRequestCard({
  request,
  role,
  onPress,
}: FriendlyRequestCardProps) {
  const counterparty =
    role === "incoming" ? request.requester : request.host;

  const kickOff = request.kickOff
    ? formatKickOff(request.kickOff)
    : "";

  const dateLabel = [
    formatLongDate(request.matchDate),
    kickOff,
  ]
    .filter(Boolean)
    .join(" · ");

  const message = request.message?.trim();
  const status = STATUS_STYLES[request.status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        counterparty.teamName || "Team",
        counterparty.clubName,
        status.label,
        dateLabel,
        request.location,
      ]
        .filter(Boolean)
        .join(", ")}
      accessibilityHint="Opens the request details"
      onPress={onPress}
      className="relative rounded-2xl border border-[#CBD5E1] bg-white p-4 active:opacity-80"
    >
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          {counterparty.badgeUrl ? (
            <Avatar
              uri={counterparty.badgeUrl}
              name={counterparty.clubName || counterparty.teamName}
              size={48}
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <Shield
                size={23}
                color={GREEN}
                strokeWidth={1.8}
              />
            </View>
          )}

          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-bold leading-5 text-[#07192D]">
              {counterparty.teamName || "Team"}
            </Text>

            {counterparty.clubName ? (
              <Text className="mt-0.5 text-[13px] leading-[18px] text-[#596B80]">
                {counterparty.clubName}
              </Text>
            ) : null}
          </View>
        </View>

        <View
          className="shrink-0 rounded-full px-2.5 py-1"
          style={{ backgroundColor: status.backgroundColor }}
        >
          <Text
            style={{
              color: status.color,
              fontSize: 11,
              fontWeight: "600",
            }}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-2 pr-6">
        <View className="flex-row items-start gap-2">
          <CalendarDays
            size={17}
            color={GREEN}
            strokeWidth={1.8}
          />

          <Text className="min-w-0 flex-1 text-[13px] font-medium leading-[18px] text-[#07192D]">
            {dateLabel}
          </Text>
        </View>

        {request.location?.trim() ? (
          <View className="flex-row items-start gap-2">
            <MapPin
              size={17}
              color={GREEN}
              strokeWidth={1.8}
            />

            <Text className="min-w-0 flex-1 text-[13px] leading-[18px] text-[#596B80]">
              {request.location}
            </Text>
          </View>
        ) : null}
      </View>

      {message && role === "incoming" ? (
        <View className="mr-6 mt-4 rounded-xl bg-slate-50 px-3 py-3">
          <Text className="text-[12px] font-semibold text-[#07192D]">
            Message
          </Text>

          <Text className="mt-1 text-[13px] leading-5 text-[#596B80]">
            {message}
          </Text>
        </View>
      ) : null}

      <View
  pointerEvents="none"
  accessibilityElementsHidden
  importantForAccessibility="no-hide-descendants"
  style={{
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  }}
>
  <ChevronRight
    size={18}
    color="#64748B"
    strokeWidth={1.8}
  />
</View>
    </Pressable>
  );
}
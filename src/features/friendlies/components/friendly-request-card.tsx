import { CalendarDays, ChevronRight, MapPin, Shield } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type { FriendlyRequestSummary } from "../types";
import { formatKickOff, formatLongDate } from "../utils/format";
import { RequestStatusBadge } from "./request-status-badge";

type FriendlyRequestCardProps = {
  request: FriendlyRequestSummary;
  role: "incoming" | "outgoing";
  onPress: () => void;
};

export function FriendlyRequestCard({
  request,
  role,
  onPress,
}: FriendlyRequestCardProps) {
  const counterparty = role === "incoming" ? request.requester : request.host;
  const kickOff = formatKickOff(request.kickOff);
  const isHistory = request.status !== "pending";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${counterparty.clubName}, ${counterparty.teamName}`}
      onPress={onPress}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          {counterparty.badgeUrl ? (
            <Avatar
              uri={counterparty.badgeUrl}
              name={counterparty.clubName}
              size={48}
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
              <View className="h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                <Shield size={17} color="#64748B" strokeWidth={1.8} />
              </View>
            </View>
          )}

          <View className="min-w-0 flex-1">
            <Text
              numberOfLines={1}
              className={
                isHistory
                  ? "font-semibold leading-tight text-slate-900"
                  : "font-bold leading-tight text-slate-900"
              }
            >
              {counterparty.clubName || "Club"}
            </Text>

            <Text className="mt-1 text-sm text-slate-500">
              {counterparty.teamName || "Team"}
            </Text>
          </View>
        </View>

        <View className="shrink-0 flex-row items-center gap-2">
          <RequestStatusBadge status={request.status} />
          <ChevronRight size={17} color="#CBD5E1" />
        </View>
      </View>

      <View className="mt-4 gap-1.5">
        <View className="flex-row items-center gap-2">
          <CalendarDays size={15} color="#64748B" />
          <Text className="text-sm text-slate-600">
            {formatLongDate(request.matchDate)}
            {kickOff ? ` · ${kickOff}` : ""}
          </Text>
        </View>

        {request.location ? (
          <View className="flex-row items-center gap-2">
            <MapPin size={15} color="#64748B" />
            <Text className="text-sm text-slate-600">{request.location}</Text>
          </View>
        ) : null}
      </View>

      {request.message && role === "incoming" ? (
        <View className="mt-4 rounded-xl bg-[#F5F6F8] px-4 py-2.5">
          <Text className="text-sm leading-5 text-slate-600">
            {request.message}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

import { CalendarDays, MapPin } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { formatLongDate } from "@/features/dashboard/utils/format-date";

import type { TournamentRequestSummary } from "../types";
import { TournamentRequestStatusBadge } from "./tournament-request-status-badge";

type TournamentRequestCardProps = {
  request: TournamentRequestSummary;
  /** Whether to foreground the team (incoming) or tournament (outgoing). */
  focus?: "team" | "tournament";
  onPress?: () => void;
  children?: ReactNode;
};

export function TournamentRequestCard({
  request,
  focus = "team",
  onPress,
  children,
}: TournamentRequestCardProps) {
  const primary =
    focus === "team" ? request.team.clubName : request.tournamentName;
  const secondary =
    focus === "team" ? request.team.teamName : request.tournamentLocation ?? "";

  const body = (
    <>
      <View className="flex-row items-start gap-2.5">
        <Avatar uri={request.team.badgeUrl} name={request.team.clubName} size={40} />

        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 text-[13px] font-bold leading-tight text-slate-950"
            >
              {primary}
            </Text>
            <TournamentRequestStatusBadge status={request.status} />
          </View>

          {secondary ? (
            <Text numberOfLines={1} className="mt-0.5 text-[10px] text-slate-500">
              {secondary}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="ml-[50px] mt-2 gap-1">
        <View className="flex-row items-center gap-1.5">
          <CalendarDays size={12} color="#64748B" />
          <Text className="text-[10px] text-slate-500">
            {formatLongDate(request.tournamentStartDate)}
          </Text>
        </View>

        {focus === "team" && request.tournamentLocation ? (
          <View className="flex-row items-center gap-1.5">
            <MapPin size={12} color="#64748B" />
            <Text numberOfLines={1} className="text-[10px] text-slate-500">
              {request.tournamentLocation}
            </Text>
          </View>
        ) : null}
      </View>

      {request.message ? (
        <View className="ml-[50px] mt-2 rounded-xl bg-slate-50 px-3 py-2">
          <Text className="text-[11px] leading-4 text-slate-600">
            {request.message}
          </Text>
        </View>
      ) : null}
    </>
  );

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress}>
          {body}
        </Pressable>
      ) : (
        body
      )}

      {children ? <View className="mt-3">{children}</View> : null}
    </View>
  );
}

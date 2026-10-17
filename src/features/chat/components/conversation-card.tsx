import { CalendarDays, ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type { ConversationSummary } from "../types";
import { formatMatchSchedule, formatMessageTime } from "../utils/format";

export function ConversationCard({
  conversation,
  onPress,
  showDivider = false,
}: {
  conversation: ConversationSummary;
  onPress: () => void;
  showDivider?: boolean;
}) {
  const hasUnread = conversation.unreadCount > 0;
  const schedule = formatMatchSchedule(
    conversation.matchDate,
    conversation.kickOffTime
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${conversation.opponent.clubName} conversation`}
      onPress={onPress}
      className={
        showDivider
          ? "border-b border-slate-100 px-4 py-4 active:bg-slate-50"
          : "px-4 py-4 active:bg-slate-50"
      }
    >
      <View className="flex-row items-start gap-3">
        <Avatar
          uri={conversation.opponent.badgeUrl}
          name={conversation.opponent.clubName}
          size={48}
        />

        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Text
                numberOfLines={1}
                className={
                  hasUnread
                    ? "text-[14px] font-bold leading-tight text-slate-950"
                    : "text-[14px] font-semibold leading-tight text-slate-950"
                }
              >
                {conversation.opponent.clubName}
              </Text>
              <Text
                numberOfLines={1}
                className="mt-1 text-[11px] text-slate-500"
              >
                {conversation.opponent.teamName}
              </Text>
            </View>

            {conversation.latestMessageAt ? (
              <Text
                className={
                  hasUnread
                    ? "shrink-0 text-[11px] font-semibold text-[#00A638]"
                    : "shrink-0 text-[11px] text-slate-400"
                }
              >
                {formatMessageTime(conversation.latestMessageAt)}
              </Text>
            ) : null}
          </View>

          <View className="mt-2 flex-row items-center gap-2">
            <Text
              numberOfLines={1}
              className={
                hasUnread
                  ? "min-w-0 flex-1 text-[13px] font-semibold text-slate-900"
                  : conversation.latestMessageText
                    ? "min-w-0 flex-1 text-[13px] text-slate-600"
                    : "min-w-0 flex-1 text-[13px] text-slate-400"
              }
            >
              {conversation.latestMessageText ?? "No messages yet"}
            </Text>

            {hasUnread ? (
              <View className="h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand px-1.5">
                <Text className="text-[10px] font-bold text-white">
                  {conversation.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>

          {schedule ? (
            <View className="mt-2 flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
                <CalendarDays size={13} color="#94A3B8" strokeWidth={1.8} />
                <Text numberOfLines={1} className="text-[11px] text-slate-400">
                  {schedule}
                </Text>
              </View>

              <ChevronRight size={16} color="#CBD5E1" strokeWidth={2} />
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

import { CalendarDays, ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";

import type { ConversationSummary } from "../types";
import { formatMatchSchedule, formatMessageTime } from "../utils/format";

const GREEN = "#009E45";

type ConversationCardProps = {
  conversation: ConversationSummary;
  onPress: () => void;
  showDivider?: boolean;
};

export function ConversationCard({
  conversation,
  onPress,
  showDivider = false,
}: ConversationCardProps) {
  const hasUnread = conversation.unreadCount > 0;

  const teamName = conversation.opponent.teamName?.trim();
  const clubName = conversation.opponent.clubName?.trim();
  const title = teamName || clubName || "Opponent";

  const preview =
    conversation.latestMessageText?.trim() || "No messages yet";

  const schedule = formatMatchSchedule(
    conversation.matchDate,
    conversation.kickOffTime
  );

  const unreadLabel =
    conversation.unreadCount === 1
      ? "1 unread message"
      : `${conversation.unreadCount} unread messages`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[
        title,
        teamName && clubName ? clubName : null,
        hasUnread ? unreadLabel : null,
        preview,
        schedule,
      ]
        .filter(Boolean)
        .join(". ")}
      accessibilityHint="Opens the match conversation"
      onPress={onPress}
      className="relative px-4 py-4 active:bg-slate-50"
      style={{
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: "#EDF2F5",
      }}
    >
      <View className="flex-row items-start gap-3">
        <Avatar
          uri={conversation.opponent.badgeUrl}
          name={clubName || title}
          size={46}
        />

        <View
  className="min-w-0 flex-1"
  style={{ paddingRight: 36 }}
>
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Text
                numberOfLines={1}
                className="text-[15px] font-bold leading-5 text-[#07192D]"
              >
                {title}
              </Text>

              {teamName && clubName ? (
                <Text
                  numberOfLines={1}
                  className="mt-0.5 text-[12px] leading-[18px] text-[#596B80]"
                >
                  {clubName}
                </Text>
              ) : null}
            </View>

            {conversation.latestMessageAt ? (
              <Text
                className="mt-0.5 shrink-0 text-[11px] leading-4"
                style={{
                  color: hasUnread ? GREEN : "#64748B",
                  fontWeight: hasUnread ? "600" : "400",
                }}
              >
                {formatMessageTime(conversation.latestMessageAt)}
              </Text>
            ) : null}
          </View>

          <View className="mt-2 flex-row items-center gap-2">
            <Text
              numberOfLines={1}
              className="min-w-0 flex-1 text-[13px] leading-5"
              style={{
                color: hasUnread ? "#07192D" : "#596B80",
                fontWeight: hasUnread ? "600" : "400",
              }}
            >
              {preview}
            </Text>

            {hasUnread ? (
              <View
                style={{
                  minWidth: 20,
                  height: 20,
                  paddingHorizontal: 6,
                  borderRadius: 10,
                  backgroundColor: GREEN,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Text className="text-[10px] font-bold text-white">
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>

          {schedule ? (
            <View className="mt-2 flex-row items-center gap-1.5">
              <CalendarDays
                size={13}
                color={GREEN}
                strokeWidth={1.8}
              />

              <Text
                numberOfLines={1}
                className="min-w-0 flex-1 text-[11px] leading-4 text-[#596B80]"
              >
                {schedule}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: "absolute",
          right: 12,
          top: 0,
          bottom: 0,
          justifyContent: "center",
        }}
      >
        <ChevronRight
          size={17}
          color="#64748B"
          strokeWidth={1.8}
        />
      </View>
    </Pressable>
  );
}
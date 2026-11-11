import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  MessageCircle,
} from "lucide-react-native";
import { useEffect, useRef, type ElementRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/ui/page-header";
import { Screen } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import { ChatMessageForm } from "@/features/chat/components/chat-message-form";
import { MessageBubble } from "@/features/chat/components/message-bubble";
import {
  useConversation,
  useMarkConversationAsRead,
} from "@/features/chat/hooks/use-chat";
import { useConversationMessages } from "@/features/chat/hooks/use-conversation-messages";
import { formatMatchSchedule } from "@/features/chat/utils/format";

const GREEN = "#009E45";

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const conversation = useConversation(id);
  const markRead = useMarkConversationAsRead(id);
  const detail = conversation.data;

  const scrollRef = useRef<ElementRef<typeof ScrollView> | null>(null);

  useEffect(() => {
    if (detail) {
      markRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.id]);

  const messages = useConversationMessages({
    conversationId: id,
    currentUserId: detail?.currentUserId ?? "",
    initialMessages: detail?.messages ?? [],
  });

  const isCancelled = detail?.status === "cancelled";

  function scrollToLatestMessage() {
    scrollRef.current?.scrollToEnd({ animated: false });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <Screen>
        <PageHeader title="Match chat" fallbackHref="/chat" />

        {conversation.isLoading ? (
          <LoadingState />
        ) : !detail ? (
          <View className="px-6 pt-6">
            <EmptyState
              title="Conversation not found"
              description="This chat may have been removed or you may not have access."
            />
          </View>
        ) : (
          <View style={{ flex: 1, minHeight: 0 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View match against ${
                detail.opponent.teamName || detail.opponent.clubName
              }`}
              onPress={() =>
                router.push(`/matches/${detail.matchId}` as never)
              }
              className="relative mt-3 border-b border-[#E2E8F0] bg-white px-5 py-4 pr-12 active:opacity-80"
            >
              <View className="flex-row items-center gap-3">
                <Avatar
                  uri={detail.opponent.badgeUrl}
                  name={
                    detail.opponent.clubName ||
                    detail.opponent.teamName ||
                    "Opponent"
                  }
                  size={44}
                />

                <View className="min-w-0 flex-1">
                  <Text className="text-[16px] font-bold text-[#07192D]">
                    {detail.opponent.teamName || "Opponent"}
                  </Text>

                  {detail.opponent.clubName ? (
                    <Text className="mt-0.5 text-[13px] text-[#596B80]">
                      {detail.opponent.clubName}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="mt-3 gap-2">
                <View className="flex-row items-start gap-2">
                  <CalendarDays
                    size={16}
                    color={GREEN}
                    strokeWidth={1.8}
                  />

                  <Text className="min-w-0 flex-1 text-[12px] font-medium leading-[18px] text-[#07192D]">
                    {formatMatchSchedule(
                      detail.matchDate,
                      detail.kickOffTime
                    ) || "Date to be confirmed"}
                  </Text>
                </View>

                {detail.location?.trim() ? (
                  <View className="flex-row items-start gap-2">
                    <MapPin
                      size={16}
                      color={GREEN}
                      strokeWidth={1.8}
                    />

                    <Text className="min-w-0 flex-1 text-[12px] leading-[18px] text-[#596B80]">
                      {detail.location}
                    </Text>
                  </View>
                ) : null}
              </View>

              {isCancelled ? (
                <View className="mt-3 self-start rounded-full bg-red-50 px-3 py-1">
                  <Text className="text-[11px] font-semibold text-red-700">
                    Match cancelled
                  </Text>
                </View>
              ) : null}

              <View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  position: "absolute",
                  right: 20,
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

            <ScrollView
              ref={scrollRef}
              style={{
                flex: 1,
                minHeight: 0,
                backgroundColor: "#F4F9FA",
              }}
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 16,
                paddingVertical: 16,
                gap: 12,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToLatestMessage}
              onLayout={scrollToLatestMessage}
            >
              {messages.length === 0 ? (
                <View className="flex-1 items-center justify-center px-5 py-8">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-[#E4F5EB]">
                    <MessageCircle
                      size={26}
                      color={GREEN}
                      strokeWidth={1.7}
                    />
                  </View>

                  <Text className="mt-4 text-center text-[16px] font-bold text-[#07192D]">
                    No messages yet
                  </Text>

                  <Text className="mt-2 max-w-[260px] text-center text-[14px] leading-5 text-[#596B80]">
                    {isCancelled
                      ? "No messages were exchanged for this match."
                      : "Send a message to arrange the match details."}
                  </Text>
                </View>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMine={message.senderId === detail.currentUserId}
                  />
                ))
              )}
            </ScrollView>

            <View style={{ flexShrink: 0 }}>
              {isCancelled ? (
                <View className="border-t border-[#E2E8F0] bg-white px-5 py-4">
                  <Text className="text-center text-[13px] font-semibold text-[#07192D]">
                    This match has been cancelled.
                  </Text>

                  <Text className="mt-1 text-center text-[12px] leading-[18px] text-[#596B80]">
                    You can still view previous messages.
                  </Text>
                </View>
              ) : (
                <ChatMessageForm conversationId={detail.id} />
              )}
            </View>
          </View>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
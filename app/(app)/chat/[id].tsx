import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarDays, MapPin } from "lucide-react-native";
import { useEffect, useRef, type ElementRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

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

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const conversation = useConversation(id);
  const markRead = useMarkConversationAsRead(id);

  const detail = conversation.data;

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

  const scrollRef = useRef<ElementRef<typeof ScrollView> | null>(null);

  const isCancelled = detail?.status === "cancelled";

  return (
    <Screen>
      <PageHeader
        title={detail?.opponent.clubName ?? "Chat"}
        fallbackHref="/chat"
      />

      {conversation.isLoading ? (
        <LoadingState />
      ) : !detail ? (
        <View className="px-5 pt-8">
          <EmptyState
            title="Conversation not found"
            description="This chat may have been removed or you may not have access."
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          {/* Match context */}
          <View className="border-b border-slate-200 bg-white px-5 py-3">
            <View className="flex-row items-center justify-between gap-3">
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/matches/${detail.matchId}` as never)}
                className="min-w-0 flex-1 flex-row items-center gap-2"
              >
                <CalendarDays size={15} color="#64748B" />
                <Text numberOfLines={1} className="text-[12px] text-slate-600">
                  {formatMatchSchedule(detail.matchDate, detail.kickOffTime) ||
                    "Date TBC"}
                </Text>
              </Pressable>

              {detail.location ? (
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={14} color="#64748B" />
                  <Text
                    numberOfLines={1}
                    className="max-w-[140px] text-[12px] text-slate-500"
                  >
                    {detail.location}
                  </Text>
                </View>
              ) : null}
            </View>

            {isCancelled ? (
              <View className="mt-2 self-start rounded-full bg-red-100 px-2.5 py-1">
                <Text className="text-[11px] font-semibold text-red-600">
                  Match cancelled
                </Text>
              </View>
            ) : null}
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            className="flex-1 bg-slate-50"
            contentContainerClassName="px-4 py-4 gap-3"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: false })
            }
          >
            {messages.length === 0 ? (
              <View className="items-center justify-center py-16">
                <Text className="text-[14px] font-medium text-slate-500">
                  No messages yet
                </Text>
                <Text className="mt-1 text-[13px] text-slate-400">
                  Send the first message about the match.
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

          {/* Composer */}
          {isCancelled ? (
            <View className="border-t border-slate-200 bg-white px-5 py-4">
              <Text className="text-center text-[13px] font-semibold text-slate-700">
                This match has been cancelled.
              </Text>
              <Text className="mt-1 text-center text-[12px] text-slate-400">
                You can still view previous messages.
              </Text>
            </View>
          ) : (
            <ChatMessageForm conversationId={detail.id} />
          )}
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

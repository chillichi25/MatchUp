import { useRouter } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Screen, ScreenScroll } from "@/components/ui/screen";
import { ErrorState, LoadingState } from "@/components/ui/state-views";

import { ConversationCard } from "@/features/chat/components/conversation-card";
import { useMyConversations } from "@/features/chat/hooks/use-chat";

export default function ChatScreen() {
  const router = useRouter();
  const conversations = useMyConversations();

  const items = conversations.data ?? [];

  return (
    <Screen edges={["top"]}>
      <ScreenScroll contentClassName="px-4 pb-28 pt-6">
        <Text className="text-[28px] font-bold tracking-tight text-slate-950">
          Chat
        </Text>
        <Text className="mt-0.5 text-[13px] text-slate-500">
          Your match conversations.
        </Text>

        <View className="mt-6">
          {conversations.isLoading ? (
            <LoadingState label="Loading conversations…" />
          ) : conversations.isError ? (
            <ErrorState
              description="We couldn't load your conversations right now."
              onRetry={() => conversations.refetch()}
            />
          ) : items.length === 0 ? (
            <View className="rounded-2xl border border-slate-200 bg-white px-5 py-7 shadow-sm">
              <View className="mx-auto h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <MessageCircle size={24} color="#00B83F" strokeWidth={1.9} />
              </View>

              <Text className="mt-3 text-center text-[15px] font-bold text-slate-950">
                No conversations yet
              </Text>

              <Text className="mx-auto mt-1.5 max-w-[250px] text-center text-[12px] leading-[18px] text-slate-500">
                Your chats will appear here once a match has been arranged.
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/matches" as never)}
                className="mx-auto mt-5 h-10 min-w-[150px] items-center justify-center rounded-xl bg-brand px-5 shadow-sm"
              >
                <Text className="text-[12px] font-bold text-white">
                  Find a Match
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {items.map((conversation, index) => (
                <ConversationCard
                  key={conversation.conversationId}
                  conversation={conversation}
                  showDivider={index !== items.length - 1}
                  onPress={() =>
                    router.push(`/chat/${conversation.conversationId}` as never)
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScreenScroll>
    </Screen>
  );
}

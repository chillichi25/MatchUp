import { useRouter } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Screen, ScreenScroll } from "@/components/ui/screen";
import { ErrorState, LoadingState } from "@/components/ui/state-views";
import { ConversationCard } from "@/features/chat/components/conversation-card";
import { useMyConversations } from "@/features/chat/hooks/use-chat";

const GREEN = "#009E45";

export default function ChatScreen() {
  const router = useRouter();
  const conversations = useMyConversations();

  const items = conversations.data ?? [];

  return (
    <Screen edges={["top"]}>
      <ScreenScroll
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 112,
        }}
      >
        <Text className="text-[28px] font-bold tracking-tight text-[#07192D]">
          Chat
        </Text>

        <Text className="mt-1 text-[13px] leading-5 text-[#596B80]">
          Your match conversations.
        </Text>

        <View className="mt-5">
          {conversations.isLoading ? (
            <LoadingState label="Loading conversations…" />
          ) : conversations.isError ? (
            <ErrorState
              description="We couldn't load your conversations right now."
              onRetry={() => conversations.refetch()}
            />
          ) : items.length === 0 ? (
            <View className="items-center rounded-2xl border border-slate-200 bg-white px-5 py-8">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-[#E4F5EB]">
                <MessageCircle
                  size={26}
                  color={GREEN}
                  strokeWidth={1.7}
                />
              </View>

              <Text className="mt-4 text-center text-[16px] font-bold text-[#07192D]">
                No conversations yet
              </Text>

              <Text className="mt-2 max-w-[260px] text-center text-[13px] leading-5 text-[#596B80]">
                Once a match is confirmed, you can chat with the other coach here.
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/matches" as never)}
                className="mt-5 min-h-[48px] min-w-[160px] items-center justify-center rounded-full px-6 active:opacity-80"
                style={{ backgroundColor: GREEN }}
              >
                <Text className="text-[14px] font-semibold text-white">
                  Find a match
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {items.map((conversation, index) => (
                <ConversationCard
                  key={conversation.conversationId}
                  conversation={conversation}
                  showDivider={index !== items.length - 1}
                  onPress={() =>
                    router.push(
                      `/chat/${conversation.conversationId}` as never
                    )
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
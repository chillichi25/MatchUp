import { Send } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useSendMessage } from "../hooks/use-chat";

const GREEN = "#009E45";
const MIN_INPUT_HEIGHT = 48;
const MAX_INPUT_HEIGHT = 128;

export function ChatMessageForm({
  conversationId,
}: {
  conversationId: string;
}) {
  const send = useSendMessage(conversationId);

  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState("");
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);

  const sendingRef = useRef(false);

  async function handleSend() {
    const trimmed = message.trim();

    if (!trimmed || sendingRef.current) {
      return;
    }

    sendingRef.current = true;
    setSendError("");

    try {
      const result = await send.mutateAsync(trimmed);

      if (!result.success) {
        if (result.reason === "access_denied") {
          setSendError("You no longer have access to this chat.");
        } else if (result.reason === "not_authenticated") {
          setSendError("Your session has ended. Please sign in again.");
        } else {
          setSendError("Couldn't send. Please try again.");
        }

        return;
      }

      setMessage("");
      setInputHeight(MIN_INPUT_HEIGHT);
    } catch {
      setSendError("Couldn't send. Check your connection and try again.");
    } finally {
      sendingRef.current = false;
    }
  }

  const canSend = message.trim().length > 0 && !send.isPending;

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}
    >
      {sendError ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{
            marginBottom: 8,
            paddingHorizontal: 4,
            color: "#B91C1C",
            fontSize: 12,
            lineHeight: 18,
          }}
        >
          {sendError}
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        <TextInput
          accessibilityLabel="Message"
          value={message}
          onChangeText={(text) => {
            setMessage(text);

            if (sendError) {
              setSendError("");
            }
          }}
          onContentSizeChange={(event) => {
            const nextHeight = Math.ceil(
              event.nativeEvent.contentSize.height
            );

            setInputHeight(
              Math.min(
                MAX_INPUT_HEIGHT,
                Math.max(MIN_INPUT_HEIGHT, nextHeight)
              )
            );
          }}
          editable={!send.isPending}
          maxLength={2000}
          placeholder="Type a message…"
          placeholderTextColor="#7B8798"
          multiline
          textAlignVertical="top"
          scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
          style={{
            flex: 1,
            minWidth: 0,
            height: inputHeight,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "#CBD5E1",
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: "#07192D",
            fontSize: 15,
            lineHeight: 22,
          }}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{
            disabled: !canSend,
            busy: send.isPending,
          }}
          disabled={!canSend}
          onPress={() => {
            void handleSend();
          }}
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 24,
            backgroundColor:
              canSend || send.isPending ? GREEN : "#E2E8F0",
          }}
        >
          {send.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Send
              size={20}
              color={canSend ? "#FFFFFF" : "#94A3B8"}
              strokeWidth={1.9}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}
import { Send } from "lucide-react-native";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useSendMessage } from "../hooks/use-chat";

export function ChatMessageForm({
  conversationId,
}: {
  conversationId: string;
}) {
  const send = useSendMessage(conversationId);

  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState("");

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
    } catch {
      setSendError("Couldn't send. Check your connection and try again.");
    } finally {
      sendingRef.current = false;
    }
  }

  const canSend = message.trim().length > 0 && !send.isPending;

  return (
    <View className="border-t border-slate-200 bg-white px-4 py-3">
      {sendError ? (
        <Text className="mb-2 px-2 text-[12px] text-red-500">{sendError}</Text>
      ) : null}

      <View className="flex-row items-end gap-2">
        <TextInput
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            if (sendError) setSendError("");
          }}
          maxLength={2000}
          placeholder="Type a message..."
          placeholderTextColor="#94A3B8"
          multiline
          className="max-h-32 min-h-12 min-w-0 flex-1 rounded-3xl border border-slate-300 bg-white px-5 py-3 text-[14px] leading-6 text-slate-900"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !canSend }}
          disabled={!canSend}
          onPress={handleSend}
          className={
            canSend
              ? "h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand"
              : "h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200"
          }
        >
          <Send size={19} color={canSend ? "#FFFFFF" : "#94A3B8"} />
        </Pressable>
      </View>
    </View>
  );
}

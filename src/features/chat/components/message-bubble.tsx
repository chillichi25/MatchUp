import { Text, View } from "react-native";

import type { ChatMessage } from "../types";
import { formatMessageTime } from "../utils/format";

export function MessageBubble({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  return (
    <View className={isMine ? "items-end" : "items-start"}>
      <View className="max-w-[78%]">
        <View
          className={
            isMine
              ? "rounded-2xl rounded-br-md bg-brand px-4 py-2.5"
              : "rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2.5"
          }
        >
          <Text
            className={
              isMine
                ? "text-[14px] leading-5 text-white"
                : "text-[14px] leading-5 text-slate-800"
            }
          >
            {message.message}
          </Text>
        </View>

        <Text
          className={
            isMine
              ? "mt-1 text-right text-[11px] text-slate-400"
              : "mt-1 text-left text-[11px] text-slate-400"
          }
        >
          {formatMessageTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

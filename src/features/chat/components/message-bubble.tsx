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
    <View
      style={{
        alignItems: isMine ? "flex-end" : "flex-start",
      }}
    >
      <View
        style={{
          maxWidth: "82%",
          borderRadius: 16,
          borderBottomRightRadius: isMine ? 6 : 16,
          borderBottomLeftRadius: isMine ? 16 : 6,
          borderWidth: 1,
          borderColor: isMine ? "#CDEBD8" : "#E2E8F0",
          backgroundColor: isMine ? "#E4F5EB" : "#FFFFFF",
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 7,
        }}
      >
        <Text
          selectable
          style={{
            color: "#07192D",
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {message.message}
        </Text>

        <Text
          style={{
            alignSelf: "flex-end",
            marginTop: 4,
            color: "#596B80",
            fontSize: 11,
            lineHeight: 15,
          }}
        >
          {formatMessageTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}
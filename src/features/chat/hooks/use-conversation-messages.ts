import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase/client";

import { markConversationAsRead } from "../services/chat-message.service";
import type { ChatMessage } from "../types";

type RawMessage = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

/**
 * Merges the fetched conversation history with messages arriving over Realtime.
 * The screen remounts per conversation id, so the realtime buffer does not need
 * to be cleared when navigating between chats.
 */
export function useConversationMessages({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}): ChatMessage[] {
  const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const raw = payload.new as RawMessage;

          const incoming: ChatMessage = {
            id: raw.id,
            senderId: raw.sender_id,
            message: raw.message,
            createdAt: raw.created_at,
          };

          setRealtimeMessages((current) =>
            current.some((message) => message.id === incoming.id)
              ? current
              : [...current, incoming]
          );

          if (raw.sender_id !== currentUserId) {
            void markConversationAsRead(conversationId);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  return useMemo(() => {
    const byId = new Map<string, ChatMessage>();

    for (const message of initialMessages) {
      byId.set(message.id, message);
    }

    for (const message of realtimeMessages) {
      byId.set(message.id, message);
    }

    return [...byId.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );
  }, [initialMessages, realtimeMessages]);
}

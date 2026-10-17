import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

import {
  getConversation,
  getMyConversations,
  getUnreadChatCount,
} from "../services/chat.service";
import { markConversationAsRead, sendMessage } from "../services/chat-message.service";

export const CHAT_QUERY_KEYS = {
  conversations: ["chat", "conversations"] as const,
  unread: ["chat", "unread"] as const,
  conversation: (id: string) => ["chat", "conversation", id] as const,
};

export function useMyConversations() {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.conversations,
    queryFn: getMyConversations,
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.conversation(conversationId),
    queryFn: () => getConversation(conversationId),
    enabled: Boolean(conversationId),
  });
}

/**
 * Unread badge count, refreshed whenever a message is inserted or read so the
 * tab badge stays current without polling.
 */
export function useUnreadChatCount() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("chat-unread-badge")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "match_messages" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: CHAT_QUERY_KEYS.unread,
          });
          void queryClient.invalidateQueries({
            queryKey: CHAT_QUERY_KEYS.conversations,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "match_messages" },
        () => {
          void queryClient.invalidateQueries({
            queryKey: CHAT_QUERY_KEYS.unread,
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: CHAT_QUERY_KEYS.unread,
    queryFn: getUnreadChatCount,
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => sendMessage(conversationId, message),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.conversation(conversationId),
      });
      await queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.conversations,
      });
    },
  });
}

export function useMarkConversationAsRead(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markConversationAsRead(conversationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.unread });
      await queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.conversations,
      });
    },
  });
}

import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";

import {
  getConversation,
  getMyConversations,
  getUnreadChatCount,
} from "../services/chat.service";

import {
  markConversationAsRead,
  sendMessage,
} from "../services/chat-message.service";

export const CHAT_QUERY_KEYS = {
  conversations: ["chat", "conversations"] as const,
  unread: ["chat", "unread"] as const,
  conversation: (id: string) =>
    ["chat", "conversation", id] as const,
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
 * Keeps the unread badge current.
 * Each effect creates its own channel and removes it on cleanup.
 */
export function useUnreadChatCount() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let disposed = false;

    const channelName = [
      "chat-unread-badge",
      Date.now().toString(36),
      Math.random().toString(36).slice(2),
    ].join("-");

    function refreshUnread() {
      if (disposed) return;

      void queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.unread,
      });
    }

    function refreshConversations() {
      if (disposed) return;

      void queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.conversations,
      });
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "match_messages",
        },
        () => {
          refreshUnread();
          refreshConversations();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "match_messages",
        },
        () => {
          refreshUnread();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Refresh after connecting or reconnecting.
          refreshUnread();
          refreshConversations();
        }
      });

    return () => {
      disposed = true;

      void supabase.removeChannel(channel).catch((error) => {
        console.error(
          "CHAT UNREAD CHANNEL CLEANUP ERROR:",
          error
        );
      });
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
    mutationFn: (message: string) =>
      sendMessage(conversationId, message),

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

export function useMarkConversationAsRead(
  conversationId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      markConversationAsRead(conversationId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.unread,
      });

      await queryClient.invalidateQueries({
        queryKey: CHAT_QUERY_KEYS.conversations,
      });
    },
  });
}
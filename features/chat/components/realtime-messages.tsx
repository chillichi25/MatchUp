"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { markConversationAsRead } from "@/features/chat/services/chat-message.service";

type Message = {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type Props = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
};

export function RealtimeMessages({
  conversationId,
  currentUserId,
  initialMessages,
}: Props) {
  const supabase = createClient();

  const [messages, setMessages] =
    useState<Message[]>(initialMessages);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  // Scroll to the latest message when the chat opens
  // and whenever a new message appears.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [messages]);

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
  const newMessage = payload.new as Message;

  setMessages((current) => {
    const alreadyExists = current.some(
      (message) =>
        message.id === newMessage.id
    );

    if (alreadyExists) {
      return current;
    }

    return [...current, newMessage];
  });

  // If the other coach sends a message while this
  // conversation is already open, mark it as read.
  if (newMessage.sender_id !== currentUserId) {
    void markConversationAsRead(
      conversationId
    );
  }
}
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
  conversationId,
  currentUserId,
  supabase,
]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-500">
            No messages yet
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Send the first message about the match.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => {
        const isMine =
          message.sender_id === currentUserId;

        const time = new Intl.DateTimeFormat(
          "en-GB",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Europe/London",
          }
        ).format(new Date(message.created_at));

        return (
          <div
            key={message.id}
            className={`flex ${
              isMine
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div className="max-w-[78%]">
              <div
  className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-2xl px-4 py-2.5 text-sm leading-5 ${
    isMine
      ? "rounded-br-md bg-[#00B83F] text-white"
      : "rounded-bl-md border border-gray-200 bg-white text-slate-800"
  }`}
>
  {message.message}
</div>

              <p
                className={`mt-1 text-[11px] text-slate-400 ${
                  isMine
                    ? "text-right"
                    : "text-left"
                }`}
              >
                {time}
              </p>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
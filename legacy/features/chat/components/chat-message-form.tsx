"use client";

import {
  useRef,
  useState,
} from "react";

import { Send } from "lucide-react";

import { sendMessage } from "@/features/chat/services/chat-message.service";

type ChatMessageFormProps = {
  conversationId: string;
};

export function ChatMessageForm({
  conversationId,
}: ChatMessageFormProps) {
  const [message, setMessage] =
    useState("");

  const [isSending, setIsSending] =
    useState(false);

  const [sendError, setSendError] =
    useState("");

  const sendingRef = useRef(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      sendingRef.current
    ) {
      return;
    }

    sendingRef.current = true;
    setIsSending(true);
    setSendError("");

    try {
      const result = await sendMessage(
        conversationId,
        trimmedMessage,
      );

      if (!result.success) {
        if (
          result.reason ===
          "access_denied"
        ) {
          setSendError(
            "You no longer have access to this chat.",
          );
        } else if (
          result.reason ===
          "not_authenticated"
        ) {
          setSendError(
            "Your session has ended. Please sign in again.",
          );
        } else {
          setSendError(
            "Couldn't send. Please try again.",
          );
        }

        return;
      }

      setMessage("");
    } catch {
      // A network or connection failure may prevent
      // the Server Action from returning a result.
      // Keep the message so the user can retry.
      setSendError(
        "Couldn't send. Check your connection and try again.",
      );
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white px-4 py-3"
    >
      {sendError && (
        <p
          role="alert"
          className="mb-2 px-2 text-xs text-red-500"
        >
          {sendError}
        </p>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(
              e.target.value,
            );

            if (sendError) {
              setSendError("");
            }
          }}
          maxLength={2000}
          rows={1}
          placeholder="Type a message..."
          className="max-h-32 min-h-12 min-w-0 flex-1 resize-none rounded-3xl border border-gray-300 bg-white px-5 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00B83F]"
        />

        <button
          type="submit"
          disabled={
            !message.trim() ||
            isSending
          }
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00B83F] text-white transition disabled:bg-slate-200 disabled:text-slate-400"
          aria-label="Send message"
        >
          <Send size={19} />
        </button>
      </div>
    </form>
  );
}
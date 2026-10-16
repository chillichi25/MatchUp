"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(
  conversationId: string,
  message: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false as const,
      reason: "not_authenticated" as const,
    };
  }

  const { error } = await supabase.rpc(
    "send_match_message",
    {
      p_conversation_id: conversationId,
      p_message: message,
    },
  );

  if (error) {
    const errorMessage =
      error.message.toLowerCase();

    if (
      errorMessage.includes("access") ||
      errorMessage.includes("conversation")
    ) {
      return {
        success: false as const,
        reason: "access_denied" as const,
      };
    }

    return {
      success: false as const,
      reason: "send_failed" as const,
    };
  }

  revalidatePath(`/chat/${conversationId}`);

  return {
    success: true as const,
  };
}

export async function markConversationAsRead(
  conversationId: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase.rpc(
    "mark_conversation_as_read",
    {
      p_conversation_id: conversationId,
    },
  );

  if (error) {
    throw error;
  }
}
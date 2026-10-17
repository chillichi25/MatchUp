import { supabase } from "@/lib/supabase/client";

export type SendMessageResult =
  | { success: true }
  | {
      success: false;
      reason: "not_authenticated" | "access_denied" | "send_failed";
    };

export async function sendMessage(
  conversationId: string,
  message: string
): Promise<SendMessageResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, reason: "not_authenticated" };
  }

  const { error } = await supabase.rpc("send_match_message", {
    p_conversation_id: conversationId,
    p_message: message,
  });

  if (error) {
    const errorMessage = error.message.toLowerCase();

    if (
      errorMessage.includes("access") ||
      errorMessage.includes("conversation")
    ) {
      return { success: false, reason: "access_denied" };
    }

    console.error("SEND MESSAGE ERROR:", error);
    return { success: false, reason: "send_failed" };
  }

  return { success: true };
}

export async function markConversationAsRead(
  conversationId: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase.rpc("mark_conversation_as_read", {
    p_conversation_id: conversationId,
  });

  if (error) {
    console.error("MARK CONVERSATION READ ERROR:", error);
  }
}

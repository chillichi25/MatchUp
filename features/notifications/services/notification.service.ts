"use server";

import { createClient } from "@/lib/supabase/server";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type:
    | "friendly_request"
    | "friendly_accepted"
    | "friendly_declined"
    | "friendly_cancelled"
    | "friendly_updated"
    | "match_change_proposed"
    | "match_change_accepted"
    | "match_change_declined"
    | "match_cancelled"
    | "match_result_submitted"
| "match_result_confirmed"
| "match_result_disputed"
    | "new_message"
    | "match_reminder";
  relatedId?: string;
};

export async function createNotification({
  userId,
  title,
  message,
  type,
  relatedId,
}: CreateNotificationInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title,
      message,
      type,
      related_id: relatedId ?? null,
    });

  if (error) {
    throw error;
  }
}

export async function getNotifications() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  return data ?? [];
}
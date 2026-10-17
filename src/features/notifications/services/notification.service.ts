import { supabase } from "@/lib/supabase/client";

import type { AppNotification, NotificationType } from "../types";

/**
 * Best-effort in-app notification. Failures are logged but never thrown so a
 * notification problem cannot fail the business action that triggered it.
 */
export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    title: input.title,
    message: input.message,
    type: input.type,
    related_id: input.relatedId ?? null,
    is_read: false,
  });

  if (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
  }
}

export async function getNotifications(): Promise<AppNotification[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AppNotification[];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw error;
  }
}

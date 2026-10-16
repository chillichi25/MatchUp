"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Props = {
  initialUnreadCount: number;
};

export function RealtimeNotificationBell({
  initialUnreadCount,
}: Props) {
  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [unreadCount, setUnreadCount] =
    useState(initialUnreadCount);

  useEffect(() => {
    let cancelled = false;

    async function loadUnreadCount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      const { count, error } = await supabase
        .from("notifications")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        console.error(
          "Notification count error:",
          error
        );
        return;
      }

      if (!cancelled) {
        setUnreadCount(count ?? 0);
      }
    }

    loadUnreadCount();

    const channel = supabase
      .channel("dashboard-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <Link
      href="/notifications"
      className="relative"
      aria-label="Notifications"
    >
      <Bell
        size={28}
        className="text-slate-700"
      />

      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
          {unreadCount > 9
            ? "9+"
            : unreadCount}
        </span>
      )}
    </Link>
  );
}
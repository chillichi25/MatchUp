import Link from "next/link";
import {
  Bell,
  ChevronLeft,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { NotificationItem } from "@/features/notifications/components/notification-item";

/* =====================================================
   DATE GROUP
===================================================== */

function getDateGroup(dateString: string) {
  const notificationDate = new Date(dateString);

  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (
    date1: Date,
    date2: Date
  ) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  if (isSameDay(notificationDate, today)) {
    return "Today";
  }

  if (
    isSameDay(notificationDate, yesterday)
  ) {
    return "Yesterday";
  }

  return "Earlier";
}

/* =====================================================
   PAGE
===================================================== */

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  /* ===================================================
     LOAD NOTIFICATIONS
  =================================================== */

  const { data: notifications } =
    await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  /* ===================================================
     GROUP NOTIFICATIONS
  =================================================== */

  const todayNotifications =
    notifications?.filter(
      (notification) =>
        getDateGroup(
          notification.created_at
        ) === "Today"
    ) ?? [];

  const yesterdayNotifications =
    notifications?.filter(
      (notification) =>
        getDateGroup(
          notification.created_at
        ) === "Yesterday"
    ) ?? [];

  const earlierNotifications =
    notifications?.filter(
      (notification) =>
        getDateGroup(
          notification.created_at
        ) === "Earlier"
    ) ?? [];

  /* ===================================================
     RENDER NOTIFICATION ITEMS
  =================================================== */

  const renderNotifications = (
    items: typeof todayNotifications
  ) =>
    items.map((notification) => (
      <NotificationItem
        key={notification.id}
        id={notification.id}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        relatedId={
          notification.related_id
        }
        isRead={notification.is_read}
        createdAt={
          notification.created_at
        }
      />
    ));

  /* ===================================================
     UI
  =================================================== */

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-24 pt-6">
      {/* ===============================================
          HEADER
      =============================================== */}

      <header className="relative flex items-center justify-center">
        <Link
          href="/dashboard"
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-[0.97]"
          aria-label="Back to dashboard"
        >
          <ChevronLeft
            size={21}
            strokeWidth={2}
          />
        </Link>

        <h1 className="text-[20px] font-bold text-slate-950">
          Notifications
        </h1>
      </header>

      {/* ===============================================
          NOTIFICATIONS
      =============================================== */}

      {notifications?.length ? (
        <div className="mt-7 space-y-7">
          {/* TODAY */}

          {todayNotifications.length >
            0 && (
            <section>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Today
              </h2>

              <div className="space-y-1">
                {renderNotifications(
                  todayNotifications
                )}
              </div>
            </section>
          )}

          {/* YESTERDAY */}

          {yesterdayNotifications.length >
            0 && (
            <section>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Yesterday
              </h2>

              <div className="space-y-1">
                {renderNotifications(
                  yesterdayNotifications
                )}
              </div>
            </section>
          )}

          {/* EARLIER */}

          {earlierNotifications.length >
            0 && (
            <section>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Earlier
              </h2>

              <div className="space-y-1">
                {renderNotifications(
                  earlierNotifications
                )}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* =============================================
           EMPTY STATE
        ============================================= */

        <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center shadow-sm">
          {/* Icon */}

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <Bell
              size={24}
              strokeWidth={1.9}
              className="text-[#00B83F]"
            />
          </div>

          {/* Title */}

          <h2 className="mt-3 text-[15px] font-bold text-slate-950">
            No notifications yet
          </h2>

          {/* Description */}

          <p className="mx-auto mt-1.5 max-w-[260px] text-[12px] leading-[18px] text-slate-500">
            Match requests, tournament
            updates and messages will
            appear here.
          </p>

          {/* Action */}

          <Link
            href="/matches"
            className="mx-auto mt-5 flex h-10 w-fit min-w-[150px] items-center justify-center rounded-xl bg-[#00B83F] px-5 text-[12px] font-bold text-white shadow-sm transition active:scale-[0.98]"
          >
            Find a Match
          </Link>
        </div>
      )}
    </main>
  );
}
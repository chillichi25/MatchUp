"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type NotificationType =
  | "friendly_request"
  | "friendly_accepted"
  | "friendly_declined"
  | "friendly_cancelled"
  | "friendly_updated"
  | "match"
  | "match_change_proposed"
  | "match_change_accepted"
  | "match_change_declined"
  | "match_cancelled"
  | "match_result_submitted"
  | "match_result_confirmed"
  | "match_result_disputed"
  | "conversation"
  | "message"
  | "tournament"
  | "tournament_request"
  | "tournament_update";

type NotificationItemProps = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string | null;
  isRead: boolean;
  createdAt: string;
};

/* =====================================================
   NOTIFICATION ROUTE
===================================================== */

function getNotificationHref(
  type: NotificationType,
  relatedId?: string | null
) {
  switch (type) {
    /* =================================================
       FRIENDLIES
    ================================================= */

    case "friendly_request":
    case "friendly_declined":
    case "friendly_cancelled":
    case "friendly_updated":
      return relatedId
        ? `/friendlies/requests/${relatedId}`
        : "/friendlies/requests";

    case "friendly_accepted":
      return relatedId
        ? `/matches/${relatedId}`
        : "/matches";

    /* =================================================
       MATCHES
    ================================================= */

    case "match":
      return relatedId
        ? `/matches/${relatedId}`
        : "/matches";

    case "match_change_proposed":
    case "match_change_accepted":
    case "match_change_declined":
    case "match_cancelled":
    case "match_result_submitted":
    case "match_result_confirmed":
    case "match_result_disputed":
      return relatedId
        ? `/matches/${relatedId}`
        : "/matches/upcoming";

    /* =================================================
       CHAT
    ================================================= */

    case "conversation":
    case "message":
      return relatedId
        ? `/chat/${relatedId}`
        : "/chat";

    /* =================================================
       TOURNAMENTS
    ================================================= */

    case "tournament_request":
      return "/tournaments/requests";

    case "tournament_update":
      return relatedId
        ? `/tournaments/updates/${relatedId}`
        : "/tournaments";

    case "tournament":
      return relatedId
        ? `/tournaments/${relatedId}`
        : "/tournaments";

    default:
      return null;
  }
}

/* =====================================================
   COMPONENT
===================================================== */

export function NotificationItem({
  id,
  title,
  message,
  type,
  relatedId,
  isRead,
  createdAt,
}: NotificationItemProps) {
  const router = useRouter();
  const supabase = createClient();

  const [read, setRead] = useState(isRead);

  const href = getNotificationHref(
    type,
    relatedId
  );

  /* ===================================================
     HANDLE CLICK
  =================================================== */

  async function handleClick() {
    if (!read) {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq("id", id);

      if (error) {
        console.error(
          "Failed to mark notification as read:",
          error
        );
      } else {
        setRead(true);
      }
    }

    if (href) {
      router.push(href);
    } else {
      router.refresh();
    }
  }

  /* ===================================================
     UI
  =================================================== */

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-xl border border-gray-100 bg-white p-3 text-left shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        {/* CONTENT */}

        <div className="min-w-0 flex-1">
          {/* TITLE */}

          <div className="flex items-start gap-2">
            <h2 className="flex-1 text-sm font-semibold text-slate-950">
              {title}
            </h2>

            {!read && (
              <span
                className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#00B83F]"
                aria-label="Unread notification"
              />
            )}
          </div>

          {/* MESSAGE */}

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {message}
          </p>

          {/* DATE */}

          <p className="mt-1 text-xs text-slate-400">
            {new Date(
              createdAt
            ).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* ARROW */}

        {href && (
          <ChevronRight
            size={20}
            className="shrink-0 text-slate-400"
          />
        )}
      </div>
    </button>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  House,
  CircleDot,
  PlusCircle,
  MessageCircle,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const navigation = [
  {
    name: "Home",
    href: "/dashboard",
    icon: House,
  },
  {
    name: "Matches",
    href: "/matches",
    icon: CircleDot,
  },
  {
    name: "Create",
    href: "/create",
    icon: PlusCircle,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUnreadCount() {
  try {
    // --------------------------------------------------
    // AUTH
    // --------------------------------------------------

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        "Bottom nav auth error:",
        authError
      );
      return;
    }

    if (!user || cancelled) {
      return;
    }

    // --------------------------------------------------
    // ACTIVE TEAM
    // --------------------------------------------------

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("active_team_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Bottom nav active team error:",
        profileError
      );
      return;
    }

    if (!profile?.active_team_id) {
      if (!cancelled) {
        setUnreadCount(0);
      }
      return;
    }

    const activeTeamId =
      profile.active_team_id;

    // --------------------------------------------------
    // MATCH CONVERSATIONS FOR ACTIVE TEAM
    // --------------------------------------------------

    const {
      data: matches,
      error: matchesError,
    } = await supabase
      .from("matches")
      .select(`
        id,

        match_conversations (
          id
        )
      `)
      .or(
        `home_team_id.eq.${activeTeamId},away_team_id.eq.${activeTeamId}`
      );

    if (matchesError) {
      console.error(
        "Bottom nav matches error:",
        matchesError
      );
      return;
    }

    const conversationIds =
      (matches ?? [])
        .flatMap((match: any) => {
          const conversations =
            match.match_conversations;

          if (!conversations) {
            return [];
          }

          if (Array.isArray(conversations)) {
            return conversations.map(
              (conversation: any) =>
                conversation.id
            );
          }

          return [conversations.id];
        })
        .filter(Boolean);

    if (conversationIds.length === 0) {
      if (!cancelled) {
        setUnreadCount(0);
      }
      return;
    }

    // --------------------------------------------------
    // UNREAD MESSAGES
    // --------------------------------------------------

    const {
      count,
      error: messagesError,
    } = await supabase
      .from("match_messages")
      .select("*", {
        count: "exact",
        head: true,
      })
      .in(
        "conversation_id",
        conversationIds
      )
      .neq("sender_id", user.id)
      .is("read_at", null);

    if (messagesError) {
      console.error(
        "Unread messages error:",
        messagesError
      );
      return;
    }

    if (!cancelled) {
      setUnreadCount(count ?? 0);
    }
  } catch (error) {
    // The unread badge must never crash the navigation
    // if Supabase has a temporary network/fetch failure.
    console.error(
      "Bottom nav unread count failed:",
      error
    );
  }
}

    // --------------------------------------------------
    // REALTIME
    // --------------------------------------------------

    const channel = supabase
      .channel(
        "bottom-nav-unread-messages"
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table:
            "match_messages",
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
          table:
            "match_messages",
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;

      supabase.removeChannel(
        channel
      );
    };
  }, [supabase, pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <div className="mx-auto flex h-20 max-w-md items-center justify-around px-2">
        {navigation.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              pathname ===
                item.href ||
              (item.href !==
                "/dashboard" &&
                pathname.startsWith(
                  item.href
                ));

            const isChat =
              item.name ===
              "Chat";

            return (
              <Link
                key={
                  item.name
                }
                href={
                  item.href
                }
                className={`flex min-w-[58px] flex-col items-center justify-center gap-1.5 text-xs font-medium transition ${
                  active
                    ? "text-[#00B83F]"
                    : "text-slate-400"
                }`}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={
                      active
                        ? 2.5
                        : 2
                    }
                  />

                  {isChat &&
                    unreadCount >
                      0 && (
                      <span className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00B83F] px-1 text-[10px] font-bold text-white">
                        {unreadCount >
                        99
                          ? "99+"
                          : unreadCount}
                      </span>
                    )}
                </div>

                <span>
                  {item.name}
                </span>
              </Link>
            );
          }
        )}
      </div>
    </nav>
  );
}
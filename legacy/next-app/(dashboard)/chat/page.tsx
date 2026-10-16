import Link from "next/link";

import {
  CalendarDays,
  ChevronRight,
  MessageCircle,
  Shield,
} from "lucide-react";

import { getMyConversations } from "@/features/chat/services/chat.service";
import { ChatRealtimeRefresh } from "@/features/chat/components/chat-realtime-refresh";

export default async function ChatPage() {
  const conversations = await getMyConversations();

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-4 pb-28 pt-6">
      <ChatRealtimeRefresh />

      {/* -------------------------------------------
          HEADER
      ------------------------------------------- */}

      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-950">
          Chat
        </h1>

        <p className="mt-0.5 text-[13px] text-slate-500">
          Your match conversations.
        </p>
      </header>

      {/* -------------------------------------------
          CONVERSATIONS
      ------------------------------------------- */}

      <section className="mt-6">
        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center shadow-sm">
  {/* Icon */}
  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
    <MessageCircle
      size={24}
      strokeWidth={1.9}
      className="text-[#00B83F]"
    />
  </div>

  {/* Title */}
  <h2 className="mt-3 text-[15px] font-bold text-slate-950">
    No conversations yet
  </h2>

  {/* Description */}
  <p className="mx-auto mt-1.5 max-w-[250px] text-[12px] leading-[18px] text-slate-500">
    Your chats will appear here once a match has been arranged.
  </p>

  {/* Action */}
  <Link
    href="/matches?type=friendlies"
    className="mx-auto mt-5 flex h-10 w-fit min-w-[150px] items-center justify-center rounded-xl bg-[#00B83F] px-5 text-[12px] font-bold text-white shadow-sm transition active:scale-[0.98]"
  >
    Find a Match
  </Link>
</div>
        ) : (
          /* CONVERSATION LIST */

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {conversations.map((conversation: any, index: number) => {
              const opponent = conversation.opponent;

              const opponentClub = Array.isArray(opponent?.clubs)
                ? opponent.clubs[0]
                : opponent?.clubs;

              const chat = Array.isArray(
                conversation.match_conversations
              )
                ? conversation.match_conversations[0]
                : conversation.match_conversations;

              const messages = chat?.match_messages ?? [];

              const latestMessage = [...messages].sort(
                (a: any, b: any) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )[0];

              const latestMessageTime = latestMessage
                ? new Intl.DateTimeFormat("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Europe/London",
                  }).format(new Date(latestMessage.created_at))
                : null;

              const formattedMatchDate = conversation.match_date
                ? new Intl.DateTimeFormat("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  }).format(
                    new Date(`${conversation.match_date}T00:00:00`)
                  )
                : "";

              const formattedMatchTime =
                conversation.kick_off_time?.slice(0, 5) ?? "";

              if (!chat?.id) {
                return null;
              }

              return (
                <Link
                  key={conversation.id}
                  href={`/chat/${chat.id}`}
                  className={`group block px-4 py-4 transition active:bg-slate-50 ${
                    index !== conversations.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* ---------------------------------
                        CLUB BADGE
                    --------------------------------- */}

                    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center">
                      {opponentClub?.badge_url ? (
                        <img
                          src={opponentClub.badge_url}
                          alt={`${opponentClub.name} badge`}
                          className="h-12 w-12 object-contain"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                          <Shield
                            size={19}
                            strokeWidth={1.8}
                            className="text-slate-400"
                          />
                        </div>
                      )}
                    </div>

                    {/* ---------------------------------
                        CONTENT
                    --------------------------------- */}

                    <div className="min-w-0 flex-1">
                      {/* CLUB + TIME */}

                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`truncate text-[14px] leading-tight ${
                              conversation.unreadCount > 0
                                ? "font-bold text-slate-950"
                                : "font-semibold text-slate-950"
                            }`}
                          >
                            {opponentClub?.name ?? "Opponent"}
                          </h3>

                          <p className="mt-1 truncate text-[11px] text-slate-500">
                            {opponent?.name ?? "Team"}
                          </p>
                        </div>

                        {latestMessageTime && (
                          <span
                            className={`shrink-0 text-[11px] ${
                              conversation.unreadCount > 0
                                ? "font-semibold text-[#00A638]"
                                : "text-slate-400"
                            }`}
                          >
                            {latestMessageTime}
                          </span>
                        )}
                      </div>

                      {/* MESSAGE + UNREAD */}

                      <div className="mt-2 flex min-w-0 items-center gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-[13px] ${
                            conversation.unreadCount > 0
                              ? "font-semibold text-slate-900"
                              : latestMessage
                                ? "font-normal text-slate-600"
                                : "text-slate-400"
                          }`}
                        >
                          {latestMessage?.message ?? "No messages yet"}
                        </p>

                        {conversation.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#00B83F] px-1.5 text-[10px] font-bold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* MATCH DATE */}

                      {(formattedMatchDate || formattedMatchTime) && (
                        <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-400">
                            <CalendarDays
                              size={13}
                              strokeWidth={1.8}
                              className="shrink-0"
                            />

                            <span className="truncate">
                              {formattedMatchDate}

                              {formattedMatchDate &&
                                formattedMatchTime &&
                                " · "}

                              {formattedMatchTime}
                            </span>
                          </div>

                          <ChevronRight
                            size={16}
                            strokeWidth={2}
                            className="shrink-0 text-slate-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
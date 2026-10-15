import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Shield,
} from "lucide-react";

import { getConversation } from "@/features/chat/services/chat.service";
import { ChatMessageForm } from "@/features/chat/components/chat-message-form";
import { RealtimeMessages } from "@/features/chat/components/realtime-messages";
import { createClient } from "@/lib/supabase/server";
import { markConversationAsRead } from "@/features/chat/services/chat-message.service";

type ChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConversationPage({
  params,
}: ChatPageProps) {
  const { id } = await params;

  const conversation =
    await getConversation(id);

  await markConversationAsRead(
    conversation.id
  );

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const opponentClub = Array.isArray(
    conversation.opponent?.clubs
  )
    ? conversation.opponent?.clubs[0]
    : conversation.opponent?.clubs;

  const formattedDate =
    conversation.matchDate
      ? new Intl.DateTimeFormat("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }).format(
          new Date(
            `${conversation.matchDate}T00:00:00`
          )
        )
      : "";

  const formattedTime =
    conversation.kickOffTime?.slice(
      0,
      5
    ) ?? "";

  const isCancelled =
    conversation.status === "cancelled";

  return (
    <main className="mx-auto flex h-[calc(100vh-72px)] w-full max-w-md flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            {opponentClub?.badge_url ? (
              <img
                src={
                  opponentClub.badge_url
                }
                alt={`${opponentClub.name} badge`}
                className="h-11 w-11 shrink-0 object-contain"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                <Shield
                  size={18}
                  className="text-slate-500"
                />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="truncate font-bold text-slate-950">
                {opponentClub?.name ??
                  "Opponent"}
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                {conversation.opponent
                  ?.name ?? "Team"}
              </p>
            </div>
          </div>

          {isCancelled && (
            <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600">
              Cancelled
            </span>
          )}
        </div>

        {/* Match Details */}
        <Link
          href={`/matches/${conversation.matchId}`}
          className="mt-4 flex items-center justify-between rounded-xl bg-[#F5F6F8] px-4 py-3"
        >
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarDays
              size={16}
              className="text-slate-500"
            />

            <span>
              {formattedDate} ·{" "}
              {formattedTime}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={15} />

            <span>
              {conversation.location}
            </span>
          </div>
        </Link>
      </header>

      {/* Messages */}
      <section className="flex-1 overflow-y-auto px-5 py-5">
        <RealtimeMessages
          conversationId={
            conversation.id
          }
          currentUserId={user.id}
          initialMessages={
            conversation.messages
          }
        />
      </section>

      {/* Composer / Cancelled state */}
      <div className="border-t border-gray-200 bg-white">
        {isCancelled ? (
          <div className="px-5 py-4 text-center">
            <p className="text-sm font-semibold text-slate-700">
              This match has been cancelled.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              You can still view previous messages.
            </p>
          </div>
        ) : (
          <ChatMessageForm
            conversationId={
              conversation.id
            }
          />
        )}
      </div>
    </main>
  );
}
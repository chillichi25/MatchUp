import Link from "next/link";
import {
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock,
  MapPin,
  MessageCircle,
  Shield,
} from "lucide-react";

import { getFriendlyRequestById } from "@/features/friendlies/services/incoming-request.service";
import { AcceptRequestButton } from "@/features/friendlies/components/accept-request-button";
import { DeclineRequestButton } from "@/features/friendlies/components/decline-request-button";
import { CancelRequestButton } from "@/features/friendlies/components/cancel-request-button";

import { BackButton } from "@/components/ui/back-button";
import { createClient } from "@/lib/supabase/server";

export default async function FriendlyRequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await getFriendlyRequestById(id);

  if (!request) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-24 pt-6">
        <BackButton />

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <h1 className="text-lg font-bold text-slate-900">
            Request not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This friendly request may no longer be available.
          </p>
        </div>
      </main>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // --------------------------------------------------
  // REQUESTING TEAM
  // --------------------------------------------------

  const requestingTeam = Array.isArray(request.teams)
    ? request.teams[0]
    : request.teams;

  const requestingClub = Array.isArray(requestingTeam?.clubs)
    ? requestingTeam.clubs[0]
    : requestingTeam?.clubs;

  // --------------------------------------------------
  // FRIENDLY
  // --------------------------------------------------

  const friendly = Array.isArray(request.friendlies)
    ? request.friendlies[0]
    : request.friendlies;

    const friendlyTeam = Array.isArray(friendly?.teams)
  ? friendly.teams[0]
  : friendly?.teams;

const friendlyClub = Array.isArray(friendlyTeam?.clubs)
  ? friendlyTeam.clubs[0]
  : friendlyTeam?.clubs;
  // --------------------------------------------------
  // VIEWER
  // --------------------------------------------------

  const isRequestingCoach =
    request.requested_by === user.id;

  const isFriendlyOwner =
    friendly?.created_by === user.id;

    // Show the OTHER team in the request.
//
// Friendly owner:
//   sees the team that requested their friendly.
//
// Requesting coach:
//   sees the team whose friendly they requested.

const displayedTeam = isRequestingCoach
  ? friendlyTeam
  : requestingTeam;

const displayedClub = isRequestingCoach
  ? friendlyClub
  : requestingClub;

  // --------------------------------------------------
  // DATE
  // --------------------------------------------------

  const formattedDate = friendly?.match_date
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(
        new Date(`${friendly.match_date}T00:00:00`)
      )
    : "";

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const isAccepted =
    request.status === "accepted";

  const isDeclined =
    request.status === "declined";

  const isPending =
    request.status === "pending";

    const isCancelled =
  request.status === "cancelled";

  const isExpired =
  request.status === "expired";

  // --------------------------------------------------
  // ACCEPTED MATCH
  // --------------------------------------------------

  let acceptedMatch = null;

  if (isAccepted) {
    const { data: match } = await supabase
      .from("matches")
      .select(`
        id,
        match_conversations (
          id
        )
      `)
      .eq("friendly_request_id", request.id)
      .maybeSingle();

    acceptedMatch = match;
  }

  const conversation = Array.isArray(
    acceptedMatch?.match_conversations
  )
    ? acceptedMatch.match_conversations[0]
    : acceptedMatch?.match_conversations;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-28 pt-6">
      {/* --------------------------------------------------
          HEADER
      -------------------------------------------------- */}

      <header className="relative flex items-center justify-center">
        <div className="absolute left-0">
          <BackButton />
        </div>

        <h1 className="text-xl font-bold text-slate-950">
          {isPending && isFriendlyOwner
            ? "Review Request"
            : "Friendly Request"}
        </h1>
      </header>

      {/* --------------------------------------------------
          REQUEST CARD
      -------------------------------------------------- */}

      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* CLUB + STATUS */}

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {displayedClub?.badge_url ? (
  <img
    src={displayedClub.badge_url}
    alt={`${displayedClub.name} badge`}
    className="h-14 w-14 shrink-0 object-contain"
  />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white">
                  <Shield
                    size={17}
                    strokeWidth={1.8}
                    className="text-slate-500"
                  />
                </div>
              </div>
            )}

            <div className="min-w-0">
              <h2 className="text-lg font-bold leading-tight text-slate-950">
                {displayedClub?.name ?? "Club"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {displayedTeam?.name ?? "Team"}
              </p>
            </div>
          </div>

          {/* STATUS */}

          <div className="shrink-0">
            {isPending && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Pending
              </span>
            )}

            {isAccepted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                <CircleCheck
                  size={14}
                  strokeWidth={2.5}
                />
                Accepted
              </span>
            )}

            {isDeclined && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                <CircleX
                  size={14}
                  strokeWidth={2.5}
                />
                Declined
              </span>
            )}

            {isCancelled && (
  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
    <CircleX
      size={14}
      strokeWidth={2.5}
    />
    Cancelled
  </span>
)}

{isExpired && (
  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
    Expired
  </span>
)}
          </div>
        </div>

        {/* --------------------------------------------------
            OUTGOING PENDING STATE
        -------------------------------------------------- */}

        {isPending && isRequestingCoach && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <div className="rounded-2xl bg-amber-50 px-5 py-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-amber-600">
                <Clock
                  size={19}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                Waiting for response
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                The other team will review your friendly
                request.
              </p>
            </div>
          </div>
        )}

        {isPending && isRequestingCoach && (
  <div className="mt-4">
    <CancelRequestButton
      requestId={request.id}
    />
  </div>
)}

        {/* --------------------------------------------------
            MATCH DETAILS
        -------------------------------------------------- */}

        <div className="ml-5 mt-4 space-y-1.5 text-sm text-slate-700">
          <div className="flex items-center gap-3">
            <CalendarDays
              size={16}
              className="shrink-0 text-slate-500"
            />

            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock
              size={16}
              className="shrink-0 text-slate-500"
            />

            <span>
              {friendly?.kick_off_time?.slice(0, 5)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <MapPin
              size={16}
              className="shrink-0 text-slate-500"
            />

            <span>{friendly?.location}</span>
          </div>
        </div>

        {/* --------------------------------------------------
            MESSAGE
        -------------------------------------------------- */}

        {request.message && (
          <div className="mb-3 mt-4 rounded-xl bg-[#F5F6F8] px-5 py-4">
            <p className="text-sm text-slate-700">
              {request.message}
            </p>
          </div>
        )}

        {/* --------------------------------------------------
            INCOMING PENDING ACTIONS
        -------------------------------------------------- */}

        {isPending && isFriendlyOwner && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <DeclineRequestButton
  requestId={request.id}
/>

            <AcceptRequestButton
              requestId={request.id}
            />
          </div>
        )}

        {/* --------------------------------------------------
            ACCEPTED ACTIONS
        -------------------------------------------------- */}

        {isAccepted && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="space-y-2">
              <Link
                href={
                  acceptedMatch?.id
                    ? `/matches/${acceptedMatch.id}`
                    : "/matches"
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00B83F] text-sm font-semibold text-white"
              >
                <CalendarDays size={17} />
                View Match
              </Link>

              <Link
                href={
                  conversation?.id
                    ? `/chat/${conversation.id}`
                    : "/chat"
                }
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#00B83F] text-sm font-semibold text-[#00B83F]"
              >
                <MessageCircle size={17} />
                Open Chat
              </Link>
            </div>
          </div>
        )}

        {/* --------------------------------------------------
            DECLINED ACTIONS
        -------------------------------------------------- */}

        {isDeclined && (
  <div className="mt-5 border-t border-gray-200 pt-5">
    {isRequestingCoach && friendly?.status === "open" ? (
      <div className="space-y-3">
        <Link
          href={`/friendlies/${friendly.id}/request`}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-[#00B83F] text-sm font-semibold text-white"
        >
          Request Again
        </Link>

        <Link
          href="/friendlies"
          className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-slate-700"
        >
          Find Another Match
        </Link>
      </div>
    ) : (
      <Link
        href="/friendlies"
        className="flex h-11 w-full items-center justify-center rounded-xl bg-[#00B83F] text-sm font-semibold text-white"
      >
        Find Another Match
      </Link>
    )}
  </div>
)}

{/* --------------------------------------------------
    EXPIRED STATE
-------------------------------------------------- */}

{isExpired && (
  <div className="mt-5 border-t border-gray-200 pt-5">
    <div className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
      <Clock
        size={20}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-sm font-semibold text-slate-900">
        Request expired
      </p>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        This friendly&apos;s match time has passed.
      </p>
    </div>

    <Link
      href="/friendlies"
      className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#00B83F] text-sm font-semibold text-white"
    >
      Find Another Match
    </Link>
  </div>
)}
      </section>
    </main>
  );
}
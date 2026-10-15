import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  Pencil,
} from "lucide-react";

import { getMatchDetails } from "@/features/matches/services/get-match-details";
import { MatchChangeResponseActions } from "@/features/matches/components/match-change-response-actions";
import { CancelMatchButton } from "@/features/matches/components/cancel-match-button";
import { MatchResultResponseActions } from "@/features/matches/components/match-result-response-actions";
import { MatchNoteCard } from "@/features/matches/components/match-note-card";

type MatchDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function MatchDetailsPage({
  params,
  searchParams,
}: MatchDetailsPageProps) {
  const { id } = await params;

  const { from } = await searchParams;

  const backHref =
    from === "history"
      ? "/matches/history"
      : "/matches/upcoming";

  const match =
    await getMatchDetails(id);

  const club = Array.isArray(
    match.opponent.clubs
  )
    ? match.opponent.clubs[0]
    : match.opponent.clubs;

  const formattedDate =
    new Date(
      `${match.match_date}T00:00:00`
    ).toLocaleDateString(
      "en-GB",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      }
    );

  const formattedTime =
    match.kick_off_time?.slice(
      0,
      5
    ) ?? "";

  const isCompleted =
    match.status === "completed";

    const isCancelled =
  match.status === "cancelled";

  const matchDateTime =
  new Date(
    `${match.match_date}T${match.kick_off_time}`
  );

const isPast =
  matchDateTime.getTime() <
  Date.now();

    const pendingChange =
  match.pendingChange;

  const pendingResult =
  match.pendingResult;

const isMyResultSubmission =
  pendingResult?.submitted_by_team_id ===
  match.activeTeamId;

  const opponentSubmittedResult =
  Boolean(
    pendingResult &&
      pendingResult.submitted_by_team_id !==
        match.activeTeamId
  );

const matchDisplayStatus =
  isCompleted
    ? "completed"
    : isCancelled
      ? "cancelled"
      : opponentSubmittedResult
        ? "result_to_confirm"
        : isMyResultSubmission
          ? "awaiting_confirmation"
          : isPast
            ? "result_needed"
            : "scheduled";

const isMyProposal =
  pendingChange?.proposed_by_team_id ===
  match.activeTeamId;

const proposedDate =
  pendingChange
    ? new Date(
        `${pendingChange.proposed_match_date}T00:00:00`
      ).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";

const proposedTime =
  pendingChange?.proposed_kick_off_time?.slice(
    0,
    5
  ) ?? "";

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}

      <header className="flex items-center">
        <Link
  href={backHref}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="flex-1 pr-11 text-center text-lg font-bold">
          Match Details
        </h1>
      </header>

      {/* Match */}

      <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
  {/* Status */}

  <div className="flex justify-end">
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        matchDisplayStatus === "completed"
          ? "bg-blue-100 text-blue-700"
          : matchDisplayStatus === "cancelled"
            ? "bg-red-100 text-red-700"
            : matchDisplayStatus === "result_to_confirm"
              ? "bg-blue-100 text-blue-700"
              : matchDisplayStatus === "awaiting_confirmation"
                ? "bg-amber-100 text-amber-700"
                : matchDisplayStatus === "result_needed"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-green-100 text-green-700"
      }`}
    >
      {matchDisplayStatus === "completed"
        ? "Completed"
        : matchDisplayStatus === "cancelled"
          ? "Cancelled"
          : matchDisplayStatus === "result_to_confirm"
            ? "Result to confirm"
            : matchDisplayStatus === "awaiting_confirmation"
              ? "Awaiting confirmation"
              : matchDisplayStatus === "result_needed"
                ? "Result needed"
                : "Scheduled"}
    </span>
  </div>

  {/* Opponent */}

  <div className="mt-3">
    <h2 className="text-2xl font-bold text-slate-950">
      {club?.name ?? "Opponent"}
    </h2>

    <p className="mt-1 text-slate-500">
      {match.opponent.name}
    </p>
  </div>
</div>
        <div className="mt-6 space-y-3 text-slate-700">
          <div className="flex items-center gap-2">
            <CalendarDays
              size={18}
            />

            <span>
              {formattedDate}

              {formattedTime
                ? ` · ${formattedTime}`
                : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={18} />

            <span>
              {match.location ||
                "Location TBC"}
            </span>
          </div>
        </div>

        {isCompleted &&
  match.home_score !== null &&
  match.away_score !== null && (
    <div className="mt-6 rounded-2xl bg-gray-50 px-5 py-4">
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
        Final score
      </p>

      <div className="mt-3 flex items-center justify-center gap-5">
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-500">
            Home
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-950">
            {match.home_score}
          </p>
        </div>

        <span className="mt-5 text-xl font-semibold text-slate-300">
          –
        </span>

        <div className="text-center">
          <p className="text-xs font-semibold text-slate-500">
            Away
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-950">
            {match.away_score}
          </p>
        </div>
      </div>
    </div>
  )}

        <div className="mt-8 space-y-3">
  {/* Open Chat */}

  {match.conversationId && (
    <Link
      href={`/chat/${match.conversationId}`}
      className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white"
    >
      <MessageCircle
        size={18}
        className="mr-2"
      />

      Open Chat
    </Link>
  )}

  {/* Add Result */}

  {match.status === "scheduled" &&
    !pendingChange &&
    !match.pendingResult && (
      <Link
        href={`/matches/${match.id}/add-result`}
        className="flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white font-semibold text-slate-700"
      >
        Add Result
      </Link>
    )}

  {/* Propose Change */}

  {match.status === "scheduled" &&
  !isPast &&
  !pendingChange &&
  !match.pendingResult && (
      <Link
        href={`/matches/${match.id}/propose-change`}
        className="flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white font-semibold text-slate-700"
      >
        <Pencil
          size={18}
          className="mr-2"
        />

        Propose Change
      </Link>
    )}

  {/* Cancel Match */}

  {match.status === "scheduled" &&
  !isPast &&
  !pendingChange &&
  !match.pendingResult && (
      <CancelMatchButton
        matchId={match.id}
        activeTeamId={match.activeTeamId}
      />
    )}
</div>
      </section>

{/* Pending Match Change */}

{pendingChange && (
  <section className="mt-6 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
        <Clock3
          size={20}
          className="text-amber-600"
        />
      </div>

      <div>
        <h3 className="font-bold text-slate-900">
          {isMyProposal
            ? "Change proposed"
            : "Change requested"}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {isMyProposal
            ? "Waiting for your opponent to respond."
            : "Your opponent proposed changes to this match."}
        </p>
      </div>
    </div>

    {/* Current vs Proposed */}

    <div className="mt-6 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Current
        </p>

        <p className="mt-3 text-sm font-semibold text-slate-900">
          {formattedDate}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {formattedTime}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {match.location ||
            "Location TBC"}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
          Proposed
        </p>

        <p className="mt-3 text-sm font-semibold text-slate-900">
          {proposedDate}
        </p>

        <p className="mt-1 text-sm font-semibold text-amber-700">
          {proposedTime}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {pendingChange.proposed_location ||
            "Location TBC"}
        </p>
      </div>
    </div>

    {!isMyProposal && (
  <MatchChangeResponseActions
    matchId={match.id}
    changeRequestId={pendingChange.id}
  />
)}
  </section>
)}

{/* Pending Match Result */}

{pendingResult && (
  <section className="mt-6 rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
    <div>
      <h3 className="font-bold text-slate-900">
        Result submitted
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {isMyResultSubmission
          ? "Waiting for your opponent to confirm."
          : "Your opponent submitted this result."}
      </p>
    </div>

    {/* Score */}

    <div className="mt-6 flex items-center justify-center gap-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Home
        </p>

        <p className="mt-2 text-4xl font-bold text-slate-950">
          {pendingResult.home_score}
        </p>
      </div>

      <span className="mt-5 text-2xl font-semibold text-slate-300">
        –
      </span>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Away
        </p>

        <p className="mt-2 text-4xl font-bold text-slate-950">
          {pendingResult.away_score}
        </p>
      </div>
    </div>

    {!isMyResultSubmission && (
      <MatchResultResponseActions
        matchId={match.id}
        resultRequestId={
          pendingResult.id
        }
      />
    )}
  </section>
)}

      <MatchNoteCard
  matchId={match.id}
  activeTeamId={match.activeTeamId}
  initialNote={
    match.matchNote?.note ?? null
  }
/>
    </main>
  );
}
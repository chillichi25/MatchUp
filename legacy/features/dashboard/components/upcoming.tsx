"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ChevronRight,
  Clock3,
  MapPin,
  Shield,
  Trophy,
} from "lucide-react";

type UpcomingMatch = {
  id: string;
  matchDate: string;
  kickOff: string | null;
  location: string | null;
  isHome: boolean;

  opponent: {
    teamName: string;
    clubName: string;
    badgeUrl: string | null;
  };
};

type UpcomingTournament = {
  id: string;
  name: string;
  ageGroup: string | null;
  startDate: string;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  location: string | null;
};

type UpcomingProps = {
  matches: UpcomingMatch[];
  tournaments: UpcomingTournament[];

  nextEventType:
    | "match"
    | "tournament"
    | null;

  nextEventId:
    | string
    | null;
};

export function Upcoming({
  matches,
  tournaments,
  nextEventType,
  nextEventId,
}: UpcomingProps) {
  const [activeTab, setActiveTab] =
    useState<
      "matches" | "tournaments"
    >("matches");

  const isMatches =
    activeTab === "matches";

    const hasUpcomingActivity =
  matches.length > 0 ||
  tournaments.length > 0;

if (!hasUpcomingActivity) {
  return null;
}

  // --------------------------------------------------
  // REMOVE THE EVENT ALREADY SHOWN IN "UP NEXT"
  // --------------------------------------------------

  const visibleMatches =
    matches.filter(
      (match) =>
        !(
          nextEventType ===
            "match" &&
          match.id ===
            nextEventId
        )
    );

  const visibleTournaments =
    tournaments.filter(
      (tournament) =>
        !(
          nextEventType ===
            "tournament" &&
          tournament.id ===
            nextEventId
        )
    );

  const viewAllHref =
    isMatches
      ? "/matches/upcoming"
      : "/tournaments/participating";

  const viewAllLabel =
    isMatches
      ? "View All Matches"
      : "View All Tournaments";

  return (
    <section className="mt-8">
      {/* ------------------------------------------------
          HEADING
      ------------------------------------------------ */}

      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
        Upcoming
      </h2>

      {/* ------------------------------------------------
          TABS
      ------------------------------------------------ */}

      <div className="mt-3 grid grid-cols-2 rounded-xl bg-slate-200/70 p-1">
        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "matches"
            )
          }
          className={`rounded-lg px-3 py-2 text-[13px] font-bold transition ${
            isMatches
              ? "bg-white text-[#00A638] shadow-sm"
              : "text-slate-500"
          }`}
        >
          Matches
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab(
              "tournaments"
            )
          }
          className={`rounded-lg px-3 py-2 text-[13px] font-bold transition ${
            !isMatches
              ? "bg-white text-[#00A638] shadow-sm"
              : "text-slate-500"
          }`}
        >
          Tournaments
        </button>
      </div>

      {/* ------------------------------------------------
          MATCHES
      ------------------------------------------------ */}

      {isMatches && (
        <div className="mt-3 space-y-2">
          {visibleMatches.length ===
          0 ? (
            <EmptyState
  type="matches"
  hasUpNext={
    nextEventType === "match"
  }
/>
          ) : (
            visibleMatches
              .slice(0, 2)
              .map((match) => (
                <UpcomingMatchRow
                  key={match.id}
                  match={match}
                />
              ))
          )}
        </div>
      )}

      {/* ------------------------------------------------
          TOURNAMENTS
      ------------------------------------------------ */}

      {!isMatches && (
        <div className="mt-3 space-y-2">
          {visibleTournaments.length ===
          0 ? (
            <EmptyState
  type="tournaments"
  hasUpNext={
    nextEventType === "tournament"
  }
/>
          ) : (
            visibleTournaments
              .slice(0, 2)
              .map(
                (
                  tournament
                ) => (
                  <UpcomingTournamentRow
                    key={
                      tournament.id
                    }
                    tournament={
                      tournament
                    }
                  />
                )
              )
          )}
        </div>
      )}

      {/* ------------------------------------------------
          VIEW ALL
      ------------------------------------------------ */}

      <Link
  href={viewAllHref}
  className="mt-3 flex h-10 w-full items-center justify-center rounded-full border border-[#00B83F] bg-white text-[13px] font-bold text-[#00A638] transition active:scale-[0.99]"
>
  {viewAllLabel}
</Link>
    </section>
  );
}

/* --------------------------------------------------
   UPCOMING MATCH ROW
-------------------------------------------------- */

function UpcomingMatchRow({
  match,
}: {
  match: UpcomingMatch;
}) {
  const date =
    new Date(
      `${match.matchDate}T00:00:00`
    );

  const weekday =
    date
      .toLocaleDateString(
        "en-GB",
        {
          weekday: "short",
        }
      )
      .toUpperCase();

  const day =
    date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
      }
    );

  const month =
    date
      .toLocaleDateString(
        "en-GB",
        {
          month: "short",
        }
      )
      .toUpperCase();

  const kickOff =
    match.kickOff
      ?.slice(0, 5) ??
    "TBC";

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center">
        {/* Date */}

        <div className="flex w-[46px] shrink-0 flex-col items-center border-r border-slate-100 pr-3">
          <span className="text-[9px] font-bold tracking-wide text-slate-400">
            {weekday}
          </span>

          <span className="mt-0.5 text-[19px] font-bold leading-none text-[#00A638]">
            {day}
          </span>

          <span className="mt-1 text-[9px] font-bold tracking-wide text-slate-400">
            {month}
          </span>
        </div>

        {/* Badge */}

        <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center">
          {match.opponent
            .badgeUrl ? (
            <Image
              src={
                match.opponent
                  .badgeUrl
              }
              alt={
                match.opponent
                  .clubName
              }
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
          ) : (
            <Shield
              size={32}
              className="text-slate-300"
            />
          )}
        </div>

        {/* Details */}

        <div className="ml-3 min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-slate-950">
            {
              match.opponent
                .clubName
            }
          </p>

          <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
            {
              match.opponent
                .teamName
            }
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex min-w-0 items-center gap-1 text-[10px] font-medium text-slate-500">
              <MapPin
                size={11}
                strokeWidth={2}
                className="shrink-0"
              />

              <span className="truncate">
                {match.isHome
                  ? "Home"
                  : "Away"}

                {match.location
                  ? ` · ${match.location}`
                  : ""}
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-slate-500">
              <Clock3
                size={11}
                strokeWidth={2}
              />

              {kickOff}
            </span>
          </div>
        </div>

        <ChevronRight
          size={18}
          className="ml-2 shrink-0 text-slate-300"
        />
      </div>
    </Link>
  );
}

/* --------------------------------------------------
   UPCOMING TOURNAMENT ROW
-------------------------------------------------- */

function UpcomingTournamentRow({
  tournament,
}: {
  tournament: UpcomingTournament;
}) {
  const date =
    new Date(
      `${tournament.startDate}T00:00:00`
    );

  const weekday =
    date
      .toLocaleDateString(
        "en-GB",
        {
          weekday: "short",
        }
      )
      .toUpperCase();

  const day =
    date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
      }
    );

  const month =
    date
      .toLocaleDateString(
        "en-GB",
        {
          month: "short",
        }
      )
      .toUpperCase();

  const startTime =
    tournament.startTime
      ?.slice(0, 5) ??
    "TBC";

  return (
    <Link
      href={`/tournaments/${tournament.id}?from=participating`}
      className="block rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center">
        {/* Date */}

        <div className="flex w-[46px] shrink-0 flex-col items-center border-r border-slate-100 pr-3">
          <span className="text-[9px] font-bold tracking-wide text-slate-400">
            {weekday}
          </span>

          <span className="mt-0.5 text-[19px] font-bold leading-none text-violet-600">
            {day}
          </span>

          <span className="mt-1 text-[9px] font-bold tracking-wide text-slate-400">
            {month}
          </span>
        </div>

        {/* Tournament icon */}

        <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-50">
          <Trophy
            size={21}
            className="text-violet-600"
            strokeWidth={2}
          />
        </div>

        {/* Details */}

        <div className="ml-3 min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-slate-950">
            {tournament.name}
          </p>

          <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">
            {tournament.ageGroup
              ? `${tournament.ageGroup} Tournament`
              : "Tournament"}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {tournament.location && (
              <span className="flex min-w-0 items-center gap-1 text-[10px] font-medium text-slate-500">
                <MapPin
                  size={11}
                  strokeWidth={2}
                  className="shrink-0"
                />

                <span className="max-w-[105px] truncate">
                  {
                    tournament.location
                  }
                </span>
              </span>
            )}

            <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-slate-500">
              <Clock3
                size={11}
                strokeWidth={2}
              />

              {startTime}
            </span>
          </div>
        </div>

        <ChevronRight
          size={18}
          className="ml-2 shrink-0 text-slate-300"
        />
      </div>
    </Link>
  );
}

function EmptyState({
  type,
  hasUpNext,
}: {
  type:
    | "matches"
    | "tournaments";
  hasUpNext: boolean;
}) {
  const isMatches =
    type === "matches";

  const title = isMatches
    ? hasUpNext
      ? "No more upcoming matches"
      : "No upcoming matches"
    : hasUpNext
      ? "No more upcoming tournaments"
      : "No upcoming tournaments";

  const description = isMatches
    ? hasUpNext
      ? "Your next match is already shown in Up Next."
      : "Matches you arrange will appear here."
    : hasUpNext
      ? "Your next tournament is already shown in Up Next."
      : "Tournaments you join will appear here.";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      {/* Icon */}

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isMatches
            ? "bg-green-50"
            : "bg-violet-50"
        }`}
      >
        {isMatches ? (
          <Shield
            size={19}
            className="text-[#00B83F]"
          />
        ) : (
          <Trophy
            size={19}
            className="text-violet-600"
          />
        )}
      </div>

      {/* Text */}

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-tight text-slate-950">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-[15px] text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}
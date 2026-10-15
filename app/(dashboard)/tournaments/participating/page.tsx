import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  MapPin,
  Trophy,
} from "lucide-react";

import { getParticipatingTournaments } from "@/features/tournaments/services/get-participating-tournaments";

export default async function ParticipatingTournamentsPage() {
  const {
    activeTeam,
    tournaments,
  } =
    await getParticipatingTournaments();

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}

      <header className="relative flex items-center justify-center">
        <Link
          href="/dashboard"
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft
            size={22}
          />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          Upcoming Tournaments
        </h1>
      </header>

      {activeTeam && (
        <div className="mt-4 text-center">
          <p className="font-semibold text-slate-900">
            {
              activeTeam.name
            }
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Tournaments your team
            has joined.
          </p>
        </div>
      )}

      {/* Count */}

      <section className="mt-8">
        <p className="text-sm text-slate-500">
          {
            tournaments.length
          }{" "}
          {tournaments.length ===
          1
            ? "upcoming tournament"
            : "upcoming tournaments"}
        </p>

        {/* Empty state */}

        {/* Empty state */}

{tournaments.length === 0 ? (
  <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center shadow-sm">
    {/* Icon */}
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50">
      <Trophy
        size={24}
        strokeWidth={1.9}
        className="text-violet-600"
      />
    </div>

    {/* Title */}
    <h2 className="mt-3 text-[15px] font-bold text-slate-950">
      No upcoming tournaments
    </h2>

    {/* Description */}
    <p className="mx-auto mt-1.5 max-w-[260px] text-[12px] leading-[18px] text-slate-500">
      You aren&apos;t currently joining any upcoming tournaments.
    </p>

    {/* Action */}
    <Link
      href="/matches?type=tournaments"
      className="mx-auto mt-5 flex h-10 w-fit min-w-[170px] items-center justify-center rounded-xl bg-[#00B83F] px-5 text-[12px] font-bold text-white shadow-sm transition active:scale-[0.98]"
    >
      Find a Tournament
    </Link>
  </div>
) : (
  <div className="mt-5 space-y-4">
            {tournaments.map(
              (tournament: any) => {
                const startDate =
                  new Intl.DateTimeFormat(
                    "en-GB",
                    {
                      weekday:
                        "short",
                      day: "numeric",
                      month: "short",
                    }
                  ).format(
                    new Date(
                      `${tournament.startDate}T00:00:00`
                    )
                  );

                const endDate =
                  tournament.endDate
                    ? new Intl.DateTimeFormat(
                        "en-GB",
                        {
                          weekday:
                            "short",
                          day: "numeric",
                          month:
                            "short",
                        }
                      ).format(
                        new Date(
                          `${tournament.endDate}T00:00:00`
                        )
                      )
                    : null;

                const startTime =
                  tournament.startTime
                    ? tournament.startTime.slice(
                        0,
                        5
                      )
                    : null;

                const endTime =
                  tournament.endTime
                    ? tournament.endTime.slice(
                        0,
                        5
                      )
                    : null;

                return (
                  <Link
                    key={
                      tournament.id
                    }
                    href={`/tournaments/${tournament.id}?from=participating`}
                    className="block rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition hover:border-violet-300"
                  >
                    {/* Header */}

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
                        <Trophy
                          size={24}
                          className="text-violet-600"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="font-bold text-slate-900">
                              {
                                tournament.name
                              }
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                              {
                                tournament.ageGroup
                              }
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Accepted
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tournament.ageGroup && (
                        <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                          {
                            tournament.ageGroup
                          }
                        </span>
                      )}

                      {tournament.gender && (
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-slate-600">
                          {
                            tournament.gender
                          }
                        </span>
                      )}

                      {tournament.level && (
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-slate-600">
                          {
                            tournament.level
                          }
                        </span>
                      )}

                      {tournament.matchFormat && (
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-slate-600">
                          {
                            tournament.matchFormat
                          }
                        </span>
                      )}
                    </div>

                    {/* Info */}

                    <div className="mt-5 space-y-3 text-sm text-slate-500">
                      <div className="flex items-start gap-2">
                        <CalendarDays
                          size={16}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <span>
                          {
                            startDate
                          }

                          {startTime
                            ? `, ${startTime}`
                            : ""}

                          {endDate
                            ? ` – ${endDate}`
                            : ""}

                          {endTime
                            ? `, ${endTime}`
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin
                          size={16}
                          className="shrink-0 text-slate-400"
                        />

                        <span className="truncate">
                          {tournament.location ||
                            "Location TBC"}
                        </span>
                      </div>
                    </div>

                    {/* Action */}

                    <div className="mt-5 flex items-center justify-end gap-1 border-t border-gray-100 pt-4 text-sm font-semibold text-[#00B83F]">
                      View Tournament

                      <ChevronRight
                        size={17}
                      />
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}
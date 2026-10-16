import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type MyTournamentsPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function MyTournamentsPage({
  searchParams,
}: MyTournamentsPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { tab } = await searchParams;

  const activeTab =
    tab === "history"
      ? "history"
      : "active";

  // --------------------------------------------------
  // LOAD ALL TOURNAMENTS CREATED BY THIS COACH
  // --------------------------------------------------

  const {
    data: tournaments,
    error,
  } = await supabase
    .from("tournaments")
    .select(`
      id,
      name,
      age_group,
      gender,
      level,
      match_format,
      start_date,
      start_time,
      end_date,
      end_time,
      location,
      max_teams,
      status
    `)
    .eq("created_by", user.id)
    .order("start_date", {
      ascending: false,
    })
    .order("start_time", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error(
      "My tournaments error:",
      error
    );
  }

  const allTournaments =
    tournaments ?? [];

  // --------------------------------------------------
  // SPLIT ACTIVE / HISTORY
  // --------------------------------------------------

  const activeTournaments =
    allTournaments.filter(
      (tournament) =>
        tournament.status === "open" ||
        tournament.status === "closed"
    );

  const historyTournaments =
    allTournaments.filter(
      (tournament) =>
        tournament.status === "completed" ||
        tournament.status === "cancelled"
    );

  // --------------------------------------------------
  // ACTIVE TOURNAMENT COUNTS
  // --------------------------------------------------

  const activeTournamentIds =
    activeTournaments.map(
      (tournament) =>
        tournament.id
    );

  const requestCounts =
    new Map<
      string,
      {
        accepted: number;
        pending: number;
      }
    >();

  if (
    activeTournamentIds.length > 0
  ) {
    const {
      data: requests,
      error: requestsError,
    } = await supabase
      .from("tournament_requests")
      .select(`
        tournament_id,
        status
      `)
      .in(
        "tournament_id",
        activeTournamentIds
      )
      .in("status", [
        "accepted",
        "pending",
      ]);

    if (requestsError) {
      console.error(
        "My tournament request counts error:",
        requestsError
      );
    }

    for (
      const request of
        requests ?? []
    ) {
      const current =
        requestCounts.get(
          request.tournament_id
        ) ?? {
          accepted: 0,
          pending: 0,
        };

      if (
        request.status ===
        "accepted"
      ) {
        current.accepted += 1;
      }

      if (
        request.status ===
        "pending"
      ) {
        current.pending += 1;
      }

      requestCounts.set(
        request.tournament_id,
        current
      );
    }
  }

  // --------------------------------------------------
  // HISTORY PARTICIPANT COUNTS
  // --------------------------------------------------

  const historyTournamentIds =
    historyTournaments.map(
      (tournament) =>
        tournament.id
    );

  const historyParticipantCounts =
    new Map<string, number>();

  if (
    historyTournamentIds.length > 0
  ) {
    const {
      data: historyRequests,
      error: historyRequestsError,
    } = await supabase
      .from("tournament_requests")
      .select(`
        tournament_id,
        status
      `)
      .in(
        "tournament_id",
        historyTournamentIds
      )
      .eq(
        "status",
        "accepted"
      );

    if (historyRequestsError) {
      console.error(
        "Tournament history participant count error:",
        historyRequestsError
      );
    }

    for (
      const request of
        historyRequests ?? []
    ) {
      const current =
        historyParticipantCounts.get(
          request.tournament_id
        ) ?? 0;

      historyParticipantCounts.set(
        request.tournament_id,
        current + 1
      );
    }
  }

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function formatTournamentDate(
    date: string | null
  ) {
    if (!date) {
      return null;
    }

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      }
    ).format(
      new Date(
        `${date}T00:00:00`
      )
    );
  }

  function formatTime(
    time: string | null
  ) {
    return time
      ? time.slice(0, 5)
      : null;
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* ------------------------------------------------
          HEADER
      ------------------------------------------------ */}

      <header className="relative flex items-center justify-center">
        <Link
          href="/profile"
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          My Tournaments
        </h1>
      </header>

      <p className="mt-3 text-center text-sm text-slate-500">
        Manage tournaments you organise.
      </p>

      {/* ------------------------------------------------
          TABS
      ------------------------------------------------ */}

      <div className="mt-7 grid grid-cols-2 rounded-2xl border border-gray-200 bg-white p-1">
        <Link
          href="/tournaments/my?tab=active"
          className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
            activeTab === "active"
              ? "bg-[#00B83F] text-white"
              : "text-slate-400"
          }`}
        >
          Active
        </Link>

        <Link
          href="/tournaments/my?tab=history"
          className={`flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition ${
            activeTab === "history"
              ? "bg-[#00B83F] text-white"
              : "text-slate-400"
          }`}
        >
          History
        </Link>
      </div>

      {/* ------------------------------------------------
          ACTIVE
      ------------------------------------------------ */}

      {activeTab === "active" && (
        <section className="mt-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Active Tournaments
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {activeTournaments.length}{" "}
              {activeTournaments.length === 1
                ? "tournament"
                : "tournaments"}
            </p>
          </div>

          {activeTournaments.length ===
          0 ? (
            <div className="mt-5 rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                <Trophy
                  size={26}
                  className="text-violet-600"
                />
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                No active tournaments
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tournaments you create
                will appear here while
                they are active.
              </p>

              <Link
                href="/create/tournament"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#00B83F] px-5 text-sm font-semibold text-white"
              >
                Create Tournament
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {activeTournaments.map(
                (tournament) => {
                  const counts =
                    requestCounts.get(
                      tournament.id
                    ) ?? {
                      accepted: 0,
                      pending: 0,
                    };

                  const startDate =
                    formatTournamentDate(
                      tournament.start_date
                    );

                  const endDate =
                    formatTournamentDate(
                      tournament.end_date
                    );

                  const startTime =
                    formatTime(
                      tournament.start_time
                    );

                  const endTime =
                    formatTime(
                      tournament.end_time
                    );

                  const isFull =
                    tournament.max_teams !==
                      null &&
                    counts.accepted >=
                      tournament.max_teams;

                  const displayStatus =
                    tournament.status ===
                    "closed"
                      ? "Closed"
                      : isFull
                        ? "Full"
                        : "Open";

                  return (
                    <Link
                      key={
                        tournament.id
                      }
                      href={`/tournaments/${tournament.id}/manage?from=my`}
                      className="block rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition hover:border-violet-300"
                    >
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
                              <h3 className="truncate font-bold text-slate-900">
                                {
                                  tournament.name
                                }
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {tournament.age_group ??
                                  "Open age"}

                                {tournament.max_teams
                                  ? ` · ${tournament.max_teams} teams`
                                  : ""}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                displayStatus ===
                                "Open"
                                  ? "bg-green-100 text-green-700"
                                  : displayStatus ===
                                      "Full"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {
                                displayStatus
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {tournament.age_group && (
                          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                            {
                              tournament.age_group
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

                        {tournament.match_format && (
                          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-slate-600">
                            {
                              tournament.match_format
                            }
                          </span>
                        )}
                      </div>

                      {/* Information */}

                      <div className="mt-5 space-y-3 text-sm text-slate-500">
                        <div className="flex items-start gap-2">
                          <CalendarDays
                            size={16}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <span>
                            {startDate}

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
                            {
                              tournament.location
                            }
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <Users
                              size={16}
                              className="text-slate-400"
                            />

                            <span>
                              {
                                counts.accepted
                              }

                              {tournament.max_teams !==
                              null
                                ? `/${tournament.max_teams}`
                                : ""}{" "}
                              joined
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock3
                              size={16}
                              className="text-slate-400"
                            />

                            <span>
                              {
                                counts.pending
                              }{" "}
                              pending
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-end gap-1 border-t border-gray-100 pt-4 text-sm font-semibold text-[#00B83F]">
                        Manage

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
      )}

      {/* ------------------------------------------------
          HISTORY
      ------------------------------------------------ */}

      {activeTab === "history" && (
        <section className="mt-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Tournament History
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {historyTournaments.length}{" "}
              {historyTournaments.length ===
              1
                ? "tournament"
                : "tournaments"}
            </p>
          </div>

          {historyTournaments.length ===
          0 ? (
            <div className="mt-5 rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                <Trophy
                  size={26}
                  className="text-violet-600"
                />
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                No tournament history
                yet
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Completed and cancelled
                tournaments will appear
                here.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {historyTournaments.map(
                (tournament) => {
                  const startDate =
                    formatTournamentDate(
                      tournament.start_date
                    );

                  const endDate =
                    formatTournamentDate(
                      tournament.end_date
                    );

                  const startTime =
                    formatTime(
                      tournament.start_time
                    );

                  const endTime =
                    formatTime(
                      tournament.end_time
                    );

                  const isCompleted =
                    tournament.status ===
                    "completed";

                  const participantCount =
                    historyParticipantCounts.get(
                      tournament.id
                    ) ?? 0;

                  return (
                    <Link
  key={tournament.id}
  href={`/tournaments/${tournament.id}?from=my-history`}
                      className="block rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-violet-300"
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
                              <h3 className="truncate font-bold text-slate-900">
                                {
                                  tournament.name
                                }
                              </h3>

                              <p className="mt-1 text-sm text-slate-500">
                                {tournament.age_group ??
                                  "Open age"}

                                {tournament.max_teams
                                  ? ` · ${tournament.max_teams} teams`
                                  : ""}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isCompleted
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isCompleted
                                ? "Completed"
                                : "Cancelled"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {tournament.age_group && (
                          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                            {
                              tournament.age_group
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

                        {tournament.match_format && (
                          <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-slate-600">
                            {
                              tournament.match_format
                            }
                          </span>
                        )}
                      </div>

                      {/* Information */}

                      <div className="mt-5 space-y-3 text-sm text-slate-500">
                        <div className="flex items-start gap-2">
                          <CalendarDays
                            size={16}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <span>
                            {startDate}

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
                            {
                              tournament.location
                            }
                          </span>
                        </div>

                        {/* Completed tournament participation */}

                        {isCompleted && (
                          <div className="flex items-center gap-2">
                            <Users
                              size={16}
                              className="shrink-0 text-slate-400"
                            />

                            <span>
                              {
                                participantCount
                              }{" "}
                              {participantCount ===
                              1
                                ? "team participated"
                                : "teams participated"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action */}

                      <div
                        className={`mt-5 flex items-center justify-end gap-1 border-t border-gray-100 pt-4 text-sm font-semibold ${
                          isCompleted
                            ? "text-blue-600"
                            : "text-slate-600"
                        }`}
                      >
                        View

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
      )}
    </main>
  );
}
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  Ban,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Clock3,
  MapPin,
  Megaphone,
  Pencil,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { setTournamentStatus } from "@/features/tournaments/services/tournament-status.server";
import { cancelTournament } from "@/features/tournaments/services/cancel-tournament.server";
import { CancelTournamentButton } from "@/features/tournaments/components/cancel-tournament-button";

type ManageTournamentPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function ManageTournamentPage({
  params,
  searchParams,
}: ManageTournamentPageProps) {
  const { id } = await params;
  const { from } = await searchParams;

  const backHref =
    from === "my"
      ? "/tournaments/my"
      : `/tournaments/${id}`;

  const supabase =
    await createClient();

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // TOURNAMENT
  // --------------------------------------------------

  const {
    data: tournament,
    error,
  } = await supabase
    .from("tournaments")
    .select(`
      id,
      created_by,
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
      entry_fee,
      max_teams,
      description,
      status
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "Manage tournament load error:",
      error
    );

    notFound();
  }

  if (!tournament) {
    notFound();
  }

  // Only the tournament owner can access management
  if (
    tournament.created_by !==
    user.id
  ) {
    redirect(
      `/tournaments/${id}`
    );
  }

  // --------------------------------------------------
  // TOURNAMENT REQUESTS
  // --------------------------------------------------

  const {
    data: requests,
    error: requestsError,
  } = await supabase
    .from("tournament_requests")
    .select(`
      id,
      status,
      created_at,

      teams!tournament_requests_requesting_team_id_fkey (
        id,
        name,
        age_group,

        clubs (
          id,
          name,
          badge_url
        )
      )
    `)
    .eq(
      "tournament_id",
      id
    )
    .order("created_at", {
      ascending: false,
    });

  if (requestsError) {
    console.error(
      "Tournament requests load error:",
      requestsError
    );
  }

  const tournamentRequests =
    requests ?? [];

  const acceptedRequests =
    tournamentRequests.filter(
      (request: any) =>
        request.status ===
        "accepted"
    );

  const pendingRequests =
    tournamentRequests.filter(
      (request: any) =>
        request.status ===
        "pending"
    );

  // --------------------------------------------------
  // CAPACITY-AWARE STATUS
  // --------------------------------------------------

  const isFull =
    tournament.max_teams !==
      null &&
    acceptedRequests.length >=
      tournament.max_teams;

  const displayStatus =
  tournament.status === "cancelled"
    ? "cancelled"
    : tournament.status === "completed"
      ? "completed"
      : tournament.status === "closed"
        ? "closed"
        : isFull
          ? "full"
          : "open";
  // --------------------------------------------------
  // DATES
  // --------------------------------------------------

  const formattedStartDate =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      }
    ).format(
      new Date(
        `${tournament.start_date}T00:00:00`
      )
    );

  const formattedEndDate =
    tournament.end_date
      ? new Intl.DateTimeFormat(
          "en-GB",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
          }
        ).format(
          new Date(
            `${tournament.end_date}T00:00:00`
          )
        )
      : null;

      const formattedStartTime =
  tournament.start_time
    ? tournament.start_time.slice(0, 5)
    : null;

const formattedEndTime =
  tournament.end_time
    ? tournament.end_time.slice(0, 5)
    : null;

  // --------------------------------------------------
  // SERVER ACTIONS
  // --------------------------------------------------

  async function toggleTournamentStatus() {
    "use server";

    const nextStatus =
      tournament.status ===
      "open"
        ? "closed"
        : "open";

    await setTournamentStatus(
      tournament.id,
      nextStatus
    );
  }

  async function cancelTournamentAction(
    _formData: FormData
  ) {
    "use server";

    await cancelTournament(
      tournament.id
    );
  }


  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">

      {/* ------------------------------------------------
          HEADER
      ------------------------------------------------ */}

      <header className="relative flex items-center justify-center">
        <Link
  href={backHref}
  className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
>
  <ArrowLeft size={22} />
</Link>

        <h1 className="text-xl font-bold text-slate-950">
          Manage Tournament
        </h1>
      </header>

      {/* ------------------------------------------------
          TOURNAMENT SUMMARY
      ------------------------------------------------ */}

      <section className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <div className="flex items-start gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white">
            <Trophy
              size={24}
              className="text-violet-600"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-950">
              {tournament.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {tournament.age_group ??
                "Open age"}

              {tournament.max_teams
                ? ` · ${tournament.max_teams} teams`
                : ""}
            </p>
          </div>

          {/* Capacity-aware status */}
          <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
  displayStatus === "open"
    ? "bg-green-100 text-green-700"
    : displayStatus === "full"
      ? "bg-amber-100 text-amber-700"
      : displayStatus === "closed"
        ? "bg-slate-100 text-slate-600"
        : displayStatus === "completed"
          ? "bg-blue-100 text-blue-700"
          : displayStatus === "cancelled"
            ? "bg-red-100 text-red-700"
            : "bg-slate-100 text-slate-600"
}`}
          >
            {displayStatus === "open"
  ? "Open"
  : displayStatus === "full"
    ? "Full"
    : displayStatus === "closed"
      ? "Closed"
      : displayStatus === "completed"
        ? "Completed"
        : displayStatus === "cancelled"
          ? "Cancelled"
          : displayStatus}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600">

          <div className="flex items-center gap-2">
            <CalendarDays
              size={16}
              className="text-slate-400"
            />

            <span>
  {formattedStartDate}

  {formattedStartTime
    ? `, ${formattedStartTime}`
    : ""}

  {formattedEndDate
    ? ` – ${formattedEndDate}`
    : ""}

  {formattedEndTime
    ? `, ${formattedEndTime}`
    : ""}
</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin
              size={16}
              className="text-slate-400"
            />

            <span>
              {tournament.location}
            </span>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------
          OVERVIEW
      ------------------------------------------------ */}

      <section className="mt-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Overview
        </h2>

        <div className="mt-3 grid grid-cols-2 gap-3">

          {/* Participating teams */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-violet-700">
              {
                acceptedRequests.length
              }

              {tournament.max_teams
                ? ` / ${tournament.max_teams}`
                : ""}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Teams joined
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-600">
              {
                pendingRequests.length
              }
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Pending requests
            </p>
          </div>

        </div>
      </section>
      

      {/* ------------------------------------------------
          MANAGEMENT
      ------------------------------------------------ */}

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Manage
        </h2>

        <div className="mt-3 space-y-3">

          {/* Tournament Requests */}
          <Link
            href="/tournaments/requests"
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <Clock3
                size={21}
                className="text-amber-600"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">
                Tournament Requests
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {
                  pendingRequests.length
                }{" "}
                pending
              </p>
            </div>

            <ChevronRight
              size={18}
              className="shrink-0 text-slate-300"
            />
          </Link>

          {/* Participating Teams */}
          <Link
            href={`/tournaments/${id}/manage/teams`}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
              <Users
                size={21}
                className="text-[#00B83F]"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">
                Participating Teams
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {
                  acceptedRequests.length
                }
                {tournament.max_teams
                  ? `/${tournament.max_teams}`
                  : ""}{" "}
                teams joined
              </p>
            </div>

            <ChevronRight
              size={18}
              className="shrink-0 text-slate-300"
            />
          </Link>

          {/* Message Participants */}
{tournament.status === "completed" ? (
  <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 opacity-60 shadow-sm">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
      <Megaphone
        size={21}
        className="text-blue-600"
      />
    </div>

    <div className="min-w-0 flex-1">
      <h3 className="font-semibold text-slate-700">
        Message Participants
      </h3>

      <p className="mt-1 text-sm text-slate-400">
        Tournament completed
      </p>
    </div>
  </div>
) : (
  <Link
    href={`/tournaments/${id}/manage/message`}
    className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
  >
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
      <Megaphone
        size={21}
        className="text-blue-600"
      />
    </div>

    <div className="min-w-0 flex-1">
      <h3 className="font-semibold text-slate-900">
        Message Participants
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {acceptedRequests.length === 0
          ? "No participating teams yet"
          : `Send an update to ${
              acceptedRequests.length
            } participating ${
              acceptedRequests.length === 1
                ? "team"
                : "teams"
            }`}
      </p>
    </div>

    <ChevronRight
      size={18}
      className="shrink-0 text-slate-300"
    />
  </Link>
)}

          {/* Edit */}
          {tournament.status !== "cancelled" &&
  tournament.status !== "completed" && (
            <Link
              href={`/tournaments/${id}/manage/edit`}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                <Pencil
                  size={20}
                  className="text-violet-600"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900">
                  Edit Tournament
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Update dates,
                  location or
                  tournament details
                </p>
              </div>

              <ChevronRight
                size={18}
                className="shrink-0 text-slate-300"
              />
            </Link>
          )}

          {/* -------------------------------------------
              CLOSE / REOPEN / FULL
          ------------------------------------------- */}

          {tournament.status !== "cancelled" &&
  tournament.status !== "completed" && (
            <>
              {displayStatus ===
              "full" ? (
                <div className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm opacity-70">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                    <Users
                      size={21}
                      className="text-amber-600"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      Entries Full
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      This tournament
                      has reached its
                      maximum number of
                      teams.
                    </p>
                  </div>

                </div>
              ) : (
                <form
                  action={
                    toggleTournamentStatus
                  }
                >
                  <button
                    type="submit"
                    className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        tournament.status ===
                        "open"
                          ? "bg-amber-50"
                          : "bg-green-50"
                      }`}
                    >
                      {tournament.status ===
                      "open" ? (
                        <Clock3
                          size={
                            21
                          }
                          className="text-amber-600"
                        />
                      ) : (
                        <CircleCheck
                          size={
                            21
                          }
                          className="text-[#00B83F]"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {tournament.status ===
                        "open"
                          ? "Close Entries"
                          : "Reopen Entries"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {tournament.status ===
                        "open"
                          ? "Stop new teams from requesting to join."
                          : "Allow teams to request to join again."}
                      </p>
                    </div>

                    <ChevronRight
                      size={18}
                      className="shrink-0 text-slate-300"
                    />
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </section>

      {/* ------------------------------------------------
          PARTICIPATING TEAMS PREVIEW
      ------------------------------------------------ */}

      <section className="mt-7">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Participating Teams
          </h2>

          {acceptedRequests.length >
            0 && (
            <Link
              href={`/tournaments/${id}/manage/teams`}
              className="text-sm font-semibold text-[#00B83F]"
            >
              View all
            </Link>
          )}
        </div>

        {acceptedRequests.length ===
        0 ? (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">

            <Users
              size={30}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold text-slate-900">
              No participating
              teams yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Teams you accept
              will appear here.
            </p>

          </div>
        ) : (
          <div className="mt-4 space-y-3">

            {acceptedRequests
              .slice(0, 3)
              .map(
                (
                  request: any
                ) => {
                  const team =
                    Array.isArray(
                      request.teams
                    )
                      ? request
                          .teams[0]
                      : request.teams;

                  const club =
                    Array.isArray(
                      team?.clubs
                    )
                      ? team
                          .clubs[0]
                      : team?.clubs;

                  return (
                    <div
                      key={
                        request.id
                      }
                      className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      {club?.badge_url ? (
                        <img
                          src={
                            club.badge_url
                          }
                          alt={`${club.name} badge`}
                          className="h-11 w-11 shrink-0 object-contain"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-slate-50">
                          <Shield
                            size={
                              17
                            }
                            className="text-slate-500"
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 font-semibold leading-5 text-slate-900">
                          {club?.name ??
                            "Club"}
                        </p>

                        <p className="mt-0.5 text-sm text-slate-500">
                          {team?.name ??
                            "Team"}
                        </p>
                      </div>

                      <CircleCheck
                        size={20}
                        className="shrink-0 text-[#00B83F]"
                      />
                    </div>
                  );
                }
              )}

          </div>
        )}
      </section>

      {/* ------------------------------------------------
          DANGER ZONE
      ------------------------------------------------ */}
{tournament.status !== "completed" && (
      <section className="mt-9">

        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-400">
          Danger Zone
        </h2>

        <div className="mt-3 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">

          <div className="flex items-start gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <Ban
                size={21}
                className="text-red-600"
              />
            </div>

            <div className="min-w-0 flex-1">

              <h3 className="font-semibold text-slate-900">
                Cancel Tournament
              </h3>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Cancel this
                tournament for all
                participating teams.
                This should only be
                used if the
                tournament is no
                longer going ahead.
              </p>

            </div>
          </div>

          {tournament.status ===
          "cancelled" ? (
            <div className="mt-4 flex h-11 items-center justify-center rounded-xl bg-red-50 font-semibold text-red-600">
              Tournament Cancelled
            </div>
          ) : (
            <div className="mt-4">
              <CancelTournamentButton
                tournamentName={
                  tournament.name
                }
                cancelAction={
                  cancelTournamentAction
                }
              />
            </div>
          )}

        </div>
      </section>
      )}

    </main>
  );
}
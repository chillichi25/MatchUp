import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";
import { checkTournamentEligibility } from "@/features/tournaments/services/tournament-eligibility.service";
import { WithdrawTournamentButton } from "@/features/tournaments/components/withdraw-tournament-button";

type TournamentDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    from?: string;
  }>;
};

type TournamentParticipant = {
  team_id: string;
  team_name: string;
  age_group: string | null;
  club_id: string;
  club_name: string;
  badge_url: string | null;
};

export default async function TournamentDetailsPage({
  params,
  searchParams,
}: TournamentDetailsPageProps) {
  const { id } = await params;
  const { from } = await searchParams;

  // --------------------------------------------------
  // BACK DESTINATION
  // --------------------------------------------------

  const backHref =
  from === "my-history"
    ? "/tournaments/my?tab=history"
    : from === "participating"
      ? "/tournaments/participating"
      : "/matches?type=tournaments";

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
      "Error loading tournament:",
      error
    );

    notFound();
  }

  if (!tournament) {
    notFound();
  }

  // --------------------------------------------------
  // OWNER
  // --------------------------------------------------

  const isOwner =
    tournament.created_by ===
    user.id;

  // --------------------------------------------------
  // ACTIVE TEAM
  // --------------------------------------------------

  const activeTeam =
    await getActiveTeam();

  const eligibility =
    !isOwner && activeTeam
      ? checkTournamentEligibility({
          teamAgeGroup:
            activeTeam.age_group,

          teamGender:
            activeTeam.gender,

          teamMatchFormat:
            activeTeam.match_format,

          tournamentAgeGroup:
            tournament.age_group,

          tournamentGender:
            tournament.gender,

          tournamentMatchFormat:
            tournament.match_format,
        })
      : null;

  const isEligible =
    eligibility?.eligible ?? false;

  // --------------------------------------------------
  // EXISTING REQUEST
  // --------------------------------------------------

  let existingRequest:
    | {
        id: string;
        status: string;
      }
    | null = null;

  if (
    !isOwner &&
    activeTeam
  ) {
    const {
      data: request,
      error: requestError,
    } = await supabase
      .from("tournament_requests")
      .select(`
        id,
        status
      `)
      .eq(
        "tournament_id",
        tournament.id
      )
      .eq(
        "requesting_team_id",
        activeTeam.id
      )
      .maybeSingle();

    if (requestError) {
      console.error(
        "Tournament request lookup error:",
        requestError
      );
    }

    existingRequest =
      request ?? null;
  }

  // --------------------------------------------------
  // ACCEPTED TEAM COUNT
  // --------------------------------------------------

  const {
    data: acceptedTeamsCount,
    error: acceptedTeamsCountError,
  } = await supabase.rpc(
    "get_tournament_accepted_count",
    {
      p_tournament_id:
        tournament.id,
    }
  );

  if (
    acceptedTeamsCountError
  ) {
    console.error(
      "Accepted teams count error:",
      acceptedTeamsCountError
    );
  }

  const acceptedTeams =
    acceptedTeamsCount ?? 0;

  const maxTeams =
    tournament.max_teams ??
    null;

  const isFull =
    maxTeams !== null &&
    acceptedTeams >= maxTeams;

  const spacesRemaining =
    maxTeams !== null
      ? Math.max(
          maxTeams -
            acceptedTeams,
          0
        )
      : null;

  // --------------------------------------------------
  // PARTICIPATING TEAMS
  // --------------------------------------------------

  let participants:
    TournamentParticipant[] = [];

  if (isOwner) {
    const {
      data: participantData,
      error: participantsError,
    } = await supabase.rpc(
      "get_tournament_participants",
      {
        p_tournament_id:
          tournament.id,
      }
    );

    if (participantsError) {
      console.error(
        "Tournament participants error:",
        participantsError
      );
    } else {
      participants =
        participantData ?? [];
    }
  }

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
        year: "numeric",
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
            year: "numeric",
          }
        ).format(
          new Date(
            `${tournament.end_date}T00:00:00`
          )
        )
      : null;

  const formattedStartTime =
    tournament.start_time
      ? tournament.start_time.slice(
          0,
          5
        )
      : null;

  const formattedEndTime =
    tournament.end_time
      ? tournament.end_time.slice(
          0,
          5
        )
      : null;

      const isOneDayTournament =
  tournament.end_date ===
  tournament.start_date;

  // --------------------------------------------------
  // STATUS HELPERS
  // --------------------------------------------------

  const isCompleted =
    tournament.status ===
    "completed";

  const isCancelled =
    tournament.status ===
    "cancelled";

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
          <ArrowLeft
            size={22}
          />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          Tournament Details
        </h1>
      </header>

      {/* ------------------------------------------------
          TOURNAMENT CARD
      ------------------------------------------------ */}

      <section className="mt-5 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
        {/* Tournament identity */}

        <div className="bg-violet-50 px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white">
              <Trophy
                size={28}
                className="text-violet-600"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold leading-tight text-slate-950">
                    {
                      tournament.name
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {tournament.age_group ??
                      "Open age"}

                    {tournament.max_teams
                      ? ` · ${tournament.max_teams} teams`
                      : ""}
                  </p>
                </div>

                {isCompleted && (
                  <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    Completed
                  </span>
                )}

                {isCancelled && (
                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    Cancelled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}

          <div className="mt-5 flex flex-wrap gap-2">
            {tournament.age_group && (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-violet-700">
                {
                  tournament.age_group
                }
              </span>
            )}

            {tournament.gender && (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                {
                  tournament.gender
                }
              </span>
            )}

            {tournament.level && (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                {
                  tournament.level
                }
              </span>
            )}

            {tournament.match_format && (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                {
                  tournament.match_format
                }
              </span>
            )}
          </div>
        </div>

        {/* ------------------------------------------------
            MAIN INFORMATION
        ------------------------------------------------ */}

        <div className="p-6">
          <div className="space-y-4">
            {/* Dates */}

<div className="flex items-start gap-3">
  <CalendarDays
    size={18}
    className="mt-0.5 shrink-0 text-slate-500"
  />

  <div>
    {isOneDayTournament ? (
      <>
        <p className="text-sm font-medium text-slate-900">
          {formattedStartDate}
        </p>

        {(formattedStartTime ||
          formattedEndTime) && (
          <p className="mt-0.5 text-sm text-slate-500">
            {formattedStartTime}
            {formattedStartTime &&
            formattedEndTime
              ? " – "
              : ""}
            {formattedEndTime}
          </p>
        )}
      </>
    ) : (
      <>
        <p className="text-sm font-medium text-slate-900">
          {formattedStartDate}
          {formattedStartTime
            ? `, ${formattedStartTime}`
            : ""}
        </p>

        {formattedEndDate && (
          <p className="mt-0.5 text-sm text-slate-500">
            to {formattedEndDate}
            {formattedEndTime
              ? `, ${formattedEndTime}`
              : ""}
          </p>
        )}
      </>
    )}
  </div>
</div>

            {/* Location */}

            <div className="flex items-center gap-3">
              <MapPin
                size={18}
                className="shrink-0 text-slate-500"
              />

              <span className="text-sm text-slate-700">
                {
                  tournament.location
                }
              </span>
            </div>

            {/* Capacity / historical participation */}

            {maxTeams !== null && (
              <div className="flex items-center gap-3">
                <Users
                  size={18}
                  className="shrink-0 text-slate-500"
                />

                <div>
                  {isCompleted ? (
                    <>
                      <p className="text-sm font-medium text-slate-700">
                        {
                          acceptedTeams
                        }{" "}
                        {acceptedTeams ===
                        1
                          ? "team participated"
                          : "teams participated"}
                      </p>

                      <p className="mt-0.5 text-xs font-medium text-blue-600">
                        Tournament
                        completed
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-700">
                        {
                          acceptedTeams
                        }
                        /
                        {
                          maxTeams
                        }{" "}
                        teams
                      </p>

                      <p
                        className={`mt-0.5 text-xs font-medium ${
                          isCancelled
                            ? "text-red-600"
                            : isFull
                              ? "text-amber-600"
                              : "text-slate-500"
                        }`}
                      >
                        {isCancelled
                          ? "Tournament cancelled"
                          : isFull
                            ? "Tournament full"
                            : `${spacesRemaining} ${
                                spacesRemaining ===
                                1
                                  ? "space"
                                  : "spaces"
                              } remaining`}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Entry fee */}

            {tournament.entry_fee !==
              null && (
              <div className="flex items-center gap-3">
                <WalletCards
                  size={18}
                  className="shrink-0 text-slate-500"
                />

                <span className="text-sm text-slate-700">
                  £
                  {Number(
                    tournament.entry_fee
                  ).toFixed(
                    0
                  )}{" "}
                  entry fee
                </span>
              </div>
            )}
          </div>

          {/* ------------------------------------------------
              ABOUT
          ------------------------------------------------ */}

          {tournament.description && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-slate-900">
                About this
                tournament
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {
                  tournament.description
                }
              </p>
            </div>
          )}

          {/* ------------------------------------------------
              PARTICIPATING TEAMS
          ------------------------------------------------ */}

          {isOwner && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">
                  {isCompleted
                    ? "Teams that participated"
                    : "Participating Teams"}
                </h3>

                <span className="shrink-0 text-sm font-semibold text-slate-500">
                  {isCompleted
                    ? `${
                        participants.length
                      } ${
                        participants.length ===
                        1
                          ? "team"
                          : "teams"
                      }`
                    : `${
                        participants.length
                      }${
                        maxTeams !==
                        null
                          ? `/${maxTeams}`
                          : ""
                      }`}
                </span>
              </div>

              {participants.length >
              0 ? (
                <div className="mt-4 space-y-3">
                  {participants.map(
                    (
                      participant
                    ) => (
                      <div
                        key={
                          participant.team_id
                        }
                        className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-slate-50 p-3"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                          {participant.badge_url ? (
                            <img
                              src={
                                participant.badge_url
                              }
                              alt={`${participant.club_name} badge`}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <Trophy
                              size={
                                20
                              }
                              className="text-slate-400"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-5 text-slate-900">
  {participant.club_name}
</p>

                          <p className="mt-0.5 text-sm text-slate-500">
                            {
                              participant.team_name
                            }

                            {participant.age_group
                              ? ` · ${participant.age_group}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-gray-100 bg-slate-50 px-4 py-6 text-center">
                  <Users
                    size={24}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    {isCompleted
                      ? "No participating teams recorded."
                      : "No teams have been accepted yet."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------
              ACTIONS
          ------------------------------------------------ */}

          <div className="mt-6 border-t border-gray-100 pt-6">
            {isCompleted ? (
              <div className="space-y-2">
                <div className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-100 font-semibold text-blue-700">
                  Tournament
                  Completed
                </div>

                <p className="text-center text-xs text-slate-400">
                  This tournament is
                  now read-only
                  history.
                </p>
              </div>
            ) : isCancelled ? (
              <div className="flex h-12 w-full items-center justify-center rounded-xl bg-red-100 font-semibold text-red-700">
                Tournament
                Cancelled
              </div>
            ) : isOwner ? (
              <Link
                href={`/tournaments/${tournament.id}/manage`}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] font-semibold text-white"
              >
                Manage Tournament
              </Link>
            ) : existingRequest?.status ===
              "pending" ? (
              <div className="flex h-12 w-full items-center justify-center rounded-xl bg-amber-100 font-semibold text-amber-700">
                Request Pending
              </div>
            ) : existingRequest?.status ===
              "accepted" ? (
              <WithdrawTournamentButton
                requestId={
                  existingRequest.id
                }
                tournamentName={
                  tournament.name
                }
              />
            ) : existingRequest?.status ===
              "declined" ? (
              <div className="flex h-12 w-full items-center justify-center rounded-xl bg-red-100 font-semibold text-red-700">
                Request Declined
              </div>
            ) : tournament.status ===
              "closed" ? (
              <div className="flex h-12 w-full items-center justify-center rounded-xl bg-gray-100 font-semibold text-slate-500">
                Entries Closed
              </div>
            ) : isFull ? (
              <div className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-500">
                Tournament Full
              </div>
            ) : !activeTeam ? (
              <div className="rounded-xl bg-amber-50 px-4 py-4">
                <p className="text-sm font-semibold text-amber-800">
                  No active team
                </p>

                <p className="mt-1 text-sm leading-5 text-amber-700">
                  Select or create a
                  team before
                  requesting to join
                  this tournament.
                </p>
              </div>
            ) : !isEligible ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="font-semibold text-amber-800">
                  Not eligible
                </p>

                <div className="mt-2 space-y-1">
                  {eligibility?.reasons.map(
                    (
                      reason
                    ) => (
                      <p
                        key={
                          reason
                        }
                        className="text-sm leading-5 text-amber-700"
                      >
                        {
                          reason
                        }
                      </p>
                    )
                  )}
                </div>
              </div>
            ) : (
              <Link
                href={`/tournaments/${tournament.id}/request`}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] font-semibold text-white"
              >
                Request to Join
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
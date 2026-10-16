import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  MapPin,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";

type PendingMatchResult = {
  match_id: string;
  result_request_id: string;
  submitted_by_team_id: string;
  home_score: number;
  away_score: number;
};

export default async function UpcomingMatchesPage() {
  const supabase = await createClient();

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
  // ACTIVE TEAM
  // --------------------------------------------------

  const activeTeam = await getActiveTeam();

  if (!activeTeam) {
    redirect("/clubs");
  }

  // --------------------------------------------------
  // UPCOMING MATCHES
  // --------------------------------------------------

  const {
    data: matches,
    error,
  } = await supabase
    .from("matches")
    .select(`
      id,
      status,
      match_date,
      kick_off_time,
      location,

      home:home_team_id (
        id,
        name,
        clubs (
          name
        )
      ),

      away:away_team_id (
        id,
        name,
        clubs (
          name
        )
      )
    `)
    .eq("status", "scheduled")
    .or(
      `home_team_id.eq.${activeTeam.id},away_team_id.eq.${activeTeam.id}`
    )
    .order("match_date", {
      ascending: true,
    })
    .order("kick_off_time", {
      ascending: true,
    });

  if (error) {
    console.error(
      "UPCOMING MATCHES ERROR:",
      error
    );

    throw error;
  }

  const upcomingMatches = matches ?? [];

  // --------------------------------------------------
// PENDING RESULTS
// --------------------------------------------------

const {
  data: pendingResults,
  error: pendingResultsError,
} = await supabase.rpc(
  "get_team_pending_match_results",
  {
    p_team_id: activeTeam.id,
  }
);

if (pendingResultsError) {
  console.error(
    "UPCOMING PENDING RESULTS ERROR:",
    pendingResultsError
  );

  throw pendingResultsError;
}

const pendingResultByMatch =
  new Map<string, PendingMatchResult>(
    (
      (pendingResults ?? []) as PendingMatchResult[]
    ).map((result) => [
      result.match_id,
      result,
    ])
  );

  // --------------------------------------------------
// ORDER MATCHES BY ACTION PRIORITY
// --------------------------------------------------

function getMatchPriority(match: any) {
  const pendingResult =
    pendingResultByMatch.get(match.id);

  const opponentSubmittedResult =
    Boolean(
      pendingResult &&
        pendingResult.submitted_by_team_id !==
          activeTeam.id
    );

  const myTeamSubmittedResult =
    pendingResult?.submitted_by_team_id ===
    activeTeam.id;

  const matchDateTime = new Date(
    `${match.match_date}T${match.kick_off_time}`
  );

  const isPast =
    matchDateTime.getTime() <
    Date.now();

  // 1 — Coach needs to confirm/dispute
  if (opponentSubmittedResult) {
    return 1;
  }

  // 2 — Coach needs to add a result
  if (isPast && !pendingResult) {
    return 2;
  }

  // 3 — Waiting for opponent
  if (myTeamSubmittedResult) {
    return 3;
  }

  // 4 — Future scheduled match
  return 4;
}

const orderedMatches = [
  ...upcomingMatches,
].sort((a: any, b: any) => {
  const priorityA =
    getMatchPriority(a);

  const priorityB =
    getMatchPriority(b);

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  // Within the same group:
  // nearest/recent fixture first

  const dateA = new Date(
    `${a.match_date}T${a.kick_off_time}`
  ).getTime();

  const dateB = new Date(
    `${b.match_date}T${b.kick_off_time}`
  ).getTime();

  // For overdue matches, show the most recent first.
  if (priorityA === 2) {
    return dateB - dateA;
  }

  // For everything else, earliest first.
  return dateA - dateB;
});

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}

      <header className="flex items-center">
        <Link
          href="/dashboard"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="flex-1 pr-11 text-center text-lg font-bold">
          Upcoming Matches
        </h1>
      </header>

      {/* Intro */}

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-950">
          Your Schedule
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Confirmed matches for {activeTeam.name}.
        </p>
      </section>

      {/* Empty */}

      {/* Empty state */}

{upcomingMatches.length === 0 && (
  <section className="mt-7 rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center shadow-sm">
    {/* Icon */}
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
      <CalendarDays
        size={24}
        strokeWidth={1.9}
        className="text-[#00B83F]"
      />
    </div>

    {/* Title */}
    <h3 className="mt-3 text-[15px] font-bold text-slate-950">
      No upcoming matches
    </h3>

    {/* Description */}
    <p className="mx-auto mt-1.5 max-w-[250px] text-[12px] leading-[18px] text-slate-500">
      You don&apos;t have any matches scheduled yet.
    </p>

    {/* Action */}
    <Link
      href="/matches?type=friendlies"
      className="mx-auto mt-5 flex h-10 w-fit min-w-[150px] items-center justify-center rounded-xl bg-[#00B83F] px-5 text-[12px] font-bold text-white shadow-sm transition active:scale-[0.98]"
    >
      Find a Match
    </Link>
  </section>
)}

      {/* Matches */}

      <section className="mt-7 space-y-4">
        {orderedMatches.map((match: any) => {
          const home = Array.isArray(match.home)
            ? match.home[0]
            : match.home;

          const away = Array.isArray(match.away)
            ? match.away[0]
            : match.away;

          if (!home || !away) {
            return null;
          }

          const activeTeamIsHome =
            home.id === activeTeam.id;

          const opponent = activeTeamIsHome
            ? away
            : home;

          const clubRelation =
            opponent.clubs;

          const opponentClub = Array.isArray(
            clubRelation
          )
            ? clubRelation[0]
            : clubRelation;

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

            const matchDateTime =
  new Date(
    `${match.match_date}T${match.kick_off_time}`
  );

const isPast =
  matchDateTime.getTime() <
  Date.now();

  const pendingResult =
  pendingResultByMatch.get(
    match.id
  );

const myTeamSubmittedResult =
  pendingResult?.submitted_by_team_id ===
  activeTeam.id;

const opponentSubmittedResult =
  Boolean(
    pendingResult &&
      pendingResult.submitted_by_team_id !==
        activeTeam.id
  );

          return (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              className="block rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#00B83F]"
            >
              {/* Header */}

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-950">
                    {opponentClub?.name ??
                      "Opponent"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {opponent.name}
                  </p>
                </div>

                <span
  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
    pendingResult
      ? opponentSubmittedResult
        ? "bg-blue-100 text-blue-700"
        : "bg-amber-100 text-amber-700"
      : isPast
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700"
  }`}
>
  {pendingResult
    ? opponentSubmittedResult
      ? "Result to confirm"
      : "Awaiting confirmation"
    : isPast
      ? "Result needed"
      : "Scheduled"}
</span>
              </div>

              {/* Details */}

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={17}
                    className="text-slate-400"
                  />

                  <span>
                    {formattedDate}

                    {formattedTime
                      ? ` · ${formattedTime}`
                      : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin
                    size={17}
                    className="text-slate-400"
                  />

                  <span>
                    {match.location ||
                      "Location TBC"}
                  </span>
                </div>
              </div>

              {/* Footer */}

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span
  className={`text-sm font-semibold ${
    opponentSubmittedResult
      ? "text-blue-600"
      : pendingResult || isPast
        ? "text-amber-600"
        : "text-[#00B83F]"
  }`}
>
  {opponentSubmittedResult
    ? "Review Result"
    : myTeamSubmittedResult
      ? "View Result"
      : isPast
        ? "Add Result"
        : "View Match"}
</span>

                <ChevronRight
                  size={18}
                  className="text-slate-300"
                />
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
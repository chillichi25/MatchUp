import Link from "next/link";

import { getDashboardData } from "@/features/dashboard/services/dashboard.service";

import { ResultCard } from "@/components/ui/result-card";

import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { DashboardActions } from "@/features/dashboard/components/dashboard-actions";
import { NextMatchCard } from "@/features/dashboard/components/next-match-card";
import { NextTournamentCard } from "@/features/dashboard/components/next-tournament-card";
import { ActionCentre } from "@/features/dashboard/components/action-centre";
import { LookingForMatch } from "@/features/dashboard/components/looking-for-match";
import { Upcoming } from "@/features/dashboard/components/upcoming";
import { TeamPerformance } from "@/features/dashboard/components/team-performance";

import { GiSoccerBall } from "react-icons/gi";

export default async function DashboardPage() {
  const dashboard =
    await getDashboardData();

  const {
    coachName,
    clubName,
    badgeUrl,
    teamName,

    activeTeamId,
    teams,

    nextMatch,
    nextTournament,

    upcomingMatches,
    upcomingTournaments,

    friendly,
    tournament,

    unreadNotifications,

    stats,
    statistics,
    recentResults,
  } = dashboard;

  // --------------------------------------------------
  // WORK OUT WHAT IS ACTUALLY UP NEXT
  // --------------------------------------------------

  const nextMatchDateTime =
    nextMatch
      ? new Date(
          `${nextMatch.matchDate}T${
            nextMatch.kickOff ??
            "00:00:00"
          }`
        ).getTime()
      : null;

  const nextTournamentDateTime =
    nextTournament
      ? new Date(
          `${nextTournament.startDate}T${
            nextTournament.startTime ??
            "00:00:00"
          }`
        ).getTime()
      : null;

  let nextEvent:
    | "match"
    | "tournament"
    | null = null;

  if (
    nextMatchDateTime !== null &&
    nextTournamentDateTime !== null
  ) {
    nextEvent =
      nextMatchDateTime <=
      nextTournamentDateTime
        ? "match"
        : "tournament";
  } else if (
    nextMatchDateTime !== null
  ) {
    nextEvent = "match";
  } else if (
    nextTournamentDateTime !== null
  ) {
    nextEvent = "tournament";
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* ------------------------------------------------
          HEADER
      ------------------------------------------------ */}

      <DashboardHeader
        coachName={coachName}
        clubName={clubName}
        teamName={teamName}
        badgeUrl={badgeUrl}
        unreadNotifications={
          unreadNotifications
        }
        activeTeamId={
          activeTeamId
        }
        teams={teams}
      />

      {/* ------------------------------------------------
          DASHBOARD ACTIONS
      ------------------------------------------------ */}

      <DashboardActions />

      {/* ------------------------------------------------
    UP NEXT
------------------------------------------------ */}

<section className="mt-6">
  <div className="flex items-center justify-between">
    <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
      Up Next
    </h2>

    {nextEvent && (
      <Link
        href="/matches"
        className="flex items-center gap-1 text-[13px] font-semibold text-[#00B83F]"
      >
        View all

        <span aria-hidden="true">
          ›
        </span>
      </Link>
    )}
  </div>

  {/* Next Match */}

  {nextEvent === "match" &&
    nextMatch && (
      <NextMatchCard
        matchId={nextMatch.id}
        conversationId={
          nextMatch.conversationId
        }
        matchDate={nextMatch.matchDate}
        kickOff={nextMatch.kickOff}
        location={nextMatch.location}
        homeTeam={nextMatch.homeTeam}
        awayTeam={nextMatch.awayTeam}
      />
    )}

  {/* Next Tournament */}

  {nextEvent === "tournament" &&
    nextTournament && (
      <NextTournamentCard
        tournamentId={
          nextTournament.id
        }
        name={nextTournament.name}
        ageGroup={
          nextTournament.ageGroup
        }
        startDate={
          nextTournament.startDate
        }
        startTime={
          nextTournament.startTime
        }
        endDate={
          nextTournament.endDate
        }
        endTime={
          nextTournament.endTime
        }
        location={
          nextTournament.location
        }
      />
    )}

  {/* Nothing Scheduled */}

{!nextEvent && (
  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
      <GiSoccerBall
        size={20}
        className="text-[#00B83F]"
      />
    </div>

    <div className="min-w-0 flex-1">
      <h3 className="text-[13px] font-bold text-slate-950">
        Nothing scheduled yet
      </h3>

      <p className="mt-0.5 text-[11px] leading-[16px] text-slate-500">
        Your next match or tournament will appear here.
      </p>
    </div>
  </div>
)}
</section>

      {/* ------------------------------------------------
          REQUESTS & UPDATES
      ------------------------------------------------ */}

      <ActionCentre
  pendingRequests={
    stats.pendingRequests
  }
  awaitingResponses={
    stats.awaitingResponses
  }
/>

      {/* ------------------------------------------------
          RECOMMENDED FOR YOU
      ------------------------------------------------ */}

      <LookingForMatch
        friendly={friendly}
        tournament={tournament}
      />

      {/* ------------------------------------------------
          UPCOMING
      ------------------------------------------------ */}

      <Upcoming
        matches={
          upcomingMatches
        }
        tournaments={
          upcomingTournaments
        }
        nextEventType={
          nextEvent
        }
        nextEventId={
          nextEvent === "match"
            ? nextMatch?.id ??
              null
            : nextEvent ===
                "tournament"
              ? nextTournament?.id ??
                null
              : null
        }
      />

      {/* ------------------------------------------------
    TEAM PERFORMANCE
------------------------------------------------ */}

{(statistics?.played ?? 0) > 0 && (
  <TeamPerformance
    played={
      statistics?.played ?? 0
    }
    wins={
      statistics?.wins ?? 0
    }
    draws={
      statistics?.draws ?? 0
    }
    losses={
      statistics?.losses ?? 0
    }
  />
)}

      {/* ------------------------------------------------
    RECENT RESULTS
------------------------------------------------ */}

{recentResults.length > 0 && (
  <section className="mt-8">
    <div className="flex items-center justify-between">
      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
        Recent Results
      </h2>

      <Link
        href="/matches/history"
        className="flex items-center gap-1 text-[13px] font-semibold text-[#00B83F]"
      >
        View all

        <span aria-hidden="true">
          ›
        </span>
      </Link>
    </div>

    <div className="mt-3 space-y-3">
      {recentResults
        .slice(0, 3)
        .map((match) => (
          <ResultCard
            key={match.id}
            matchId={match.id}
            badgeUrl={
              match.opponent.badgeUrl
            }
            clubName={
              match.opponent.clubName
            }
            teamName={
              match.opponent.teamName
            }
            myScore={match.myScore}
            opponentScore={
              match.opponentScore
            }
            result={match.result}
            matchDate={match.matchDate}
          />
        ))}
    </div>
  </section>
)}
    </main>
  );
}
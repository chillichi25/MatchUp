import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Shield,
} from "lucide-react";

import { ResultCard } from "@/components/ui/result-card";
import { getMatchHistory } from "@/features/matches/services/get-match-history";

export default async function MatchHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
  }>;
}) {
  const params = await searchParams;

  const filter = params.filter ?? "all";

  const history = await getMatchHistory();

  const filteredHistory = history.filter(
    (match) => {
      if (filter === "all") {
        return true;
      }

      if (filter === "cancelled") {
        return match.status === "cancelled";
      }

      return (
        match.status === "completed" &&
        match.result === filter
      );
    }
  );

  const filters = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "win",
      label: "Won",
    },
    {
      value: "draw",
      label: "Drawn",
    },
    {
      value: "loss",
      label: "Lost",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}

      <header className="flex items-center">
        <Link
          href="/profile"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="flex-1 pr-11 text-center text-lg font-bold">
          Match History
        </h1>
      </header>

      {/* Intro */}

      <section className="mt-8">
        <h2 className="text-3xl font-bold text-slate-950">
          Match History
        </h2>

        <p className="mt-2 text-slate-500">
          View completed and cancelled matches.
        </p>
      </section>

      {/* Filters */}

      <section className="mt-7">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Link
              key={item.value}
              href={`/matches/history?filter=${item.value}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                filter === item.value
                  ? "bg-[#00B83F] text-white"
                  : "border border-gray-200 bg-white text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {/* History */}

      <section className="mt-8 space-y-4">
        {filteredHistory.length === 0 ? (
  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center shadow-sm">
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
      {filter === "all"
        ? "No match history yet"
        : `No ${filter === "win"
            ? "won"
            : filter === "draw"
              ? "drawn"
              : filter === "loss"
                ? "lost"
                : "cancelled"
          } matches`}
    </h3>

    {/* Description */}
    <p className="mx-auto mt-1.5 max-w-[260px] text-[12px] leading-[18px] text-slate-500">
      {filter === "all"
        ? "Completed and cancelled matches will appear here."
        : "You don't have any matches in this category yet."}
    </p>

    {/* Action */}
    {filter === "all" ? (
      <Link
        href="/matches?type=friendlies"
        className="mx-auto mt-5 flex h-10 w-fit min-w-[150px] items-center justify-center rounded-xl bg-[#00B83F] px-5 text-[12px] font-bold text-white shadow-sm transition active:scale-[0.98]"
      >
        Find a Match
      </Link>
    ) : (
      <Link
        href="/matches/history?filter=all"
        className="mx-auto mt-5 flex h-10 w-fit min-w-[150px] items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-[12px] font-bold text-slate-700 transition active:scale-[0.98]"
      >
        View All
      </Link>
    )}
  </div>
        ) : (
          filteredHistory.map((match) => {
            if (
              match.status === "completed" &&
              match.result !== null &&
              match.myScore !== null &&
              match.opponentScore !== null
            ) {
              return (
                <ResultCard
                  key={match.id}
                  matchId={match.id}
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
              );
            }

            const formattedDate =
              new Date(
                `${match.matchDate}T00:00:00`
              ).toLocaleDateString(
                "en-GB",
                {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }
              );

            return (
              <Link
                key={match.id}
                href={`/matches/${match.id}?from=history`}
                className="block rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                      <Shield
                        size={22}
                        className="text-slate-400"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold leading-5 text-slate-950">
                        {
                          match.opponent
                            .clubName
                        }
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {
                          match.opponent
                            .teamName
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      Cancelled
                    </span>

                    <ChevronRight
                      size={19}
                      className="text-slate-400"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays
                    size={16}
                    className="text-[#00B83F]"
                  />

                  <span>
                    {formattedDate}

                    {match.kickOffTime
                      ? ` · ${match.kickOffTime}`
                      : ""}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {match.cancelledByMyTeam
                    ? "Cancelled by your team"
                    : "Cancelled by opponent"}
                </p>
              </Link>
            );
          })
        )}
      </section>
    </main>
  );
}
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  MapPin,
  Trophy,
} from "lucide-react";

import {
  getRecommendedTournaments,
} from "@/features/tournaments/services/get-recommended-tournaments";

export default async function RecommendedTournamentsPage() {
  const tournaments =
    await getRecommendedTournaments();

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      <section>
        <Link
          href="/dashboard"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700"
        >
          <ChevronLeft size={20} />
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Tournaments for your team
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ranked by how well each tournament matches your active team.
          </p>
        </div>
      </section>

      {tournaments.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
            <Trophy
              size={24}
              className="text-purple-600"
            />
          </div>

          <h2 className="mt-4 font-bold text-slate-900">
            No tournaments available
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            There are currently no open tournaments that match your search.
          </p>

          <Link
            href="/tournaments/create"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#00B83F] px-5 text-sm font-semibold text-white"
          >
            Create tournament
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {tournaments.map(
            (tournament) => (
              <article
                key={tournament.id}
                className="rounded-3xl border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {tournament.isRecommended && (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                      🏆 Recommended
                    </span>
                  )}

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {tournament.score}/100 match
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50">
                    <Trophy
                      size={22}
                      className="text-purple-600"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-950">
                      {tournament.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {tournament.ageGroup ??
                        "Age group TBC"}

                      {tournament.maxTeams
                        ? ` · ${tournament.maxTeams} teams`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-2 text-sm text-slate-500">
                  <CalendarDays
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {tournament.startDate}

                    {tournament.endDate &&
                      tournament.endDate !==
                        tournament.startDate &&
                      ` – ${tournament.endDate}`}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {tournament.location ??
                      "Location TBC"}

                    {tournament.distance !==
                      null && (
                      <>
                        {" · "}
                        {tournament.distance.toFixed(
                          1
                        )}{" "}
                        miles away
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {tournament.level && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {tournament.level}
                    </span>
                  )}

                  {tournament.gender && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {tournament.gender}
                    </span>
                  )}

                  {tournament.matchFormat && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {tournament.matchFormat}
                    </span>
                  )}

                  {tournament.entryFee !==
                    null && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-slate-600">
                      £{tournament.entryFee}
                    </span>
                  )}
                </div>

                <Link
                  href={`/tournaments/${tournament.id}`}
                  className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] text-sm font-semibold text-white transition hover:bg-[#009F37]"
                >
                  View Tournament
                </Link>
              </article>
            )
          )}
        </div>
      )}
    </main>
  );
}
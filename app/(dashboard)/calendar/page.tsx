import Link from "next/link";
import { getCalendarMatches } from "@/features/matches/services/get-calendar-matches";

export default async function CalendarPage() {
  const matches = await getCalendarMatches();

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">

      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-black"
      >
        ← Back
      </Link>

      <h1 className="text-3xl font-bold">
        Team Calendar
      </h1>

      <p className="mt-2 text-slate-500">
        Upcoming fixtures and results.
      </p>

      <section className="mt-8 space-y-4">

        {matches.length === 0 ? (

          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-slate-500">
            No matches found.
          </div>

        ) : (

          matches.map((match) => (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">

                <span className="text-2xl">
                  ⚽
                </span>

                <span className="text-sm text-slate-500">
                  {new Date(match.matchDate).toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    }
                  )}
                </span>

              </div>

              <h2 className="mt-3 font-bold">
                {match.opponent.clubName}
              </h2>

              <p className="text-slate-500">
                {match.opponent.teamName}
              </p>

            </Link>
          ))

        )}

      </section>

    </main>
  );
}
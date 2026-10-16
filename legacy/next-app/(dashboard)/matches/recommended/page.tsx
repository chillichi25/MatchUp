import Link from "next/link";

import {
  CalendarDays,
  ChevronLeft,
  MapPin,
  Trophy,
} from "lucide-react";

import { ClubAvatar } from "@/components/ui/club-avatar";

import {
  getRecommendedFriendlies,
} from "@/features/matches/services/get-recommended-friendlies";

import {
  getRecommendedTournaments,
} from "@/features/tournaments/services/get-recommended-tournaments";

type RecommendedMatchesPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function RecommendedMatchesPage({
  searchParams,
}: RecommendedMatchesPageProps) {
  const params = await searchParams;

  const type =
    params.type === "tournaments"
      ? "tournaments"
      : "friendlies";

  // --------------------------------------------------
  // LOAD ONLY THE CURRENT TAB
  // --------------------------------------------------

  const friendlies =
    type === "friendlies"
      ? await getRecommendedFriendlies()
      : [];

  const tournaments =
    type === "tournaments"
      ? await getRecommendedTournaments()
      : [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">

      {/* ------------------------------------------------
          HEADER
      ------------------------------------------------ */}

      <section>
        <Link
          href="/dashboard"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700"
        >
          <ChevronLeft size={20} />
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
  Opportunities for your team
</h1>

<p className="mt-2 text-sm leading-6 text-slate-500">
  Friendlies and tournaments ranked for your active team.
</p>
        </div>
      </section>

      {/* ------------------------------------------------
          FRIENDLIES / TOURNAMENTS TABS
      ------------------------------------------------ */}

      <div className="mt-6 flex rounded-2xl border border-gray-200 bg-white p-1">

        <Link
          href="/matches/recommended?type=friendlies"
          className={`flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
            type === "friendlies"
              ? "bg-[#00B83F] text-white"
              : "text-slate-600"
          }`}
        >
          Friendlies
        </Link>

        <Link
          href="/matches/recommended?type=tournaments"
          className={`flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${
            type === "tournaments"
              ? "bg-[#00B83F] text-white"
              : "text-slate-600"
          }`}
        >
          Tournaments
        </Link>

      </div>

      {/* =================================================
          FRIENDLIES
      ================================================= */}

      {type === "friendlies" && (
        <>
          {friendlies.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 text-center">

              <h2 className="font-bold text-slate-900">
                No matches available
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                There are currently no open friendly opportunities for your
                team.
              </p>

              <Link
                href="/matches/create"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#00B83F] px-5 text-sm font-semibold text-white"
              >
                Create a match
              </Link>

            </div>
          ) : (
            <div className="mt-8 space-y-4">

              {friendlies.map((friendly) => (

                <article
                  key={friendly.id}
                  className="rounded-3xl border border-gray-200 bg-white p-5"
                >

                  {/* Recommendation */}

                  <div className="flex flex-wrap items-center gap-2">

                    {friendly.isBestMatch && (
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-[#00B83F]">
                        ⭐ Best Match
                      </span>
                    )}

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {friendly.score}/100 match
                    </span>

                  </div>

                  {/* Club */}

                  <div className="mt-4 flex items-center gap-3">

                    <ClubAvatar
                      clubName={friendly.clubName}
                      badgeUrl={friendly.badgeUrl}
                      size="sm"
                    />

                    <div className="min-w-0">

                      <h2 className="truncate font-bold text-slate-950">
                        {friendly.clubName}
                      </h2>

                      <p className="mt-0.5 text-sm text-slate-500">
                        {friendly.teamName}

                        {friendly.ageGroup
                          ? ` · ${friendly.ageGroup}`
                          : ""}
                      </p>

                    </div>

                  </div>

                  {/* Date / Kick-off */}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-gray-50 p-3">

                      <p className="text-xs text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {friendly.matchDate}
                      </p>

                    </div>

                    <div className="rounded-2xl bg-gray-50 p-3">

                      <p className="text-xs text-slate-400">
                        Kick-off
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {friendly.kickOff ?? "TBC"}
                      </p>

                    </div>

                  </div>

                  {/* Location */}

                  <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">

                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {friendly.location ?? "Location TBC"}

                      {friendly.distance !== null && (
                        <>
                          {" · "}
                          {friendly.distance.toFixed(1)} miles away
                        </>
                      )}
                    </span>

                  </div>

                  {/* Matching factors */}

                  {friendly.matchReasons?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">

                      {friendly.matchReasons
                        .filter(
                          (reason) =>
                            reason !== "Nearby" &&
                            reason !== "Same age"
                        )
                        .map((reason) => {
                          let label = reason;

                          if (reason === "Same level") {
                            label =
                              friendly.level ??
                              "Same level";
                          }

                          if (reason === "Same category") {
                            label =
                              friendly.gender ??
                              "Same category";
                          }

                          return (
                            <span
                              key={reason}
                              className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-slate-700"
                            >
                              <span className="font-bold text-[#00B83F]">
                                ✓
                              </span>

                              {label}
                            </span>
                          );
                        })}

                    </div>
                  )}

                  {/* Action */}

                  <Link
                    href={`/friendlies/${friendly.id}`}
                    className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] text-sm font-semibold text-white transition hover:bg-[#009F37]"
                  >
                    View Match
                  </Link>

                </article>

              ))}

            </div>
          )}
        </>
      )}

      {/* =================================================
          TOURNAMENTS
      ================================================= */}

      {type === "tournaments" && (
        <>
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
                There are currently no open tournaments available for your
                team.
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

              {tournaments.map((tournament) => (

                <article
                  key={tournament.id}
                  className="rounded-3xl border border-gray-200 bg-white p-5"
                >

                  {/* Recommendation */}

                  <div className="flex flex-wrap items-center gap-2">

                    {tournament.isRecommended && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-orange-600">
                        🏆 Recommended
                      </span>
                    )}

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {tournament.score}/100 match
                    </span>

                  </div>

                  {/* Tournament */}

                  <div className="mt-4 flex items-center gap-3">

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
                        {tournament.ageGroup ?? "Age group TBC"}

                        {tournament.maxTeams
                          ? ` · ${tournament.maxTeams} teams`
                          : ""}
                      </p>

                    </div>

                  </div>

                  {/* Dates */}

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

                  {/* Location */}

                  <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">

                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {tournament.location ?? "Location TBC"}

                      {tournament.distance !== null && (
                        <>
                          {" · "}
                          {tournament.distance.toFixed(1)} miles away
                        </>
                      )}
                    </span>

                  </div>

                  {/* Tournament characteristics */}

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

                    {tournament.entryFee !== null && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-slate-600">
                        £{tournament.entryFee}
                      </span>
                    )}

                  </div>

                  {/* Action */}

                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] text-sm font-semibold text-white transition hover:bg-[#009F37]"
                  >
                    View Tournament
                  </Link>

                </article>

              ))}

            </div>
          )}
        </>
      )}

    </main>
  );
}
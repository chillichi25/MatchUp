import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  MapPin,
  Shield,
} from "lucide-react";

import {
  GiSoccerBall,
  GiTrophyCup,
} from "react-icons/gi";

type LookingForMatchProps = {
  friendly: {
    id: string;
    clubName: string;
    badgeUrl: string | null;
    lookingFor: "home" | "away";
    matchDate: string;
    kickOff: string;
    location: string;
    distance: number;
  } | null;

  tournament: {
    id: string;
    name: string;
    badgeUrl: string | null;
    ageGroup: string;
    teams: number;
    date: string;
    location: string;
    distance: number;
  } | null;
};

export function LookingForMatch({
  friendly,
  tournament,
}: LookingForMatchProps) {
  const hasRecommendations =
    Boolean(friendly || tournament);

  function getDateParts(
    dateString: string
  ) {
    const date = new Date(
      `${dateString}T00:00:00`
    );

    return {
      weekday: date
        .toLocaleDateString("en-GB", {
          weekday: "short",
        })
        .toUpperCase(),

      day: date.toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
        }
      ),

      month: date
        .toLocaleDateString("en-GB", {
          month: "short",
        })
        .toUpperCase(),
    };
  }

  const friendlyDate = friendly
    ? getDateParts(friendly.matchDate)
    : null;

  const tournamentDate = tournament
    ? getDateParts(tournament.date)
    : null;

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
          Recommended for You
        </h2>

        {hasRecommendations && (
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

      {/* Empty State */}

{!hasRecommendations && (
  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
    {/* Icon */}

    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
      <GiSoccerBall
        size={19}
        className="text-[#00B83F]"
      />
    </div>

    {/* Text */}

    <div className="min-w-0 flex-1">
      <h3 className="text-[13px] font-bold leading-tight text-slate-950">
        No recommendations right now
      </h3>

      <p className="mt-1 text-[11px] leading-[15px] text-slate-500">
        We&apos;ll show suitable matches and tournaments here.
      </p>
    </div>

    {/* Action */}

    <Link
      href="/matches"
      className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-[#00A638]"
    >
      Browse

      <ArrowRight
        size={13}
        strokeWidth={2.2}
      />
    </Link>
  </div>
)}

      {/* Recommendations */}
      {hasRecommendations && (
        <div className="mt-3 space-y-3">
          {/* Friendly */}
          {friendly &&
            friendlyDate && (
              <Link
                href={`/friendlies/${friendly.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  {/* Date */}
                  <div className="flex w-[44px] shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50 py-2 text-center">
                    <span className="text-[9px] font-semibold text-slate-500">
                      {
                        friendlyDate.weekday
                      }
                    </span>

                    <span className="text-[24px] font-bold leading-none text-[#00B83F]">
                      {friendlyDate.day}
                    </span>

                    <span className="mt-1 text-[9px] font-semibold text-slate-500">
                      {
                        friendlyDate.month
                      }
                    </span>
                  </div>

                  {/* Badge */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                    {friendly.badgeUrl ? (
                      <Image
                        src={
                          friendly.badgeUrl
                        }
                        alt={
                          friendly.clubName
                        }
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <Shield
                        size={30}
                        className="text-slate-300"
                      />
                    )}
                  </div>

                  {/* Information */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[13px] font-bold text-slate-950">
                      {
                        friendly.clubName
                      }
                    </h3>

                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <GiSoccerBall
                        size={12}
                        className="shrink-0 text-[#00B83F]"
                      />

                      <span>
                        Friendly match
                      </span>
                    </div>

                    <div className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-slate-500">
                      <MapPin
                        size={12}
                        className="shrink-0"
                      />

                      <span className="truncate">
                        {friendly.distance !==
                        null
                          ? `${friendly.distance.toFixed(
                              1
                            )} miles · `
                          : ""}

                        {
                          friendly.location
                        }
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-[#00A638]">
                        Looking for opponent
                      </span>

                      <div className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-slate-500">
                        <Clock3
                          size={12}
                        />

                        {friendly.kickOff?.slice(
                          0,
                          5
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="shrink-0 text-lg text-slate-500">
                    ›
                  </span>
                </div>
              </Link>
            )}

          {/* Tournament */}
          {tournament &&
            tournamentDate && (
              <Link
                href={`/tournaments/${tournament.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  {/* Date */}
                  <div className="flex w-[44px] shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50 py-2 text-center">
                    <span className="text-[9px] font-semibold text-slate-500">
                      {
                        tournamentDate.weekday
                      }
                    </span>

                    <span className="text-[24px] font-bold leading-none text-[#00B83F]">
                      {
                        tournamentDate.day
                      }
                    </span>

                    <span className="mt-1 text-[9px] font-semibold text-slate-500">
                      {
                        tournamentDate.month
                      }
                    </span>
                  </div>

                  {/* Tournament Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-50">
                    {tournament.badgeUrl ? (
                      <Image
                        src={
                          tournament.badgeUrl
                        }
                        alt={tournament.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <GiTrophyCup
                        size={25}
                        className="text-violet-600"
                      />
                    )}
                  </div>

                  {/* Information */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[13px] font-bold text-slate-950">
                      {tournament.name}
                    </h3>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {
                        tournament.ageGroup
                      }
                      {" · "}
                      {tournament.teams} teams
                    </p>

                    <div className="mt-1 flex min-w-0 items-center gap-1 text-[11px] text-slate-500">
                      <MapPin
                        size={12}
                        className="shrink-0"
                      />

                      <span className="truncate">
                        {tournament.distance !==
                        null
                          ? `${tournament.distance.toFixed(
                              1
                            )} miles · `
                          : ""}

                        {
                          tournament.location
                        }
                      </span>
                    </div>

                    <div className="mt-1.5">
                      <span className="inline-flex rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-600">
                        Tournament
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="shrink-0 text-lg text-slate-500">
                    ›
                  </span>
                </div>
              </Link>
            )}
        </div>
      )}
    </section>
  );
}
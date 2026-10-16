import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { CancelMatchButton } from "@/features/friendlies/components/cancel-match-button";

type FriendlyDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FriendlyDetailsPage({
  params,
}: FriendlyDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: friendly,
    error,
  } = await supabase
    .from("friendlies")
    .select(`
      *,
      teams (
        id,
        name,
        age_group,
        gender,
        level,
        clubs (
          id,
          name,
          badge_url
        )
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    notFound();
  }

  if (!friendly) {
    notFound();
  }

  const team = Array.isArray(
    friendly.teams
  )
    ? friendly.teams[0]
    : friendly.teams;

  if (!team) {
    notFound();
  }

  const club = Array.isArray(
    team.clubs
  )
    ? team.clubs[0]
    : team.clubs;

  if (!club) {
    notFound();
  }

  const isOwner =
    friendly.created_by === user.id;

  const formattedDate =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      }
    ).format(
      new Date(
        `${friendly.match_date}T00:00:00`
      )
    );

  const formattedTime =
    friendly.kick_off_time?.slice(
      0,
      5
    ) ?? "";

  const formattedVenue =
  friendly.venue_type === "either"
    ? "Home or Away"
    : friendly.venue_type
      ? friendly.venue_type
          .charAt(0)
          .toUpperCase() +
        friendly.venue_type.slice(1)
      : "";

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-4 pb-32 pt-6">
      {/* HEADER */}

      <header className="grid grid-cols-[44px_1fr_44px] items-center">
        <Link
          href="/matches?type=friendlies"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-[0.97]"
          aria-label="Back to matches"
        >
          <ArrowLeft
            size={19}
            strokeWidth={2}
          />
        </Link>

        <h1 className="text-center text-[17px] font-bold text-slate-950">
          Match Details
        </h1>

        <div />
      </header>

      {/* CLUB / FRIENDLY CARD */}

      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* CLUB */}

        <div className="px-5 pb-5 pt-5">
          <div className="flex items-center gap-3.5">
            {/* BADGE */}

            <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center">
              {club.badge_url ? (
                <img
                  src={club.badge_url}
                  alt={`${club.name} badge`}
                  className="h-[52px] w-[52px] object-contain"
                />
              ) : (
                <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-green-50 text-[26px]">
                  ⚽
                </div>
              )}
            </div>

            {/* CLUB / TEAM */}

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[20px] font-bold tracking-tight text-slate-950">
                {club.name}
              </h2>

              <p className="mt-1 truncate text-[12px] text-slate-500">
                {team.name}
              </p>
            </div>
          </div>

          {/* TAGS */}

          <div className="ml-[70px] mt-2.5 flex flex-wrap gap-1.5">
            {team.age_group && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                {team.age_group}
              </span>
            )}

            {team.level && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                {team.level}
              </span>
            )}

            {friendly.match_format && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                {friendly.match_format}
              </span>
            )}

            {team.gender && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                {team.gender}
              </span>
            )}
          </div>
        </div>

        {/* DIVIDER */}

        <div className="border-t border-slate-100" />

        {/* MATCH INFORMATION */}

        <div className="px-5 py-5">
          <div className="space-y-4">
            {/* DATE */}

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <CalendarDays
                  size={17}
                  strokeWidth={1.9}
                  className="text-[#00A638]"
                />
              </div>

              <div>
                <p className="text-[10px] text-slate-500">
                  Date
                </p>

                <p className="mt-0.5 text-[12px] font-semibold text-slate-700">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* TIME */}

            {formattedTime && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <Clock
                    size={17}
                    strokeWidth={1.9}
                    className="text-[#00A638]"
                  />
                </div>

                <div>
                  <p className="text-[10px] text-slate-500">
                    Kick-off
                  </p>

                  <p className="mt-0.5 text-[12px] font-semibold text-slate-700">
                    {formattedTime}
                  </p>
                </div>
              </div>
            )}

            {/* LOCATION */}

            {friendly.location && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <MapPin
                    size={17}
                    strokeWidth={1.9}
                    className="text-[#00A638]"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">
                    Location
                  </p>

                  <p className="mt-0.5 truncate text-[12px] font-semibold text-slate-700">
                    {friendly.location}
                  </p>
                </div>
              </div>
            )}

            {/* VENUE */}

            {formattedVenue && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50">
                  <ShieldCheck
                    size={17}
                    strokeWidth={1.9}
                    className="text-[#00A638]"
                  />
                </div>

                <div>
                  <p className="text-[10px] text-slate-500">
                    Venue
                  </p>

                  <p className="mt-0.5 text-[12px] font-semibold text-slate-700">
                    {formattedVenue}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NOTES */}

      {friendly.notes?.trim() && (
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-[13px] font-bold text-slate-950">
            Match notes
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-[12px] leading-[19px] text-slate-500">
            {friendly.notes}
          </p>
        </section>
      )}

      {/* ACTIONS */}

      {isOwner ? (
        <div className="mt-6">
          {friendly.status === "open" ? (
            <>
              <div className="flex h-10 items-center justify-center rounded-full border border-green-100 bg-green-50 px-4 text-[12px] font-semibold text-[#00A638]">
                This is your match.
              </div>

              <Link
                href={`/friendlies/${friendly.id}/edit`}
                className="mt-3 flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-[13px] font-bold text-white shadow-sm transition active:scale-[0.98]"
              >
                Edit Match
              </Link>

              <div className="mt-3">
  <CancelMatchButton
    friendlyId={friendly.id}
  />
</div>
            </>
          ) : friendly.status ===
            "cancelled" ? (
            <div className="rounded-full bg-slate-100 p-4 text-center text-[12px] font-medium text-slate-600">
              This match has been
              cancelled.
            </div>
          ) : (
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4 text-center text-[12px] font-semibold text-[#00A638]">
              This match has been
              matched.
            </div>
          )}
        </div>
      ) : friendly.status === "open" ? (
        <Link
          href={`/friendlies/${id}/request`}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-[13px] font-bold text-white shadow-sm transition active:scale-[0.98]"
        >
          Request Match
        </Link>
      ) : friendly.status ===
        "cancelled" ? (
        <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-center text-[12px] font-medium text-slate-600">
          This match is no longer
          available.
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-center text-[12px] font-medium text-slate-600">
          This match has already been
          matched.
        </div>
      )}
    </main>
  );
}
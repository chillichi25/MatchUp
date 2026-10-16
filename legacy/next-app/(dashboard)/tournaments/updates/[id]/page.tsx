import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Megaphone,
  Trophy,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type TournamentUpdatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TournamentUpdatePage({
  params,
}: TournamentUpdatePageProps) {
  const { id } = await params;

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
  // TOURNAMENT UPDATE
  // --------------------------------------------------

  const {
    data: update,
    error: updateError,
  } = await supabase
    .from("tournament_updates")
    .select(`
      id,
      message,
      created_at,
      tournament_id,
      created_by,

      tournaments (
        id,
        name,
        age_group,
        start_date,
        location
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (updateError) {
    console.error(
      "Tournament update load error:",
      updateError
    );

    notFound();
  }

  if (!update) {
    notFound();
  }

  const tournament =
    Array.isArray(update.tournaments)
      ? update.tournaments[0]
      : update.tournaments;

  if (!tournament) {
    notFound();
  }

  // --------------------------------------------------
  // FORMAT UPDATE DATE
  // --------------------------------------------------

  const sentAt =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(
      new Date(update.created_at)
    );

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}
      <header className="relative flex items-center justify-center">
        <Link
          href="/notifications"
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          Tournament Update
        </h1>
      </header>

      {/* Tournament */}
      <section className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white">
            <Trophy
              size={23}
              className="text-violet-600"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-bold text-slate-950">
              {tournament.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {tournament.age_group ??
                "Open age"}
            </p>
          </div>
        </div>
      </section>

      {/* Announcement */}
      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <Megaphone
              size={21}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Organiser update
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {sentAt}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {update.message}
          </p>
        </div>
      </section>

      {/* Tournament information */}
      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">
          Tournament
        </h2>

        <div className="mt-4 space-y-3">
          {tournament.start_date && (
            <div className="flex items-center gap-3">
              <CalendarDays
                size={18}
                className="text-slate-400"
              />

              <span className="text-sm text-slate-600">
                {new Intl.DateTimeFormat(
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
                )}
              </span>
            </div>
          )}

          {tournament.location && (
            <p className="text-sm text-slate-600">
              {tournament.location}
            </p>
          )}
        </div>
      </section>

      {/* View tournament */}
      <Link
        href={`/tournaments/${tournament.id}`}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] font-semibold text-white"
      >
        View Tournament
      </Link>
    </main>
  );
}
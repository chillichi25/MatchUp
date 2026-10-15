import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Trophy,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { TournamentRequestForm } from "@/features/tournaments/components/tournament-request-form";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";
import { checkTournamentEligibility } from "@/features/tournaments/services/tournament-eligibility.service";

type TournamentRequestPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TournamentRequestPage({
  params,
}: TournamentRequestPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tournament, error } = await supabase
  .from("tournaments")
  .select(`
    id,
    created_by,
    name,
    age_group,
    gender,
    match_format,
    start_date,
    end_date,
    location,
    status
  `)
  .eq("id", id)
  .maybeSingle();

  if (error) {
    console.error("Tournament load error:", error);
    notFound();
  }

  if (!tournament) {
    notFound();
  }

  if (tournament.created_by === user.id) {
    redirect(`/tournaments/${id}`);
  }

  if (tournament.status !== "open") {
    redirect(`/tournaments/${id}`);
  }

  const team = await getActiveTeam();

  if (!team) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-28 pt-6">
      <header className="relative flex items-center justify-center">
        <Link
          href={`/tournaments/${id}`}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          Request to Join
        </h1>
      </header>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <h2 className="text-lg font-bold text-slate-900">
          No active team found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Select an active team before requesting to join a tournament.
        </p>
      </div>
    </main>
  );
}

const eligibility =
  checkTournamentEligibility({
    teamAgeGroup: team.age_group,
    teamGender: team.gender,
    teamMatchFormat: team.match_format,

    tournamentAgeGroup: tournament.age_group,
    tournamentGender: tournament.gender,
    tournamentMatchFormat: tournament.match_format,
  });

if (!eligibility.eligible) {
  redirect(`/tournaments/${id}`);
}

  const club = Array.isArray(team.clubs)
    ? team.clubs[0]
    : team.clubs;

  const formattedStartDate = new Intl.DateTimeFormat(
    "en-GB",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    }
  ).format(
    new Date(`${tournament.start_date}T00:00:00`)
  );

  const formattedEndDate = tournament.end_date
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(
        new Date(`${tournament.end_date}T00:00:00`)
      )
    : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-28 pt-6">
      {/* Header */}
      <header className="relative flex items-center justify-center">
        <Link
          href={`/tournaments/${id}`}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          Request to Join
        </h1>
      </header>

      {/* Tournament summary */}
      <section className="mt-6 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
            <Trophy
              size={23}
              className="text-violet-600"
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">
              {tournament.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {tournament.age_group ?? "Open age"}
              {tournament.match_format
                ? ` · ${tournament.match_format}`
                : ""}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarDays
              size={16}
              className="text-slate-400"
            />

            <span>
              {formattedStartDate}
              {formattedEndDate
                ? ` – ${formattedEndDate}`
                : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin
              size={16}
              className="text-slate-400"
            />

            <span>{tournament.location}</span>
          </div>
        </div>
      </section>

      {/* Your Team */}
      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Your Team
        </p>

        <div className="mt-3 flex items-center gap-3">
          {club?.badge_url ? (
            <img
              src={club.badge_url}
              alt={`${club.name} badge`}
              className="h-12 w-12 shrink-0 object-contain"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
              ⚽
            </div>
          )}

          <div>
            <h3 className="font-bold text-slate-900">
              {club?.name ?? "Club"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {team.name}
            </p>
          </div>
        </div>
      </section>

      {/* Request Form */}
      <TournamentRequestForm
        tournamentId={tournament.id}
        teamId={team.id}
      />
    </main>
  );
}
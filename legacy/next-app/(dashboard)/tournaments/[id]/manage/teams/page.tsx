import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ArrowLeft,
  CircleCheck,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { RemoveTournamentParticipantButton } from "@/features/tournaments/components/remove-tournament-participant-button";

type ParticipatingTeamsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ParticipatingTeamsPage({
  params,
}: ParticipatingTeamsPageProps) {

  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get tournament
  const { data: tournament, error: tournamentError } =
    await supabase
      .from("tournaments")
      .select(`
        id,
        created_by,
        name,
        age_group,
        max_teams
      `)
      .eq("id", id)
      .maybeSingle();

  if (tournamentError) {
    console.error(
      "Accepted teams tournament error:",
      tournamentError
    );

    notFound();
  }

  if (!tournament) {
    notFound();
  }

  // Only the organiser can access this page
  if (tournament.created_by !== user.id) {
    redirect(`/tournaments/${id}`);
  }

  // Get accepted requests for this tournament
  const {
    data: acceptedRequests,
    error: acceptedRequestsError,
  } = await supabase
    .from("tournament_requests")
    .select(`
      id,
      status,
      responded_at,

      teams!tournament_requests_requesting_team_id_fkey (
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
    .eq("tournament_id", id)
    .eq("status", "accepted")
    .order("responded_at", {
      ascending: true,
    });

  if (acceptedRequestsError) {
    console.error(
      "Accepted teams error:",
      acceptedRequestsError
    );
  }

  const teams = acceptedRequests ?? [];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}
      <header className="relative flex items-center justify-center">
        <Link
          href={`/tournaments/${id}/manage`}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
  Participating Teams
</h1>
      </header>

      {/* Tournament summary */}
      <section className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white">
            <Trophy
              size={24}
              className="text-violet-600"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-bold text-slate-950">
              {tournament.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {tournament.age_group ?? "Open age"}
            </p>
          </div>
        </div>
      </section>

      {/* Capacity */}
      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
  Participating teams
</p>

            <p className="mt-1 text-2xl font-bold text-slate-950">
              {teams.length}
              {tournament.max_teams
                ? ` / ${tournament.max_teams}`
                : ""}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
            <Users
              size={23}
              className="text-[#00B83F]"
            />
          </div>
        </div>

        {tournament.max_teams && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#00B83F]"
              style={{
                width: `${Math.min(
                  (teams.length / tournament.max_teams) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        )}

        {tournament.max_teams && (
  <p className="mt-3 text-sm text-slate-500">
    {teams.length >= tournament.max_teams
      ? "Tournament full"
      : `${tournament.max_teams - teams.length} ${
          tournament.max_teams - teams.length === 1
            ? "space"
            : "spaces"
        } remaining`}
  </p>
)}
      </section>

      {/* Accepted teams */}
      <section className="mt-7">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
  Participating Teams
</h2>

        {teams.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
            <Users
              size={34}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold text-slate-900">
  No participating teams yet
</h3>

<p className="mt-2 text-sm leading-6 text-slate-500">
  Teams you accept into this tournament will appear here.
</p>

            <Link
              href="/tournaments/requests"
              className="mt-5 inline-flex font-semibold text-[#00B83F]"
            >
              View Tournament Requests →
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {teams.map((request: any) => {
              const team = Array.isArray(
                request.teams
              )
                ? request.teams[0]
                : request.teams;

              const club = Array.isArray(
                team?.clubs
              )
                ? team.clubs[0]
                : team?.clubs;

              return (
                <div
                  key={request.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {club?.badge_url ? (
                      <img
                        src={club.badge_url}
                        alt={`${club.name} badge`}
                        className="h-12 w-12 shrink-0 object-contain"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                        <Shield
                          size={18}
                          className="text-slate-500"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-slate-900">
                        {club?.name ?? "Club"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {team?.name ?? "Team"}
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <CircleCheck
                        size={13}
                        strokeWidth={2.5}
                      />
                      Joined
                    </span>
                  </div>

                  {/* Team information */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {team?.age_group && (
                      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-[#00A839]">
                        {team.age_group}
                      </span>
                    )}

                    {team?.level && (
                      <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {team.level}
                      </span>
                    )}

                    {team?.gender && (
                      <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {team.gender}
                      </span>
                    )}
                  </div>

                  <RemoveTournamentParticipantButton
  requestId={request.id}
  clubName={club?.name ?? "this team"}
  tournamentName={tournament.name}
/>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
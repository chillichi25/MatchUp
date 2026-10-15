import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Shield,
  Users,
} from "lucide-react";

import {
  canManageClubMemberships,
  getClubById,
  getClubTeams,
} from "@/features/clubs/services/club.service";

type ManageTeamsPageProps = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function ManageTeamsPage({
  params,
}: ManageTeamsPageProps) {
  const { clubId } = await params;

  const [club, canManage] = await Promise.all([
    getClubById(clubId),
    canManageClubMemberships(clubId),
  ]);

  if (!club || !canManage) {
    notFound();
  }

  const teams = await getClubTeams(clubId);

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/clubs/${clubId}/manage`}
            aria-label="Back to club management"
            className="flex h-10 w-10 items-center justify-center text-slate-700 transition hover:text-slate-950 active:scale-95"
          >
            <ArrowLeft
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>

          <Image
            src="/images/matchup-logo.png"
            alt="MatchUp"
            width={150}
            height={80}
            priority
            className="h-auto w-[125px]"
          />

          <div className="h-10 w-10" />
        </div>

        {/* Heading */}
        <div className="mt-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Manage teams
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage the teams at {club.name}.
          </p>
        </div>

        {/* Add team */}
        <Link
          href={`/clubs/${clubId}/manage/teams/create`}
          className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#00B83F] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#009F37] active:scale-[0.99]"
        >
          <Plus
            size={20}
            strokeWidth={2.2}
            aria-hidden="true"
          />
          Add team
        </Link>

        {/* Teams */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500">
              Teams
            </h2>

            <span className="text-sm text-slate-400">
              {teams.length}
            </span>
          </div>

          {teams.length === 0 ? (
            <div className="mt-3 rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-slate-400">
                <Users
                  size={24}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-4 font-semibold text-slate-950">
                No teams yet
              </h2>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Add the first team for this club.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/clubs/${clubId}/manage/teams/${team.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#00B83F] hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
                    <Shield
                      size={21}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-950">
                      {team.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {[
                        team.age_group,
                        team.gender,
                        team.match_format,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>

                    {team.level && (
                      <p className="mt-1 text-xs text-slate-400">
                        {team.level}
                      </p>
                    )}
                  </div>

                  <ChevronRight
                    size={19}
                    strokeWidth={2}
                    className="shrink-0 text-slate-300"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Building2,
  ChevronRight,
  Shield,
  Users,
} from "lucide-react";

import {
  getClubById,
  getClubTeams,
  getMyClubTeamMemberships,
  isApprovedClubMember,
} from "@/features/clubs/services/club.service";

type ChooseTeamPageProps = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function ChooseTeamPage({
  params,
}: ChooseTeamPageProps) {
  const { clubId } = await params;

  const [club, isApprovedMember] =
    await Promise.all([
      getClubById(clubId),
      isApprovedClubMember(clubId),
    ]);

  if (!club || !isApprovedMember) {
    notFound();
  }

  const [teams, teamMemberships] =
    await Promise.all([
      getClubTeams(clubId),
      getMyClubTeamMemberships(clubId),
    ]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/matchup-logo.png"
            alt="MatchUp"
            width={150}
            height={80}
            priority
            className="h-auto w-[125px]"
          />
        </div>

        {/* Heading */}
        <div className="mt-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Choose your team
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select the team you coach at{" "}
            {club.name}.
          </p>
        </div>

        {/* Club */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50">
            {club.badge_url ? (
              <Image
                src={club.badge_url}
                alt={`${club.name} badge`}
                width={44}
                height={44}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <Building2
                size={20}
                strokeWidth={1.8}
                className="text-slate-400"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              {club.name}
            </p>

            <p className="mt-0.5 text-xs text-[#00B83F]">
              Club membership approved
            </p>
          </div>
        </div>

        {/* Teams */}
        {teams.length === 0 ? (
          <div className="mt-7 rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-slate-400">
              <Users
                size={24}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 font-semibold text-slate-950">
              No teams available
            </h2>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
              There are currently no teams available
              to select at this club.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-3">
            {teams.map((team) => {
              const membership =
                teamMemberships.find(
                  (item) =>
                    item.team_id === team.id
                );

              const isApproved =
                membership?.status ===
                "approved";

              const isPending =
                membership?.status ===
                "pending";

              const href = isPending
                ? `/clubs/${clubId}/teams/${team.id}/pending`
                : `/clubs/${clubId}/teams/${team.id}`;

              return (
                <Link
                  key={team.id}
                  href={href}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#00B83F] hover:shadow-md active:scale-[0.99]"
                >
                  {/* Team icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
                    <Shield
                      size={21}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Team details */}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-slate-950">
                      {team.name}
                    </h2>

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

                  {/* Membership status */}
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    {isApproved && (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-[#00B83F]">
                        Approved
                      </span>
                    )}

                    {isPending && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                        Pending
                      </span>
                    )}

                    <ChevronRight
                      size={19}
                      strokeWidth={2}
                      className="text-slate-300"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Check,
  Shield,
} from "lucide-react";

import {
  canManageClubMemberships,
  getClubById,
  getClubMembers,
  getClubMemberTeams,
  getClubTeams,
} from "@/features/clubs/services/club.service";

import {
  assignMemberToTeamAction,
  removeMemberFromTeamAction,
} from "./actions";

type ManageMemberTeamsPageProps = {
  params: Promise<{
    clubId: string;
    coachId: string;
  }>;
};

export default async function ManageMemberTeamsPage({
  params,
}: ManageMemberTeamsPageProps) {
  const { clubId, coachId } = await params;

  const [club, canManage] = await Promise.all([
    getClubById(clubId),
    canManageClubMemberships(clubId),
  ]);

  if (!club || !canManage) {
    notFound();
  }

  const [
    members,
    clubTeams,
    memberTeams,
  ] = await Promise.all([
    getClubMembers(clubId),
    getClubTeams(clubId),
    getClubMemberTeams(clubId),
  ]);

  const member = members.find(
    (item) => item.coach_id === coachId
  );

  if (!member) {
    notFound();
  }

  const name = [
    member.first_name,
    member.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const assignedTeamIds = new Set(
    memberTeams
      .filter(
        (team) =>
          team.coach_id === coachId
      )
      .map((team) => team.team_id)
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/clubs/${clubId}/manage/members/${coachId}`}
            aria-label="Back to member"
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
            Manage team access for{" "}
            <span className="font-medium text-slate-700">
              {name || "this member"}
            </span>
            .
          </p>
        </div>

        {/* Member */}
        <section className="mt-7 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-slate-950">
            {name || "Member"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {club.name}
          </p>
        </section>

        {/* Teams */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500">
              Team memberships
            </h2>

            <span className="text-sm text-slate-400">
              {assignedTeamIds.size} assigned
            </span>
          </div>

          {clubTeams.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-5 py-8 text-center shadow-sm">
              <p className="font-semibold text-slate-950">
                No teams available
              </p>

              <p className="mt-2 text-sm text-slate-500">
                This club does not have any teams yet.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {clubTeams.map((team) => {
                const isAssigned =
                  assignedTeamIds.has(team.id);

                return (
                  <div
                    key={team.id}
                    className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
                      <Shield
                        size={21}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-950">
                        {team.name}
                      </p>

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

                    {isAssigned ? (
  <div className="flex shrink-0 flex-col items-end gap-2">
    <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-[#00B83F]">
      <Check
        size={14}
        strokeWidth={2.5}
        aria-hidden="true"
      />
      Assigned
    </div>

    <form
      action={async () => {
        "use server";

        await removeMemberFromTeamAction(
          clubId,
          coachId,
          team.id
        );
      }}
    >
      <button
        type="submit"
        className="text-xs font-semibold text-red-500 transition hover:text-red-600 active:scale-[0.97]"
      >
        Remove
      </button>
    </form>
  </div>
) : (
  <form
    action={async () => {
      "use server";

      await assignMemberToTeamAction(
        clubId,
        coachId,
        team.id
      );
    }}
  >
    <button
      type="submit"
      className="shrink-0 rounded-full bg-[#00B83F] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#009F37] active:scale-[0.97]"
    >
      Assign
    </button>
  </form>
)}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
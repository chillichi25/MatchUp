import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ChevronRight,
  Crown,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  canManageClubMemberships,
  getClubById,
  getClubMembers,
  getClubMemberTeams,
  isClubOwner,
} from "@/features/clubs/services/club.service";

import {
  removeMemberFromClubAction,
  updateMemberRoleAction,
} from "./actions";

import {
  RemoveMemberButton,
} from "./remove-member-button";

type ManageMemberPageProps = {
  params: Promise<{
    clubId: string;
    coachId: string;
  }>;
};

export default async function ManageMemberPage({
  params,
}: ManageMemberPageProps) {
  const { clubId, coachId } = await params;

  const [club, canManage, currentUserIsOwner] =
  await Promise.all([
    getClubById(clubId),
    canManageClubMemberships(clubId),
    isClubOwner(clubId),
  ]);

  if (!club || !canManage) {
    notFound();
  }

  const [members, memberTeams] =
    await Promise.all([
      getClubMembers(clubId),
      getClubMemberTeams(clubId),
    ]);

  const member = members.find(
    (item) => item.coach_id === coachId
  );

  if (!member) {
    notFound();
  }

  const teams = memberTeams.filter(
    (team) => team.coach_id === coachId
  );

  const name = [
    member.first_name,
    member.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const isOwner =
    member.club_role === "owner";

    const nextRole =
  member.club_role === "admin"
    ? "coach"
    : "admin";

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/clubs/${clubId}/manage/members`}
            aria-label="Back to club members"
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
            Manage member
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            View this member&apos;s role and teams at{" "}
            {club.name}.
          </p>
        </div>

        {/* Member identity */}
        <section className="mt-7 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className={
                isOwner
                  ? "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600"
                  : "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]"
              }
            >
              {isOwner ? (
                <Crown
                  size={24}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              ) : (
                <ShieldCheck
                  size={24}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-950">
                {name || "Member"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {club.name}
              </p>
            </div>
          </div>
        </section>

        {/* Club role */}
<section className="mt-8">
  <h2 className="text-sm font-semibold text-slate-500">
    Club role
  </h2>

  <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500">
          Role
        </p>

        <p className="mt-1 text-sm font-semibold capitalize text-slate-950">
          {member.club_role}
        </p>
      </div>

      {currentUserIsOwner && !isOwner && (
  <form
          action={async () => {
            "use server";

            await updateMemberRoleAction(
              clubId,
              coachId,
              member.membership_id,
              nextRole
            );
          }}
        >
          <button
            type="submit"
            className="rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-[#00B83F] transition hover:bg-green-100 active:scale-[0.97]"
          >
            {member.club_role === "admin"
              ? "Change to coach"
              : "Make admin"}
          </button>
        </form>
      )}
    </div>

    {currentUserIsOwner && !isOwner && (
  <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-5 text-slate-400">
    Admins can help manage club members, teams and requests.
  </p>
)}
  </div>
</section>

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
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-5 py-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                No teams assigned
              </p>

              <p className="mt-1 text-sm text-slate-500">
                This member has no approved team memberships.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {teams.map((team) => (
                <div
                  key={team.team_id}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
                    <Shield
                      size={20}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-950">
                      {team.team_name}
                    </p>

                    <p className="mt-1 text-sm capitalize text-slate-500">
                      {team.team_role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Member management */}
<section className="mt-8">
  <h2 className="text-sm font-semibold text-slate-500">
    Member management
  </h2>

  <Link
    href={`/clubs/${clubId}/manage/members/${coachId}/teams`}
    className="mt-3 flex min-h-[76px] items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 shadow-sm transition hover:bg-gray-50 active:bg-gray-100"
  >
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
      <Users
        size={20}
        strokeWidth={1.9}
        aria-hidden="true"
      />
    </div>

    <div className="min-w-0 flex-1">
      <p className="font-semibold text-slate-950">
        Manage teams
      </p>

      <p className="mt-0.5 text-sm text-slate-500">
        Assign or remove team access
      </p>
    </div>

    <ChevronRight
      size={19}
      className="shrink-0 text-slate-300"
      aria-hidden="true"
    />
  </Link>

  {currentUserIsOwner && !isOwner && (
  <RemoveMemberButton
    memberName={name || "Member"}
    clubName={club.name}
    action={async () => {
      "use server";

      await removeMemberFromClubAction(
        clubId,
        coachId,
        member.membership_id
      );
    }}
  />
)}
</section>
      </div>
    </main>
  );
}
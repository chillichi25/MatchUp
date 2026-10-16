import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Crown,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  canManageClubMemberships,
  getClubById,
  getClubMembers,
  getClubMemberTeams,
} from "@/features/clubs/services/club.service";

type ClubMembersPageProps = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function ClubMembersPage({
  params,
}: ClubMembersPageProps) {
  const { clubId } = await params;

  const [club, canManage] = await Promise.all([
    getClubById(clubId),
    canManageClubMemberships(clubId),
  ]);

  if (!club || !canManage) {
    notFound();
  }

  const [members, memberTeams] = await Promise.all([
    getClubMembers(clubId),
    getClubMemberTeams(clubId),
  ]);

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
            Club members
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            View the people who are members of{" "}
            {club.name}.
          </p>
        </div>

        {/* Count */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">
            Members
          </h2>

          <span className="text-sm text-slate-400">
            {members.length}
          </span>
        </div>

        {/* Members */}
        {members.length === 0 ? (
          <div className="mt-3 rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-slate-400">
              <UserRound
                size={24}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 font-semibold text-slate-950">
              No members
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are no approved members to show.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {members.map((member) => {
              const name = [
                member.first_name,
                member.last_name,
              ]
                .filter(Boolean)
                .join(" ");

              const isOwner =
                member.club_role === "owner";

              const teams = memberTeams.filter(
                (team) =>
                  team.coach_id ===
                  member.coach_id
              );

              return (
                <Link
                  key={member.membership_id}
                  href={`/clubs/${clubId}/manage/members/${member.coach_id}`}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#00B83F] hover:shadow-md active:scale-[0.99]"
                >
                  {/* Member icon */}
                  <div
                    className={
                      isOwner
                        ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600"
                        : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]"
                    }
                  >
                    {isOwner ? (
                      <Crown
                        size={21}
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                    ) : (
                      <ShieldCheck
                        size={21}
                        strokeWidth={1.9}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  {/* Member details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-950">
                      {name || "Member"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      <span className="capitalize">
                        {member.club_role}
                      </span>

                      {teams.length > 0 && (
                        <>
                          {" • "}
                          {teams
                            .map(
                              (team) =>
                                team.team_name
                            )
                            .join(", ")}
                        </>
                      )}
                    </p>
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
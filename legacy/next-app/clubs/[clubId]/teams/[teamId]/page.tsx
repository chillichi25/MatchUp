import Image from "next/image";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import {
  requestToJoinTeamAction,
  setActiveTeamAction,
} from "./actions";

import {
  ArrowLeft,
  Building2,
  Shield,
} from "lucide-react";

import {
  getClubById,
  getClubTeams,
  getMyTeamMembership,
  isApprovedClubMember,
} from "@/features/clubs/services/club.service";

type TeamConfirmationPageProps = {
  params: Promise<{
    clubId: string;
    teamId: string;
  }>;
};

export default async function TeamConfirmationPage({
  params,
}: TeamConfirmationPageProps) {
  const { clubId, teamId } = await params;

  const [club, isApprovedMember] =
    await Promise.all([
      getClubById(clubId),
      isApprovedClubMember(clubId),
    ]);

  if (!club || !isApprovedMember) {
    notFound();
  }

  const teams = await getClubTeams(clubId);

  const team = teams.find(
    (item) => item.id === teamId
  );

  if (!team) {
    notFound();
  }

  const teamMembership =
  await getMyTeamMembership(teamId);

const isApproved =
  teamMembership?.status === "approved";

const isPending =
  teamMembership?.status === "pending";

if (isPending) {
  redirect(
    `/clubs/${clubId}/teams/${teamId}/pending`
  );
}

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/clubs/${clubId}/teams`}
            aria-label="Back to teams"
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
            Is this your team?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
  Check the team details before continuing.
</p>
        </div>

        {/* Team card */}
        <section className="mt-8 rounded-3xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
              <Shield
                size={32}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
              {team.name}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {[
                team.age_group,
                team.gender,
                team.match_format,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>

            {team.level && (
              <p className="mt-1 text-sm text-slate-400">
                {team.level}
              </p>
            )}
          </div>

          {/* Club */}
          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-3">
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

                <p className="mt-0.5 text-xs text-slate-500">
                  Club
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team action */}
{isApproved ? (
  <form
    action={async () => {
      "use server";

      await setActiveTeamAction(teamId);
    }}
    className="mt-6"
  >
    <button
      type="submit"
      className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#00B83F] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#009F37] active:scale-[0.99]"
    >
      Use this team
    </button>
  </form>
) : (
  <form
    action={async () => {
      "use server";

      await requestToJoinTeamAction(
        teamId,
        clubId
      );
    }}
    className="mt-6"
  >
    <button
      type="submit"
      className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#00B83F] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#009F37] active:scale-[0.99]"
    >
      Request to join team
    </button>
  </form>
)}

        {/* Wrong team */}
        <div className="mt-5 text-center">
          <Link
            href={`/clubs/${clubId}/teams`}
            className="inline-flex min-h-10 items-center justify-center text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            This isn&apos;t my team
          </Link>
        </div>
      </div>
    </main>
  );
}
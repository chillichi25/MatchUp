import Image from "next/image";
import {
  notFound,
  redirect,
} from "next/navigation";
import {
  Building2,
  Clock3,
  Shield,
} from "lucide-react";

import {
  getClubById,
  getClubTeams,
  getMyTeamMembership,
  isApprovedClubMember,
} from "@/features/clubs/services/club.service";

type TeamPendingPageProps = {
  params: Promise<{
    clubId: string;
    teamId: string;
  }>;
};

export default async function TeamPendingPage({
  params,
}: TeamPendingPageProps) {
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

if (!teamMembership) {
  redirect(
    `/clubs/${clubId}/teams`
  );
}

if (teamMembership.status === "approved") {
  redirect(
    `/clubs/${clubId}/teams`
  );
}

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

        {/* Status */}
        <div className="mt-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Clock3
              size={28}
              strokeWidth={1.9}
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Awaiting approval
          </h1>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
            Your request to join {team.name} is
            waiting for approval.
          </p>
        </div>

        {/* Team */}
        <section className="mt-8 rounded-3xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
              <Shield
                size={25}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-slate-950">
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
            </div>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50">
                {club.badge_url ? (
                  <Image
                    src={club.badge_url}
                    alt={`${club.name} badge`}
                    width={40}
                    height={40}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Building2
                    size={18}
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

        {/* Pending status */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-4">
          <div className="flex items-start gap-3">
            <Clock3
              size={19}
              className="mt-0.5 shrink-0 text-amber-500"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-slate-950">
                Request pending
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                A club owner or admin will review
                your team request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
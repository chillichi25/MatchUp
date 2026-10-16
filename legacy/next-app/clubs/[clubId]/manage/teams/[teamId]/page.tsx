import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamUpdatedToast } from "@/features/clubs/components/team-updated-toast";

import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  Shield,
} from "lucide-react";

import {
  canManageClubMemberships,
  getClubById,
  getClubTeams,
} from "@/features/clubs/services/club.service";

type ManageTeamPageProps = {
  params: Promise<{
    clubId: string;
    teamId: string;
  }>;

  searchParams: Promise<{
    updated?: string;
  }>;
};

export default async function ManageTeamPage({
  params,
  searchParams,
}: ManageTeamPageProps) {
  const { clubId, teamId } = await params;
  const { updated } = await searchParams;

  const [club, canManage] =
    await Promise.all([
      getClubById(clubId),
      canManageClubMemberships(clubId),
    ]);

  if (!club || !canManage) {
    notFound();
  }

  const teams = await getClubTeams(clubId);

  const team = teams.find(
    (item) => item.id === teamId
  );

  if (!team) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {updated === "1" && (
  <TeamUpdatedToast
    clubId={clubId}
    teamId={teamId}
  />
)}
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/clubs/${clubId}/manage/teams`}
            aria-label="Back to manage teams"
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
            Manage team
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            View and manage {team.name} at{" "}
            {club.name}.
          </p>
        </div>

        {/* Team identity */}
        <section className="mt-7 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
              <Shield
                size={24}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-950">
                {team.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {club.name}
              </p>
            </div>
          </div>
        </section>

        {/* Team details */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-slate-500">
            Team details
          </h2>

          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <DetailRow
              label="Age group"
              value={team.age_group || "—"}
            />

            <Divider />

            <DetailRow
              label="Match format"
              value={team.match_format || "—"}
            />

            <Divider />

            <DetailRow
              label="Team category"
              value={team.gender || "—"}
            />

            <Divider />

            <DetailRow
              label="Team level"
              value={team.level || "—"}
            />
          </div>
        </section>

        {/* Edit entry */}
        <section className="mt-8">
          <Link
            href={`/clubs/${clubId}/manage/teams/${teamId}/edit`}
            className="flex min-h-[72px] items-center gap-4 rounded-2xl border border-gray-200 bg-white px-4 shadow-sm transition hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
              <Pencil
                size={19}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-950">
                Edit team details
              </p>

              <p className="mt-0.5 text-sm text-slate-500">
                Update this team&apos;s information
              </p>
            </div>

            <ChevronRight
              size={19}
              className="shrink-0 text-slate-300"
              aria-hidden="true"
            />
          </Link>
        </section>
      </div>
    </main>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div className="mx-5 border-t border-gray-100" />
  );
}
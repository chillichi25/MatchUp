import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ChevronRight,
  Settings2,
  ShieldCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";

import {
  canManageClubMemberships,
  getClubById,
} from "@/features/clubs/services/club.service";

type ClubManagementPageProps = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function ClubManagementPage({
  params,
}: ClubManagementPageProps) {
  const { clubId } = await params;

  const [club, canManage] = await Promise.all([
    getClubById(clubId),
    canManageClubMemberships(clubId),
  ]);

  if (!club || !canManage) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            aria-label="Back to profile"
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
            Manage club
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage {club.name} and review membership
            requests.
          </p>
        </div>

        {/* Club */}
        <section className="mt-6 flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50">
            {club.badge_url ? (
              <Image
                src={club.badge_url}
                alt={`${club.name} badge`}
                width={48}
                height={48}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              <ShieldCheck
                size={22}
                strokeWidth={1.8}
                className="text-slate-400"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950">
              {club.name}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              Club management
            </p>
          </div>
        </section>

{/* Teams */}
<section className="mt-8">
  <h2 className="text-sm font-semibold text-slate-500">
    Teams
  </h2>

  <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <Link
      href={`/clubs/${clubId}/manage/teams`}
      className="flex min-h-[76px] items-center gap-4 px-4 transition hover:bg-gray-50 active:bg-gray-100"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
        <Settings2
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
          Add and manage club teams
        </p>
      </div>

      <ChevronRight
        size={19}
        className="shrink-0 text-slate-300"
        aria-hidden="true"
      />
    </Link>
  </div>
</section>

{/* Members */}
<section className="mt-8">
  <h2 className="text-sm font-semibold text-slate-500">
    Members
  </h2>

  <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <Link
      href={`/clubs/${clubId}/manage/members`}
      className="flex min-h-[76px] items-center gap-4 px-4 transition hover:bg-gray-50 active:bg-gray-100"
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
          Club members
        </p>

        <p className="mt-0.5 text-sm text-slate-500">
          View coaches and club roles
        </p>
      </div>

      <ChevronRight
        size={19}
        className="shrink-0 text-slate-300"
        aria-hidden="true"
      />
    </Link>
  </div>
</section>

        {/* Membership */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-slate-500">
            Membership requests
          </h2>

          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Club requests */}
            <Link
              href={`/clubs/${clubId}/requests`}
              className="flex min-h-[76px] items-center gap-4 px-4 transition hover:bg-gray-50 active:bg-gray-100"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
                <UserRoundPlus
                  size={20}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">
                  Club requests
                </p>

                <p className="mt-0.5 text-sm text-slate-500">
                  Review coaches joining the club
                </p>
              </div>

              <ChevronRight
                size={19}
                className="shrink-0 text-slate-300"
                aria-hidden="true"
              />
            </Link>

            <div className="ml-[71px] border-t border-gray-100" />

            {/* Team requests */}
            <Link
              href={`/clubs/${clubId}/team-requests`}
              className="flex min-h-[76px] items-center gap-4 px-4 transition hover:bg-gray-50 active:bg-gray-100"
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
                  Team requests
                </p>

                <p className="mt-0.5 text-sm text-slate-500">
                  Review coaches joining teams
                </p>
              </div>

              <ChevronRight
                size={19}
                className="shrink-0 text-slate-300"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
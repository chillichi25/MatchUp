import Link from "next/link";

import {
  CalendarDays,
  ChevronRight,
  History,
  Pencil,
  Settings,
  Trophy,
  Users,
} from "lucide-react";

import {
  canManageClubMemberships,
  isClubOwner,
} from "@/features/clubs/services/club.service";

import { getProfileData } from "@/features/profile/services/profile.service";
import { ProfileMenu } from "@/features/profile/components/profile-menu";
import { ClubBadgeUpload } from "@/features/profile/components/club-badge-upload";

export default async function ProfilePage() {
  const profile = await getProfileData();

  if (!profile) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 p-6">
        <p>No profile found.</p>
      </main>
    );
  }

  const [canManageClub, isOwner] = await Promise.all([
    canManageClubMemberships(profile.clubId),
    isClubOwner(profile.clubId),
  ]);

  const played = profile.statistics?.played ?? 0;
  const wins = profile.statistics?.wins ?? 0;
  const draws = profile.statistics?.draws ?? 0;
  const losses = profile.statistics?.losses ?? 0;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-4 pb-28 pt-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-950">
          Profile
        </h1>

        <ProfileMenu />
      </header>

      {/* =================================================
          CLUB IDENTITY
      ================================================= */}

      <section className="mt-5 flex flex-col items-center text-center">
        <ClubBadgeUpload
          badgeUrl={profile.badgeUrl}
          clubName={profile.clubName}
        />

        <h2 className="mt-4 text-[23px] font-bold tracking-tight text-slate-950">
          {profile.clubName}
        </h2>

        <p className="mt-1 text-[14px] font-medium text-slate-500">
          {profile.teamName}
        </p>

        {isOwner && (
          <Link
            href="/profile/club/edit"
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm transition active:scale-[0.98]"
          >
            <Pencil
              size={15}
              strokeWidth={1.9}
            />

            Edit Club
          </Link>
        )}
      </section>

      {/* =================================================
          ACTIVE TEAM
      ================================================= */}

      <section className="mt-7">
        <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
          Active Team
        </h2>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          {/* TEAM HEADER */}

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-bold text-slate-950">
                {profile.teamName}
              </h3>

              <p className="mt-1 truncate text-[13px] text-slate-500">
                {profile.clubName}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50">
              <Users
                size={20}
                strokeWidth={1.8}
                className="text-slate-400"
              />
            </div>
          </div>

          {/* TEAM INFORMATION */}

          <div className="mt-4 grid grid-cols-[0.8fr_1.4fr_0.8fr] divide-x divide-slate-100 border-t border-slate-100 pt-4">
            <TeamInfo
              label="Age Group"
              value={profile.teamAgeGroup || "—"}
            />

            <TeamInfo
              label="Level"
              value={profile.teamLevel || "—"}
            />

            <TeamInfo
              label="Gender"
              value={profile.teamGender || "—"}
            />
          </div>
        </div>
      </section>

      {/* =================================================
          CLUB MANAGEMENT
      ================================================= */}

      {canManageClub && (
        <section className="mt-7">
          <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
            Club Management
          </h2>

          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Link
              href={`/clubs/${profile.clubId}/manage`}
              className="flex items-center gap-3.5 px-4 py-4 transition active:bg-slate-50"
            >
              {/* ICON */}

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
                <Settings
                  size={20}
                  strokeWidth={1.9}
                  className="text-[#00B83F]"
                  aria-hidden="true"
                />
              </div>

              {/* TEXT */}

              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-slate-950">
                  Manage club
                </p>

                <p className="mt-0.5 truncate text-[12px] text-slate-500">
                  Teams and membership requests
                </p>
              </div>

              <ChevronRight
                size={18}
                strokeWidth={2}
                className="shrink-0 text-slate-300"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>
      )}

      {/* =================================================
          MY ACTIVITY
      ================================================= */}

      <section className="mt-7">
        <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
          My Activity
        </h2>

        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* UPCOMING MATCHES */}

          <ActivityLink
            href="/matches"
            icon={
              <CalendarDays
                size={20}
                strokeWidth={1.9}
                className="text-blue-600"
              />
            }
            iconClassName="bg-blue-50"
            title="Upcoming Matches"
            value={null}
          />

          <Divider />

          {/* UPCOMING TOURNAMENTS */}

          <ActivityLink
            href="/tournaments/participating"
            icon={
              <Trophy
                size={20}
                strokeWidth={1.9}
                className="text-violet-600"
              />
            }
            iconClassName="bg-violet-50"
            title="Upcoming Tournaments"
            value={null}
          />

          <Divider />

          {/* MATCH HISTORY */}

          <ActivityLink
            href="/matches/history"
            icon={
              <History
                size={20}
                strokeWidth={1.9}
                className="text-slate-500"
              />
            }
            iconClassName="bg-slate-50"
            title="Match History"
            value={null}
          />
        </div>
      </section>

      {/* =================================================
          TEAM PERFORMANCE
      ================================================= */}

      <section className="mt-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
            Team Performance
          </h2>

          <Link
            href="/matches/statistics"
            className="shrink-0 text-[13px] font-semibold text-[#00B83F]"
          >
            View all
          </Link>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-sm">
          <div className="grid grid-cols-4 divide-x divide-slate-100">
            <PerformanceItem
              label="Played"
              value={played}
            />

            <PerformanceItem
              label="Won"
              value={wins}
            />

            <PerformanceItem
              label="Drawn"
              value={draws}
            />

            <PerformanceItem
              label="Lost"
              value={losses}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/* =====================================================
   TEAM INFO
===================================================== */

type TeamInfoProps = {
  label: string;
  value: string;
};

function TeamInfo({
  label,
  value,
}: TeamInfoProps) {
  return (
    <div className="min-w-0 px-2 text-center">
      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[12px] font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   ACTIVITY LINK
===================================================== */

type ActivityLinkProps = {
  href: string;
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  value: number | null;
};

function ActivityLink({
  href,
  icon,
  iconClassName = "bg-slate-50",
  title,
  value,
}: ActivityLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 px-4 py-3.5 transition active:bg-slate-50"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-slate-950">
          {title}
        </p>
      </div>

      {value !== null && (
        <span className="shrink-0 text-[12px] font-semibold text-slate-500">
          {value}
        </span>
      )}

      <ChevronRight
        size={18}
        strokeWidth={2}
        className="shrink-0 text-slate-300"
      />
    </Link>
  );
}

/* =====================================================
   DIVIDER
===================================================== */

function Divider() {
  return (
    <div className="ml-[68px] border-t border-slate-100" />
  );
}

/* =====================================================
   PERFORMANCE ITEM
===================================================== */

type PerformanceItemProps = {
  label: string;
  value: number;
};

function PerformanceItem({
  label,
  value,
}: PerformanceItemProps) {
  return (
    <div className="min-w-0 px-1.5 text-center">
      <p className="text-[19px] font-bold leading-none text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-[10px] text-slate-500">
        {label}
      </p>
    </div>
  );
}
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Building2,
  Check,
  ChevronLeft,
  Clock3,
  MapPin,
  Shirt,
} from "lucide-react";

import {
  getClubById,
  getClubTeams,
} from "@/features/clubs/services/club.service";

type JoinPendingPageProps = {
  params: Promise<{
    clubId: string;
  }>;

  searchParams: Promise<{
    teamId?: string;
    sent?: string;
  }>;
};

function formatAgeGroup(
  ageGroup: string
) {
  const value =
    ageGroup?.trim();

  if (!value) {
    return "";
  }

  if (/^u\d+$/i.test(value)) {
    return `Under ${value.slice(1)}`;
  }

  return value;
}

function formatGender(
  gender: string
) {
  const value =
    gender?.trim().toLowerCase();

  if (value === "male") {
    return "Boys";
  }

  if (value === "female") {
    return "Girls";
  }

  if (value === "mixed") {
    return "Mixed";
  }

  return gender;
}

function formatMatchFormat(
  matchFormat: string
) {
  const value =
    matchFormat?.trim();

  if (!value) {
    return "";
  }

  if (/^\d+$/.test(value)) {
    return `${value}v${value}`;
  }

  return value;
}

export default async function JoinPendingPage({
  params,
  searchParams,
}: JoinPendingPageProps) {
  const { clubId } =
    await params;

  const {
    teamId,
  } = await searchParams;

  const [club, teams] =
    await Promise.all([
      getClubById(clubId),
      getClubTeams(clubId),
    ]);

  if (!club) {
    notFound();
  }

  const team =
    teamId
      ? teams.find(
          (item) =>
            item.id === teamId
        )
      : undefined;

  const location = [
    club.city,
    club.county,
  ]
    .filter(Boolean)
    .join(", ");

  const teamDetails = team
    ? [
        formatAgeGroup(
          team.age_group
        ),
        formatGender(
          team.gender
        ),
        formatMatchFormat(
          team.match_format
        ),
      ].filter(Boolean)
    : [];

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-md px-5 pb-10 pt-5">


        {/* Back */}
        <div className="flex h-11 items-center">
          <Link
            href={`/clubs/join/${clubId}`}
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#07192D] shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <ChevronLeft
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Club */}
        <section className="mt-6 text-center">

          {/* No circle around badge */}
          <div className="mx-auto flex h-[82px] w-[82px] items-center justify-center">
  {club.badge_url ? (
    <Image
      src={club.badge_url}
      alt={`${club.name} badge`}
      width={82}
      height={82}
      priority
      className="h-full w-full object-contain"
    />
            ) : (
              <Building2
                size={42}
                strokeWidth={1.7}
                className="text-slate-400"
                aria-hidden="true"
              />
            )}
          </div>

          <h1 className="mt-3 text-[22px] font-bold tracking-[-0.02em] text-[#07192D]">
            {club.name}
          </h1>

          {location && (
            <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[13px] text-slate-500">
              <MapPin
                size={15}
                strokeWidth={2}
                className="text-slate-400"
                aria-hidden="true"
              />

              <span>
                {location}
              </span>
            </div>
          )}
        </section>

        {/* Awaiting approval */}
<section className="mt-8 text-center">
  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
    <Clock3
      size={29}
      strokeWidth={2}
      aria-hidden="true"
    />
  </div>

  <h2 className="mt-4 text-[24px] font-bold tracking-[-0.02em] text-[#07192D]">
    Awaiting approval
  </h2>

  <p className="mx-auto mt-2 max-w-[300px] text-[14px] leading-6 text-slate-500">
    {team ? (
      <>
        Your request to join{" "}
        <span className="font-semibold text-slate-700">
          {team.name}
        </span>{" "}
        is waiting for club approval.
      </>
    ) : (
      <>
        Your request is waiting for club approval.
      </>
    )}
  </p>

  <p className="mx-auto mt-2 max-w-[300px] text-[14px] leading-6 text-slate-500">
    We&apos;ll let you know when the club responds.
  </p>
</section>

        {/* Team */}
        {team && (
          <section className="mt-7 flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-[0_2px_6px_rgba(15,23,42,0.05)]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <Shirt
                size={27}
                strokeWidth={1.5}
                fill="currentColor"
                className="text-slate-400"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[16px] font-bold text-[#07192D]">
                {team.name}
              </p>

              {teamDetails.length >
                0 && (
                <p className="mt-1 text-[13px] text-slate-500">
                  {teamDetails.join(
                    " · "
                  )}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Home */}
        <Link
  href="/clubs/pending"
  className="mt-7 flex h-14 w-full items-center justify-center rounded-full bg-[#00B83F] text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#009F37] active:scale-[0.98]"
>
  Done
</Link>
      </div>
    </main>
  );
}
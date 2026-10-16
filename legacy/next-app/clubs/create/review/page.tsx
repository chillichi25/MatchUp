import Image from "next/image";
import Link from "next/link";

import { Pencil } from "lucide-react";

import { completeSetupAction } from "./actions";
import { CompleteSetupForm } from "./complete-setup-form";

type ReviewPageProps = {
  searchParams: Promise<{
    clubName?: string;
    country?: string;
    county?: string;
    city?: string;
    lat?: string;
    lng?: string;
    teamName?: string;
    ageGroup?: string;
    matchFormat?: string;
    gender?: string;
    level?: string;
  }>;
};

export default async function ReviewPage({
  searchParams,
}: ReviewPageProps) {
  const params = await searchParams;

  const clubName = params.clubName ?? "";
  const country = params.country ?? "";
  const county = params.county ?? "";
  const city = params.city ?? "";
  const lat = params.lat ?? "";
  const lng = params.lng ?? "";

  const teamName = params.teamName ?? "";
  const ageGroup = params.ageGroup ?? "";
  const matchFormat = params.matchFormat ?? "";
  const gender = params.gender ?? "";
  const level = params.level ?? "";

const clubParams = new URLSearchParams({
  name: clubName,
  country,
  county,
  city,
  lat,
  lng,

  // Preserve the team while editing the club.
  teamName,
  ageGroup,
  matchFormat,
  gender,
  level,

  // Tells Club Setup that we came from Review.
  editMode: "review",
});

  // Used when returning to Team setup.
  // Keep ALL team values here so Back/Edit restores the form.
  const teamParams = new URLSearchParams({
    name: clubName,
    country,
    county,
    city,
    lat,
    lng,
    teamName,
    ageGroup,
    matchFormat,
    gender,
    level,
    editMode: "review",
  });

  const teamBackParams = new URLSearchParams({
  name: clubName,
  country,
  county,
  city,
  lat,
  lng,
  teamName,
  ageGroup,
  matchFormat,
  gender,
  level,
});

const teamEditParams = new URLSearchParams({
  name: clubName,
  country,
  county,
  city,
  lat,
  lng,
  teamName,
  ageGroup,
  matchFormat,
  gender,
  level,
  editMode: "review",
});

  const setupData = {
    clubName,
    country,
    county,
    city,
    lat,
    lng,
    teamName,
    ageGroup,
    matchFormat,
    gender,
    level,
  };

  const teamDetails = [
    {
      label: "Team name",
      value: teamName,
    },
    {
      label: "Age group",
      value: ageGroup,
    },
    {
      label: "Match format",
      value: matchFormat,
    },
    {
      label: "Category",
      value: gender,
    },
    {
      label: "Team level",
      value: level,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-12 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/clubs/create/team?${teamBackParams.toString()}`}
            aria-label="Back to team setup"
            className="flex h-10 w-10 items-center justify-center text-2xl text-slate-700 transition hover:text-slate-950 active:scale-95"
          >
            ‹
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

        {/* Progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#00B83F]">
              Review setup
            </span>

            <span className="text-slate-400">
              Step 3
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-full rounded-full bg-[#00B83F]" />
          </div>
        </div>

        {/* Heading */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Ready to go?
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Check your club and team details before creating your MatchUp
            profile.
          </p>
        </div>

        {/* Club card */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">
              Club
            </h2>

            <Link
              href={`/clubs/create/team?${teamEditParams.toString()}`}
              aria-label="Edit club details"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B83F] transition hover:text-[#009F37] active:scale-[0.98]"
            >
              <Pencil
                size={14}
                strokeWidth={2.25}
                aria-hidden="true"
              />
              Edit
            </Link>
          </div>

          <div className="mt-5">
            <p className="font-semibold text-slate-950">
              {clubName}
            </p>

            <p className="mt-1.5 text-sm leading-5 text-slate-500">
              {[city, county].filter(Boolean).join(", ")}
            </p>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {country}
            </p>
          </div>
        </section>

        {/* Team card */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-950">
              Team
            </h2>

            <Link
              href={`/clubs/create/team?${teamParams.toString()}`}
              aria-label="Edit team details"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B83F] transition hover:text-[#009F37] active:scale-[0.98]"
            >
              <Pencil
                size={14}
                strokeWidth={2.25}
                aria-hidden="true"
              />
              Edit
            </Link>
          </div>

          <dl className="mt-5 space-y-3.5">
            {teamDetails.map((detail) => (
              <div
                key={detail.label}
                className="grid grid-cols-[1fr_auto] items-center gap-6"
              >
                <dt className="text-sm text-slate-500">
                  {detail.label}
                </dt>

                <dd className="text-right text-sm font-medium text-slate-950">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Final action */}
        <CompleteSetupForm
          action={completeSetupAction}
          data={setupData}
        />

        <p className="mt-4 pb-4 text-center text-xs leading-5 text-slate-500">
          You can update these details later from your profile.
        </p>
      </div>
    </main>
  );
}
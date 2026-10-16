import Image from "next/image";
import Link from "next/link";

import { continueToReviewAction } from "./actions";
import { CreateTeamForm } from "@/features/clubs/components/create-team-form";

type TeamDetailsPageProps = {
  searchParams: Promise<{
    name?: string;
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

    editMode?: string;
  }>;
};

export default async function TeamDetailsPage({
  searchParams,
}: TeamDetailsPageProps) {
  const params = await searchParams;

  const clubName = params.name ?? "";
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

  const editMode = params.editMode ?? "";

  const isEditingFromReview =
    editMode === "review";

  /*
   * Normal Step 2 back destination.
   */
  const clubParams = new URLSearchParams({
    name: clubName,
    country,
    county,
    city,
    lat,
    lng,
  });

  /*
   * Edit-mode Back destination.
   *
   * These are the ORIGINAL team values from Review.
   * Therefore Back cancels any unsaved changes.
   */
  const reviewParams = new URLSearchParams({
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
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={
              isEditingFromReview
                ? `/clubs/create/review?${reviewParams.toString()}`
                : `/clubs/create?${clubParams.toString()}`
            }
            aria-label={
              isEditingFromReview
                ? "Back to review"
                : "Back to club setup"
            }
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
              {isEditingFromReview
                ? "Edit team"
                : "Team setup"}
            </span>

            <span className="text-slate-400">
              {isEditingFromReview
                ? "Review"
                : "Step 2"}
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className={
                isEditingFromReview
                  ? "h-full w-full rounded-full bg-[#00B83F]"
                  : "h-full w-2/3 rounded-full bg-[#00B83F]"
              }
            />
          </div>
        </div>

        {/* Heading */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEditingFromReview
              ? "Edit team details"
              : "Tell us about your team"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isEditingFromReview ? (
              <>
                Update your team details before returning to review.
              </>
            ) : (
              <>
                Add the team you manage at{" "}
                <span className="font-medium text-slate-700">
                  {clubName}
                </span>
                .
              </>
            )}
          </p>
        </div>

        {/* Form */}
        <CreateTeamForm
          action={continueToReviewAction}
          clubName={clubName}
          country={country}
          county={county}
          city={city}
          lat={lat}
          lng={lng}
          initialTeamName={teamName}
          initialAgeGroup={ageGroup}
          initialMatchFormat={matchFormat}
          initialGender={gender}
          initialLevel={level}
          submitLabel={
            isEditingFromReview
              ? "Save changes"
              : "Continue"
          }
        />
      </div>
    </main>
  );
}
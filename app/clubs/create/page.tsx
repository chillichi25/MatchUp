import Image from "next/image";
import Link from "next/link";

import { continueToTeamAction } from "./actions";
import { CreateClubForm } from "@/features/clubs/components/create-club-form";

type CreateClubPageProps = {
  searchParams: Promise<{
    name?: string;
    country?: string;
    county?: string;
    city?: string;
    lat?: string;
    lng?: string;

    // Team values preserved when editing from Review.
    teamName?: string;
    ageGroup?: string;
    matchFormat?: string;
    gender?: string;
    level?: string;

    editMode?: string;
  }>;
};

export default async function CreateClubPage({
  searchParams,
}: CreateClubPageProps) {
  const params = await searchParams;

  const initialName =
    params.name ?? "";

  const country =
    params.country ?? "";

  const county =
    params.county ?? "";

  const city =
    params.city ?? "";

  const lat =
    params.lat ?? "";

  const lng =
    params.lng ?? "";

  const teamName =
    params.teamName ?? "";

  const ageGroup =
    params.ageGroup ?? "";

  const matchFormat =
    params.matchFormat ?? "";

  const gender =
    params.gender ?? "";

  const level =
    params.level ?? "";

  const editMode =
    params.editMode ?? "";

  const isEditingFromReview =
    editMode === "review";

  const hasLocation = Boolean(
    city &&
      country &&
      lat &&
      lng
  );

  const initialLocation = hasLocation
    ? {
        city,
        county,
        country,
        lat: Number(lat),
        lng: Number(lng),
        formatted: [
          city,
          county,
          country,
        ]
          .filter(Boolean)
          .join(", "),
      }
    : null;

  /*
   * Build the Review URL using the ORIGINAL values.
   *
   * If the coach presses Back without saving,
   * they return to Review with everything exactly
   * as it was before.
   */
  const reviewParams = new URLSearchParams({
    clubName: initialName,
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

  /*
   * Bind the navigation context to the server action.
   *
   * This means CreateClubForm itself does not need
   * to know anything about Review/Edit mode.
   */
  const clubFormAction =
    continueToTeamAction.bind(null, {
      editMode,
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
                : "/clubs"
            }
            aria-label={
              isEditingFromReview
                ? "Back to review"
                : "Back to club options"
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
                ? "Edit club"
                : "Club setup"}
            </span>

            <span className="text-slate-400">
              {isEditingFromReview
                ? "Review"
                : "Step 1"}
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className={
                isEditingFromReview
                  ? "h-full w-full rounded-full bg-[#00B83F]"
                  : "h-full w-1/3 rounded-full bg-[#00B83F]"
              }
            />
          </div>
        </div>

        {/* Heading */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEditingFromReview
              ? "Edit club details"
              : "Create your club"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isEditingFromReview
              ? "Update your club details before returning to review."
              : "Tell us a few details about your football club."}
          </p>
        </div>

        <CreateClubForm
  action={clubFormAction}
  initialName={initialName}
  initialLocation={initialLocation}
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
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  Building2,
  Clock3,
  MapPin,
} from "lucide-react";

import {
  getMyClub,
  getPendingClubRequest,
} from "@/features/clubs/services/club.service";

export default async function ClubPendingPage() {
  const [myClub, pendingRequest] = await Promise.all([
    getMyClub(),
    getPendingClubRequest(),
  ]);

  // The coach now has an active team,
  // so onboarding is complete.
  if (myClub) {
    redirect("/dashboard");
  }

  // No active team and no pending request.
  if (!pendingRequest) {
    redirect("/clubs");
  }

  const { club } = pendingRequest;

  const location = [
    club.city,
    club.county,
  ]
    .filter(Boolean)
    .join(", ");

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
        <div className="mt-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Clock3
              size={28}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Awaiting approval
          </h1>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
            Your request to join {club.name} is
            waiting for approval.
          </p>
        </div>

        {/* Club card */}
        <section className="mt-7 rounded-3xl border border-gray-200 bg-white px-5 py-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-gray-50">
  {club.badge_url ? (
    <Image
      src={club.badge_url}
      alt={`${club.name} badge`}
      width={64}
      height={64}
      className="h-full w-full object-contain p-1.5"
    />
  ) : (
    <Building2
      size={26}
      strokeWidth={1.7}
      className="text-slate-400"
      aria-hidden="true"
    />
  )}
</div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-slate-950">
                {club.name}
              </h2>

              {location && (
                <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
                  <MapPin
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 text-slate-400"
                    aria-hidden="true"
                  />

                  <span className="truncate">
                    {location}
                  </span>
                </div>
              )}

              {club.country && (
                <p className="mt-1 text-sm text-slate-400">
                  {club.country}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Clock3
                  size={19}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-slate-950">
                  Request pending
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  A club owner or admin will review
                  your request.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
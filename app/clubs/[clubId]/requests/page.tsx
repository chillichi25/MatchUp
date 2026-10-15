import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  Clock3,
  UserRound,
} from "lucide-react";

import {
  canManageClubMemberships,
  getClubById,
  getPendingClubJoinRequests,
} from "@/features/clubs/services/club.service";

import {
  approveClubJoinRequestAction,
} from "./actions";

type ClubRequestsPageProps = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function ClubRequestsPage({
  params,
}: ClubRequestsPageProps) {
  const { clubId } = await params;

  const [club, canManage] = await Promise.all([
  getClubById(clubId),
  canManageClubMemberships(clubId),
]);

if (!club || !canManage) {
  notFound();
}

const requests =
  await getPendingClubJoinRequests(clubId);

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="flex h-10 w-10 items-center justify-center text-slate-700 transition hover:text-slate-950 active:scale-95"
          >
            <ArrowLeft
              size={22}
              strokeWidth={2}
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
            Join requests
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review coaches who want to join{" "}
            {club.name}.
          </p>
        </div>

        {/* Empty state */}
        {requests.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-slate-400">
              <UserRound
                size={24}
                strokeWidth={1.8}
              />
            </div>

            <h2 className="mt-4 font-semibold text-slate-950">
              No pending requests
            </h2>

            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
              New requests to join your club will
              appear here.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-3">
            {requests.map((request) => {
              const name = [
  request.first_name,
  request.last_name,
]
  .filter(Boolean)
  .join(" ");

              return (
                <div
                  key={request.membership_id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
                      <UserRound
                        size={21}
                        strokeWidth={2}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-950">
                        {name || "Coach"}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Clock3
                          size={14}
                          className="shrink-0"
                        />

                        <span>
                          Waiting for approval
                        </span>
                      </div>
                    </div>
                  </div>

                  <form
  action={async () => {
    "use server";

    await approveClubJoinRequestAction(
      request.membership_id,
      clubId
    );
  }}
  className="mt-4 border-t border-gray-100 pt-4"
>
  <button
    type="submit"
    className="flex h-11 w-full items-center justify-center rounded-xl bg-[#00B83F] text-sm font-semibold text-white transition hover:bg-[#009F37] active:scale-[0.98]"
  >
    Approve
  </button>
</form>
                </div>
              );
            })}
          </div>
        )}

        {/* Club context */}
        <div className="mt-7 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Building2 size={15} />
          <span>{club.name}</span>
        </div>
      </div>
    </main>
  );
}
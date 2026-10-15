import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Check,
  Shield,
  Users,
} from "lucide-react";

import {
  canManageClubMemberships,
  getClubById,
  getPendingTeamJoinRequests,
} from "@/features/clubs/services/club.service";

import {
  approveTeamJoinRequestAction,
} from "./actions";

type TeamRequestsPageProps = {
  params: Promise<{
    clubId: string;
  }>;
};

export default async function TeamRequestsPage({
  params,
}: TeamRequestsPageProps) {
  const { clubId } = await params;

  const [club, canManage] =
    await Promise.all([
      getClubById(clubId),
      canManageClubMemberships(clubId),
    ]);

  if (!club || !canManage) {
    notFound();
  }

  const requests =
    await getPendingTeamJoinRequests(clubId);

  return (
    <main className="min-h-screen bg-gray-50 px-6 pb-10 pt-8">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/clubs"
            aria-label="Back"
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
            Team requests
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review coaches requesting access to
            teams at {club.name}.
          </p>
        </div>

        {/* Requests */}
        <section className="mt-8">
          {requests.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
                <Check
                  size={25}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-950">
                No pending requests
              </h2>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                You&apos;re all caught up.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const name = [
                  request.first_name,
                  request.last_name,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <article
                    key={request.membership_id}
                    className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    {/* Coach */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-slate-600">
                        <Users
                          size={21}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-slate-950">
                          {name || "Coach"}
                        </h2>

                        <p className="mt-0.5 text-sm capitalize text-slate-500">
                          {request.role}
                        </p>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
                        <Shield
                          size={19}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {request.team_name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {[
                            request.age_group,
                            request.gender,
                            request.match_format,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      </div>
                    </div>

                    {/* Approve */}
                    <form
                      action={async () => {
                        "use server";

                        await approveTeamJoinRequestAction(
                          request.membership_id,
                          clubId
                        );
                      }}
                      className="mt-5 border-t border-gray-100 pt-5"
                    >
                      <button
                        type="submit"
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] text-sm font-semibold text-white transition hover:bg-[#009F37] active:scale-[0.99]"
                      >
                        Approve
                      </button>
                    </form>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
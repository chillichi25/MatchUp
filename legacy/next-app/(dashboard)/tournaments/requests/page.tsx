import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  CircleCheck,
  CircleX,
  MapPin,
  Shield,
  Trophy,
} from "lucide-react";

import { getIncomingTournamentRequests } from "@/features/tournaments/services/incoming-tournament-request.service";
import { TournamentRequestActions } from "@/features/tournaments/components/tournament-request-actions";

import {
  acceptTournamentRequestAction,
  declineTournamentRequestAction,
} from "./actions";

export default async function TournamentRequestsPage() {
  const requests =
    await getIncomingTournamentRequests();

  const pendingRequests = requests.filter(
    (request: any) =>
      request.status === "pending"
  );

  const historyRequests = requests.filter(
  (request) =>
    request.status === "accepted" ||
    request.status === "declined" ||
    request.status === "removed" ||
    request.status === "withdrawn" ||
    request.status === "cancelled" ||
    request.status === "expired"
);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}
      <header className="relative flex items-center justify-center">
        <Link
          href="/matches?type=tournaments"
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          Tournament Requests
        </h1>
      </header>

      {/* Pending */}
      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Pending
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
            <Trophy
              size={32}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold text-slate-900">
              No pending requests
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              New tournament requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request: any) => {
              const team = Array.isArray(
                request.teams
              )
                ? request.teams[0]
                : request.teams;

              const club = Array.isArray(
                team?.clubs
              )
                ? team.clubs[0]
                : team?.clubs;

              const tournament = Array.isArray(
                request.tournaments
              )
                ? request.tournaments[0]
                : request.tournaments;

              const formattedDate =
                tournament?.start_date
                  ? new Intl.DateTimeFormat(
                      "en-GB",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }
                    ).format(
                      new Date(
                        `${tournament.start_date}T00:00:00`
                      )
                    )
                  : "";

              return (
                <div
                  key={request.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  {/* Team */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {club?.badge_url ? (
                        <img
                          src={club.badge_url}
                          alt={`${club.name} badge`}
                          className="h-12 w-12 shrink-0 object-contain"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                          <Shield
                            size={18}
                            className="text-slate-500"
                          />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-900">
                          {club?.name ?? "Club"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {team?.name ?? "Team"}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  </div>

                  {/* Tournament */}
                  <div className="mt-4 rounded-xl bg-violet-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Trophy
                        size={16}
                        className="text-violet-600"
                      />

                      <p className="text-sm font-semibold text-slate-900">
                        {tournament?.name ??
                          "Tournament"}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {formattedDate}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} />
                        {tournament?.location}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <div className="mt-4 rounded-xl bg-[#F5F6F8] px-4 py-3">
                      <p className="text-sm leading-6 text-slate-700">
                        {request.message}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <TournamentRequestActions
  requestId={request.id}
/>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* History */}
      {historyRequests.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            History
          </h2>

          <div className="space-y-3">
            {historyRequests.map((request: any) => {
              const team = Array.isArray(
                request.teams
              )
                ? request.teams[0]
                : request.teams;

              const club = Array.isArray(
                team?.clubs
              )
                ? team.clubs[0]
                : team?.clubs;

              const tournament = Array.isArray(
                request.tournaments
              )
                ? request.tournaments[0]
                : request.tournaments;

              return (
                <div
                  key={request.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {club?.badge_url ? (
                        <img
                          src={club.badge_url}
                          alt={`${club.name} badge`}
                          className="h-11 w-11 shrink-0 object-contain"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                          <Shield
                            size={17}
                            className="text-slate-500"
                          />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">
                          {club?.name ?? "Club"}
                        </h3>

                        <p className="mt-0.5 text-sm text-slate-500">
                          {team?.name ?? "Team"}
                        </p>

                        <p className="mt-2 truncate text-xs font-medium text-violet-600">
                          {tournament?.name}
                        </p>
                      </div>
                    </div>

                    {request.status ===
                      "accepted" && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        <CircleCheck
                          size={13}
                          strokeWidth={2.5}
                        />
                        Accepted
                      </span>
                    )}

                    {request.status ===
                      "declined" && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                        <CircleX
                          size={13}
                          strokeWidth={2.5}
                        />
                        Declined
                      </span>
                    )}

                    {request.status === "cancelled" && (
  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
    Cancelled
  </span>
)}

{request.status === "expired" && (
  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
    Expired
  </span>
)}

</div>

{request.status === "expired" && (
  <p className="text-xs text-slate-500">
    Tournament ended before your request was accepted
  </p>
)}

{request.status === "cancelled" && (
  <p className="mt-1 text-xs text-slate-500">
    Tournament cancelled by organiser
  </p>
)}
                  
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
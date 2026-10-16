import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  CircleX,
  MapPin,
  Shield,
} from "lucide-react";

import { getIncomingRequests } from "@/features/friendlies/services/incoming-request.service";

export default async function RequestsPage() {
  const requests = await getIncomingRequests();

  const pendingRequests = requests.filter(
    (request: any) => request.status === "pending"
  );

  const historyRequests = requests.filter(
  (request: any) =>
    request.status === "accepted" ||
    request.status === "declined" ||
    request.status === "expired"
);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}
      <header className="relative flex items-center justify-center">
        <Link
          href="/matches?type=friendlies"
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          Friendly Requests
        </h1>
      </header>

      {/* Pending */}
      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Pending
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
            <h3 className="font-bold text-slate-900">
              No pending requests
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              You're all caught up.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request: any) => {
              const requestingTeam = Array.isArray(
                request.teams
              )
                ? request.teams[0]
                : request.teams;

              const requestingClub = Array.isArray(
                requestingTeam?.clubs
              )
                ? requestingTeam.clubs[0]
                : requestingTeam?.clubs;

              const friendly = Array.isArray(
                request.friendlies
              )
                ? request.friendlies[0]
                : request.friendlies;

              const formattedDate =
                friendly?.match_date
                  ? new Intl.DateTimeFormat(
                      "en-GB",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }
                    ).format(
                      new Date(
                        `${friendly.match_date}T00:00:00`
                      )
                    )
                  : "";

              return (
                <Link
                  key={request.id}
                  href={`/friendlies/requests/${request.id}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
                >
                  {/* Team Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {requestingClub?.badge_url ? (
                        <img
                          src={requestingClub.badge_url}
                          alt={`${requestingClub.name} badge`}
                          className="h-12 w-12 shrink-0 object-contain"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                            <Shield
                              size={17}
                              strokeWidth={1.8}
                              className="text-slate-500"
                            />
                          </div>
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate font-bold leading-tight text-slate-900">
                          {requestingClub?.name ?? "Club"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {requestingTeam?.name ?? "Team"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Pending
                      </span>

                      <ChevronRight
                        size={17}
                        strokeWidth={2}
                        className="text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        className="text-slate-500"
                      />

                      <span>
                        {formattedDate}
                        {friendly?.kick_off_time &&
                          ` · ${friendly.kick_off_time.slice(
                            0,
                            5
                          )}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin
                        size={16}
                        className="text-slate-500"
                      />

                      <span>
                        {friendly?.location ?? ""}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <div className="mt-4 rounded-xl bg-[#F5F6F8] px-4 py-2.5">
                      <p className="text-sm leading-5 text-slate-600">
                        {request.message}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* History */}
      {historyRequests.length > 0 && (
        <section className="mt-9">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            History
          </h2>

          <div className="space-y-3">
            {historyRequests.map((request: any) => {
              const requestingTeam = Array.isArray(
                request.teams
              )
                ? request.teams[0]
                : request.teams;

              const requestingClub = Array.isArray(
                requestingTeam?.clubs
              )
                ? requestingTeam.clubs[0]
                : requestingTeam?.clubs;

              const friendly = Array.isArray(
                request.friendlies
              )
                ? request.friendlies[0]
                : request.friendlies;

              const formattedDate =
                friendly?.match_date
                  ? new Intl.DateTimeFormat(
                      "en-GB",
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }
                    ).format(
                      new Date(
                        `${friendly.match_date}T00:00:00`
                      )
                    )
                  : "";

              return (
                <Link
                  key={request.id}
                  href={`/friendlies/requests/${request.id}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
                >
                  {/* Team Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {requestingClub?.badge_url ? (
                        <img
                          src={requestingClub.badge_url}
                          alt={`${requestingClub.name} badge`}
                          className="h-12 w-12 shrink-0 object-contain"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white">
                            <Shield
                              size={17}
                              strokeWidth={1.8}
                              className="text-slate-500"
                            />
                          </div>
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold leading-tight text-slate-900">
                          {requestingClub?.name ?? "Club"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {requestingTeam?.name ?? "Team"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {request.status === "accepted" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          <CircleCheck
                            size={13}
                            strokeWidth={2.5}
                          />
                          Accepted
                        </span>
                      )}

                      {request.status === "declined" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          <CircleX
                            size={13}
                            strokeWidth={2.5}
                          />
                          Declined
                        </span>
                      )}

                      {request.status === "expired" && (
  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
    Expired
  </span>
)}

                      <ChevronRight
                        size={17}
                        strokeWidth={2}
                        className="text-slate-300"
                      />
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="mt-3 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} />

                      <span>
                        {formattedDate}
                        {friendly?.kick_off_time &&
                          ` · ${friendly.kick_off_time.slice(
                            0,
                            5
                          )}`}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-2">
                      <MapPin size={15} />

                      <span>
                        {friendly?.location ?? ""}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
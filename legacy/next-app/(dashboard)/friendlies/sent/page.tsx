import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock3,
  MapPin,
  Shield,
} from "lucide-react";

import {
  getOutgoingFriendlyRequestHistory,
  getOutgoingFriendlyRequests,
} from "@/features/friendlies/services/outgoing-requests.service";

export default async function SentFriendlyRequestsPage() {
  const [requests, history] = await Promise.all([
    getOutgoingFriendlyRequests(),
    getOutgoingFriendlyRequestHistory(),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-6 pb-32 pt-8">
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
      <section className="mt-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Awaiting response
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Track friendly requests you&apos;ve sent to other teams.
        </p>
      </section>

      {/* Pending Requests */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">
            Sent requests
          </h2>

          <span className="text-sm text-slate-400">
            {requests.length}
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="mt-3 rounded-3xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
              <Clock3
                size={25}
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 font-bold text-slate-950">
              No requests waiting
            </h3>

            <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-slate-500">
              Friendly requests waiting for a response will appear here.
            </p>

            <Link
              href="/friendlies"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#00B83F] px-5 text-sm font-semibold text-white transition hover:bg-[#009F37] active:scale-[0.98]"
            >
              Find matches
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            {requests.map((request) => {
              const friendly = Array.isArray(request.friendlies)
                ? request.friendlies[0]
                : request.friendlies;

              if (!friendly) {
                return null;
              }

              const opponentTeam = Array.isArray(friendly.teams)
                ? friendly.teams[0]
                : friendly.teams;

              if (!opponentTeam) {
                return null;
              }

              const opponentClub = Array.isArray(opponentTeam.clubs)
                ? opponentTeam.clubs[0]
                : opponentTeam.clubs;

              if (!opponentClub) {
                return null;
              }

              const requestingTeam = Array.isArray(request.teams)
                ? request.teams[0]
                : request.teams;

              const formattedDate = new Intl.DateTimeFormat(
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
              );

              const formattedTime =
                friendly.kick_off_time?.slice(0, 5) ?? "";

              return (
                <Link
                  key={request.id}
                  href={`/friendlies/requests/${request.id}`}
                  className="block rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-50 text-[#00B83F]">
                      {opponentClub.badge_url ? (
                        <Image
                          src={opponentClub.badge_url}
                          alt={`${opponentClub.name} badge`}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Shield
                          size={21}
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-950">
                            {opponentClub.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {opponentTeam.name}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
                          Pending
                        </span>
                      </div>

                      <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2.5 text-sm text-slate-500">
                          <CalendarDays
                            size={16}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                          <span>{formattedDate}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-sm text-slate-500">
                          <Clock3
                            size={16}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                          <span>{formattedTime}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-sm text-slate-500">
                          <MapPin
                            size={16}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                          <span>{friendly.location}</span>
                        </div>
                      </div>

                      {requestingTeam && (
                        <p className="mt-4 text-xs text-slate-400">
                          Your team:{" "}
                          <span className="font-semibold text-slate-600">
                            {requestingTeam.name}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500">
              History
            </h2>

            <span className="text-sm text-slate-400">
              {history.length}
            </span>
          </div>

          <div className="mt-3 space-y-4">
            {history.map((request) => {
              const friendly = Array.isArray(request.friendlies)
                ? request.friendlies[0]
                : request.friendlies;

              if (!friendly) {
                return null;
              }

              const opponentTeam = Array.isArray(friendly.teams)
                ? friendly.teams[0]
                : friendly.teams;

              if (!opponentTeam) {
                return null;
              }

              const opponentClub = Array.isArray(opponentTeam.clubs)
                ? opponentTeam.clubs[0]
                : opponentTeam.clubs;

              if (!opponentClub) {
                return null;
              }

              const formattedDate = new Intl.DateTimeFormat(
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
              );

              const formattedTime =
                friendly.kick_off_time?.slice(0, 5) ?? "";

              return (
                <Link
                  key={request.id}
                  href={`/friendlies/requests/${request.id}`}
                  className="block rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-50 text-slate-500">
                      {opponentClub.badge_url ? (
                        <Image
                          src={opponentClub.badge_url}
                          alt={`${opponentClub.name} badge`}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Shield
                          size={21}
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-950">
                            {opponentClub.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {opponentTeam.name}
                          </p>
                        </div>

                        {request.status === "accepted" && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <CircleCheck
                              size={13}
                              strokeWidth={2.5}
                            />
                            Accepted
                          </span>
                        )}

                        {request.status === "declined" && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            <CircleX
                              size={13}
                              strokeWidth={2.5}
                            />
                            Declined
                          </span>
                        )}

                        {request.status === "cancelled" && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            <CircleX
                              size={13}
                              strokeWidth={2.5}
                            />
                            Cancelled
                          </span>
                        )}
                      </div>

                      {request.status === "expired" && (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
    <Clock3
      size={13}
      strokeWidth={2.2}
    />
    Expired
  </span>
)}

                      <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2.5 text-sm text-slate-500">
                          <CalendarDays
                            size={16}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                          <span>{formattedDate}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-sm text-slate-500">
                          <Clock3
                            size={16}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                          <span>{formattedTime}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-sm text-slate-500">
                          <MapPin
                            size={16}
                            className="text-slate-400"
                            aria-hidden="true"
                          />
                          <span>{friendly.location}</span>
                        </div>
                      </div>
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
import Link from "next/link";

import {
  CalendarDays,
  MapPin,
  Trophy,
} from "lucide-react";

type NextTournamentCardProps = {
  tournamentId: string;
  name: string;
  ageGroup?: string | null;
  startDate: string;
  startTime?: string | null;
  endDate?: string | null;
  endTime?: string | null;
  location?: string | null;
};

export function NextTournamentCard({
  tournamentId,
  name,
  ageGroup,
  startDate,
  startTime,
  endDate,
  endTime,
  location,
}: NextTournamentCardProps) {
  const formattedStartDate =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        weekday: "short",
        day: "numeric",
        month: "short",
      }
    ).format(
      new Date(
        `${startDate}T00:00:00`
      )
    );

  const formattedEndDate =
    endDate
      ? new Intl.DateTimeFormat(
          "en-GB",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
          }
        ).format(
          new Date(
            `${endDate}T00:00:00`
          )
        )
      : null;

  const start =
    startTime?.slice(0, 5) ??
    null;

  const end =
    endTime?.slice(0, 5) ??
    null;

  return (
    <div className="mt-4 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
          <Trophy
            size={27}
            className="text-violet-600"
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            Tournament
          </span>

          <h3 className="mt-1 text-lg font-bold text-slate-950">
            {name}
          </h3>

          {ageGroup && (
            <p className="mt-1 text-sm text-slate-500">
              {ageGroup}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-3 text-sm text-slate-600">
          <CalendarDays
            size={18}
            className="mt-0.5 shrink-0"
          />

          <span>
            {formattedStartDate}

            {start
              ? ` · ${start}`
              : ""}

            {formattedEndDate &&
              formattedEndDate !==
                formattedStartDate
              ? ` – ${formattedEndDate}`
              : ""}

            {end
              ? ` · ${end}`
              : ""}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-600">
          <MapPin size={18} />

          <span>
            {location ||
              "Location TBC"}
          </span>
        </div>
      </div>

      <Link
        href={`/tournaments/${tournamentId}`}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white"
      >
        View Tournament
      </Link>
    </div>
  );
}
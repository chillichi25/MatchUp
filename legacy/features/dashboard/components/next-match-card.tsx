import Link from "next/link";

import {
  Clock3,
  MapPin,
  MessageCircle,
} from "lucide-react";

import { ClubAvatar } from "@/components/ui/club-avatar";

type Team = {
  clubName: string;
  name: string;
  badgeUrl?: string | null;
};

type NextMatchCardProps = {
  matchId: string;
  conversationId?: string | null;
  matchDate: string;
  kickOff: string;
  location?: string | null;
  homeTeam: Team;
  awayTeam: Team;
};

export function NextMatchCard({
  matchId,
  conversationId,
  matchDate,
  kickOff,
  location,
  homeTeam,
  awayTeam,
}: NextMatchCardProps) {
  const date = new Date(
    `${matchDate}T00:00:00`
  );

  const weekday = date
    .toLocaleDateString("en-GB", {
      weekday: "short",
    })
    .toUpperCase();

  const day = date.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
    }
  );

  const month = date
    .toLocaleDateString("en-GB", {
      month: "short",
    })
    .toUpperCase();

  const formattedKickOff =
    kickOff?.slice(0, 5) || "TBC";

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* MATCH */}

      <div className="grid grid-cols-[1fr_64px_1fr] items-center px-3 pb-3 pt-4">

        {/* HOME TEAM */}

        <div className="flex min-w-0 flex-col items-center text-center">
          <ClubAvatar
            badgeUrl={homeTeam.badgeUrl}
            clubName={homeTeam.clubName}
            size="sm"
          />

          <p className="mt-1 text-[11px] font-medium text-slate-500">
            {homeTeam.name}
          </p>

          <p className="mt-0.5 line-clamp-2 text-[13px] font-bold leading-[15px] text-slate-950">
            {homeTeam.clubName}
          </p>
        </div>

        {/* DATE + VS */}

        <div className="flex h-full flex-col items-center justify-center text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {weekday}
          </span>

          <span className="mt-0.5 text-[27px] font-bold leading-none text-[#00B83F]">
            {day}
          </span>

          <span className="mt-1 text-[10px] font-semibold uppercase text-slate-500">
            {month}
          </span>

          <span className="mt-2 text-[12px] font-bold text-slate-700">
            VS
          </span>
        </div>

        {/* AWAY TEAM */}

        <div className="flex min-w-0 flex-col items-center text-center">
          <ClubAvatar
            badgeUrl={awayTeam.badgeUrl}
            clubName={awayTeam.clubName}
            size="sm"
          />

          <p className="mt-1 text-[11px] font-medium text-slate-500">
            {awayTeam.name}
          </p>

          <p className="mt-0.5 line-clamp-2 text-[13px] font-bold leading-[15px] text-slate-950">
            {awayTeam.clubName}
          </p>
        </div>

      </div>

      {/* TIME + LOCATION */}

      <div className="mx-4 flex items-center justify-center gap-8 border-t border-slate-100 py-2.5 text-[12px] font-medium text-slate-500">

        {/* TIME */}

        <div className="flex items-center gap-1.5">
          <Clock3
            size={15}
            strokeWidth={2}
          />

          <span>
            {formattedKickOff}
          </span>
        </div>

        {/* LOCATION */}

        <div className="flex min-w-0 items-center gap-1.5">
          <MapPin
            size={15}
            strokeWidth={2}
            className="shrink-0"
          />

          <span className="truncate">
            {location ||
              "Location TBC"}
          </span>
        </div>

      </div>

      {/* ACTION BUTTONS */}

      <div className="grid grid-cols-2 gap-2 px-3 pb-3">

        {/* VIEW MATCH */}

        <Link
          href={`/matches/${matchId}`}
          className="flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white text-[13px] font-semibold text-slate-950 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          View Match
        </Link>

        {/* OPEN CHAT */}

        {conversationId ? (
          <Link
            href={`/chat/${conversationId}`}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#00B83F] text-[13px] font-semibold text-white transition hover:bg-[#00A638] active:scale-[0.98]"
          >
            <MessageCircle
              size={17}
              strokeWidth={2}
            />

            Open Chat
          </Link>
        ) : (
          <div className="flex h-10 items-center justify-center gap-2 rounded-full bg-slate-100 text-[13px] font-semibold text-slate-400">
            <MessageCircle
              size={17}
              strokeWidth={2}
            />

            Open Chat
          </div>
        )}

      </div>

    </div>
  );
}
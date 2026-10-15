import Link from "next/link";
import { CalendarDays, MapPin, MessageCircle } from "lucide-react";

import type { MatchTeam } from "../types";

type MatchCardProps = {
  matchId: string;
  opponent: MatchTeam;
  matchDate: string;
  kickOffTime: string;
  location: string;
  conversationId?: string;
};

export function MatchCard({
  matchId,
  opponent,
  matchDate,
  kickOffTime,
  location,
  conversationId,
}: MatchCardProps){
  const club = Array.isArray(opponent.clubs)
    ? opponent.clubs[0]
    : opponent.clubs;

  const formattedDate = new Date(matchDate).toLocaleDateString(
    "en-GB",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    }
  );

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-bold">
            {club?.name}
          </h2>

          <p className="text-slate-500">
            {opponent.name}
          </p>

        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Scheduled
        </span>

      </div>

      <div className="mt-5 flex items-center gap-2 text-slate-600">
        <CalendarDays size={18} />
        {formattedDate} • {kickOffTime.slice(0, 5)}
      </div>

      <div className="mt-3 flex items-center gap-2 text-slate-600">
        <MapPin size={18} />
        {location}
      </div>

      <div className="mt-6 flex gap-3">

  <Link
    href={`/matches/${matchId}`}
    className="flex-1 rounded-2xl border border-gray-300 bg-white py-3 text-center font-semibold"
  >
    View Details
  </Link>

  {conversationId && (
    <Link
      href={`/chat/${conversationId}`}
      className="flex-1 rounded-2xl bg-[#00B83F] py-3 text-center font-semibold text-white"
    >
      Open Chat
    </Link>
  )}

</div>
    </div>
  );
}
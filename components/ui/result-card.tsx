import Image from "next/image";
import Link from "next/link";

import {
  ChevronRight,
  Shield,
} from "lucide-react";

type ResultCardProps = {
  matchId: string;
  badgeUrl?: string | null;
  clubName: string;
  teamName: string;
  myScore: number;
  opponentScore: number;
  result: "win" | "draw" | "loss";
  matchDate?: string;
};

export function ResultCard({
  matchId,
  badgeUrl,
  clubName,
  teamName,
  myScore,
  opponentScore,
  result,
  matchDate,
}: ResultCardProps) {
  const resultStyles = {
    win: "bg-green-100 text-[#00A638]",
    draw: "bg-slate-100 text-slate-600",
    loss: "bg-red-100 text-red-500",
  };

  const resultLabels = {
    win: "Won",
    draw: "Draw",
    loss: "Lost",
  };

  const date = matchDate
    ? new Date(
        `${matchDate}T00:00:00`
      )
    : null;

  const weekday = date
    ? date
        .toLocaleDateString(
          "en-GB",
          {
            weekday: "short",
          }
        )
        .toUpperCase()
    : null;

  const day = date
    ? date.toLocaleDateString(
        "en-GB",
        {
          day: "numeric",
        }
      )
    : null;

  const month = date
    ? date
        .toLocaleDateString(
          "en-GB",
          {
            month: "short",
          }
        )
        .toUpperCase()
    : null;

  return (
    <Link
      href={`/matches/${matchId}?from=history`}
      className="block rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        {/* Date */}
        {date && (
          <div className="flex w-[42px] shrink-0 flex-col items-center justify-center rounded-xl bg-slate-50 py-1.5 text-center">
            <span className="text-[9px] font-semibold text-slate-500">
              {weekday}
            </span>

            <span className="text-[22px] font-bold leading-none text-[#00B83F]">
              {day}
            </span>

            <span className="mt-1 text-[9px] font-semibold text-slate-500">
              {month}
            </span>
          </div>
        )}

        {/* Opponent Badge */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center">
          {badgeUrl ? (
            <Image
              src={badgeUrl}
              alt={clubName}
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
            />
          ) : (
            <Shield
              size={27}
              strokeWidth={1.8}
              className="text-slate-300"
            />
          )}
        </div>

        {/* Opponent */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-bold text-slate-950">
            {clubName}
          </h3>

          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {teamName}
          </p>

          <span
            className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${resultStyles[result]}`}
          >
            {resultLabels[result]}
          </span>
        </div>

        {/* Score */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="whitespace-nowrap text-[15px] font-bold tracking-wide text-slate-950">
            <span
              className={
                result === "win"
                  ? "text-[#00B83F]"
                  : result ===
                      "loss"
                    ? "text-red-500"
                    : "text-slate-950"
              }
            >
              {myScore}
            </span>

            <span className="mx-1 text-slate-700">
              -
            </span>

            <span>
              {opponentScore}
            </span>
          </div>

          <ChevronRight
            size={18}
            strokeWidth={2}
            className="text-slate-400"
          />
        </div>
      </div>
    </Link>
  );
}
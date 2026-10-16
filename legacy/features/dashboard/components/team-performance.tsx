import Link from "next/link";

import {
  BarChart3,
  Handshake,
  ShieldX,
  Trophy,
} from "lucide-react";

type TeamPerformanceProps = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
};

export function TeamPerformance({
  played,
  wins,
  draws,
  losses,
}: TeamPerformanceProps) {
  const winRate =
    played === 0
      ? 0
      : Math.round(
          (wins / played) * 100
        );

  const radius = 52;

  const circumference =
    2 * Math.PI * radius;

  const progress =
    circumference -
    (winRate / 100) *
      circumference;

  return (
    <section className="mt-8">
      {/* Header */}

      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
          Team Performance
        </h2>

        <Link
          href="/statistics"
          className="flex items-center gap-1 text-[13px] font-semibold text-[#00B83F]"
        >
          View all

          <span aria-hidden="true">
            ›
          </span>
        </Link>
      </div>

      {/* Card */}

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 pb-3.5 pt-4 shadow-sm">
        {/* Win Rate Circle */}

        <div className="flex flex-col items-center">
          <div className="relative flex h-[120px] w-[120px] items-center justify-center">
            <svg
              viewBox="0 0 120 120"
              className="h-full w-full -rotate-90"
              aria-hidden="true"
            >
              {/* Background Circle */}

              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#DCFCE7"
                strokeWidth="9"
              />

              {/* Progress Circle */}

              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#00B83F"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={
                  circumference
                }
                strokeDashoffset={
                  progress
                }
                className="transition-all duration-500"
              />
            </svg>

            {/* Percentage */}

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[25px] font-bold tracking-tight text-slate-950">
                {winRate}%
              </span>
            </div>
          </div>

          <p className="-mt-0.5 text-[12px] font-medium text-slate-500">
            Win Rate
          </p>
        </div>

        {/* Divider */}

        <div className="my-3 h-px bg-slate-100" />

        {/* Statistics */}

        <div className="grid grid-cols-4">
          {/* Played */}

          <div className="flex flex-col items-center border-r border-slate-100 px-1 text-center">
            <BarChart3
              size={21}
              strokeWidth={2}
              className="text-slate-500"
            />

            <span className="mt-1.5 text-[15px] font-bold text-slate-950">
              {played}
            </span>

            <span className="mt-0.5 text-[10px] font-medium text-slate-500">
              Played
            </span>
          </div>

          {/* Wins */}

          <div className="flex flex-col items-center border-r border-slate-100 px-1 text-center">
            <Trophy
              size={21}
              strokeWidth={2}
              className="text-slate-500"
            />

            <span className="mt-1.5 text-[15px] font-bold text-slate-950">
              {wins}
            </span>

            <span className="mt-0.5 text-[10px] font-medium text-slate-500">
              Wins
            </span>
          </div>

          {/* Draws */}

          <div className="flex flex-col items-center border-r border-slate-100 px-1 text-center">
            <Handshake
              size={21}
              strokeWidth={2}
              className="text-slate-500"
            />

            <span className="mt-1.5 text-[15px] font-bold text-slate-950">
              {draws}
            </span>

            <span className="mt-0.5 text-[10px] font-medium text-slate-500">
              Draws
            </span>
          </div>

          {/* Losses */}

          <div className="flex flex-col items-center px-1 text-center">
            <ShieldX
              size={21}
              strokeWidth={2}
              className="text-slate-500"
            />

            <span className="mt-1.5 text-[15px] font-bold text-slate-950">
              {losses}
            </span>

            <span className="mt-0.5 text-[10px] font-medium text-slate-500">
              Losses
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
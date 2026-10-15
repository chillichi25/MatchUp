import Link from "next/link";

import {
  CalendarDays,
  ChevronRight,
  Plus,
  Trophy,
} from "lucide-react";

export function DashboardActions() {
  return (
    <section className="mt-6">
      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
        What would you like to do?
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3">

        {/* FIND A MATCH */}

        <Link
          href="/matches?type=friendlies"
          className="min-h-[140px] rounded-2xl border border-green-200 bg-green-50 p-4 text-left transition active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <CalendarDays
              size={31}
              strokeWidth={2.2}
              className="text-[#00B83F]"
            />

            <ChevronRight
              size={17}
              strokeWidth={2}
              className="mt-1 text-slate-500"
            />
          </div>

          <h3 className="mt-3 text-[13px] font-bold leading-[18px] text-slate-950">
            Find a Match
          </h3>

          <p className="mt-1 text-[11px] leading-[15px] text-slate-500">
            Find local teams
            <br />
            for friendlies
          </p>
        </Link>

        {/* FIND A TOURNAMENT */}

        <Link
          href="/matches?type=tournaments"
          className="min-h-[140px] rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left transition active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <Trophy
              size={31}
              strokeWidth={2.2}
              className="text-blue-600"
            />

            <ChevronRight
              size={17}
              strokeWidth={2}
              className="mt-1 text-slate-500"
            />
          </div>

          <h3 className="mt-3 text-[13px] font-bold leading-[18px] text-slate-950">
            Find a Tournament
          </h3>

          <p className="mt-1 text-[11px] leading-[15px] text-slate-500">
            Discover and enter
            <br />
            tournaments
          </p>
        </Link>

        {/* CREATE A MATCH */}

        <Link
          href="/create/friendly"
          className="min-h-[140px] rounded-2xl border border-green-100 bg-green-50/50 p-4 text-left transition active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-green-500 text-white">
              <Plus
                size={20}
                strokeWidth={2.3}
              />
            </div>

            <ChevronRight
              size={17}
              strokeWidth={2}
              className="mt-1 text-slate-500"
            />
          </div>

          <h3 className="mt-3 text-[13px] font-bold leading-[18px] text-slate-950">
            Create a Match
          </h3>

          <p className="mt-1 text-[11px] leading-[15px] text-slate-500">
            Post a friendly
            <br />
            match
          </p>
        </Link>

        {/* CREATE A TOURNAMENT */}

        <Link
          href="/create/tournament"
          className="min-h-[140px] rounded-2xl border border-violet-100 bg-violet-50/50 p-4 text-left transition active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-[29px] w-[29px] items-center justify-center rounded-full border-3 border-violet-400 text-violet-500">
              <Plus
                size={20}
                strokeWidth={2.5}
              />
            </div>

            <ChevronRight
              size={17}
              strokeWidth={2}
              className="mt-1 text-slate-500"
            />
          </div>

          <h3 className="mt-3 text-[13px] font-bold leading-[18px] text-slate-950">
            Create a Tournament
          </h3>

          <p className="mt-1 text-[11px] leading-[15px] text-slate-500">
            Organise your
            <br />
            tournament
          </p>
        </Link>

      </div>
    </section>
  );
}
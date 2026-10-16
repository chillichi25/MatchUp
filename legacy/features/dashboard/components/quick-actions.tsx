import Link from "next/link";

import {
  Plus,
  Trophy,
} from "lucide-react";

export function QuickActions() {
  return (
    <section className="mt-8">
      {/* Heading */}

      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
        Quick Actions
      </h2>

      {/* Actions */}

      <div className="mt-3 grid grid-cols-2 gap-3">
        {/* Create Match */}

        <Link
          href="/matches/create"
          className="group rounded-2xl bg-[#00B83F] px-4 py-3.5 shadow-sm transition active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Plus
              size={22}
              strokeWidth={2.4}
              className="text-white"
            />
          </div>

          <div className="mt-4">
            <p className="text-[14px] font-bold text-white">
              Create Match
            </p>

            <p className="mt-1 text-[11px] font-medium leading-4 text-white/80">
              Post a new friendly
            </p>
          </div>
        </Link>

        {/* Create Tournament */}

        <Link
          href="/tournaments/create"
          className="group rounded-2xl bg-violet-600 px-4 py-3.5 shadow-sm transition active:scale-[0.98]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Trophy
              size={20}
              strokeWidth={2.2}
              className="text-white"
            />
          </div>

          <div className="mt-4">
            <p className="text-[14px] font-bold text-white">
              Create Tournament
            </p>

            <p className="mt-1 text-[11px] font-medium leading-4 text-white/80">
              Organise a tournament
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
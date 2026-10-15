import Link from "next/link";
import {
  ChevronRight,
  Swords,
  Trophy,
} from "lucide-react";

export default function CreatePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-4 pb-28 pt-6">
      {/* -------------------------------------------
          HEADER
      ------------------------------------------- */}

      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-950">
          Create
        </h1>

        <p className="mt-0.5 text-[13px] text-slate-500">
          What would you like to organise?
        </p>
      </header>

      {/* -------------------------------------------
          CREATE OPTIONS
      ------------------------------------------- */}

      <section className="mt-6 space-y-3.5">
        {/* CREATE MATCH */}

        <Link
          href="/create/friendly"
          className="flex min-h-[104px] items-stretch overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition active:scale-[0.99]"
        >
          {/* FULL-HEIGHT ICON STRIP */}

          <div className="flex w-[68px] shrink-0 items-center justify-center bg-green-50">
            <Swords
              size={27}
              strokeWidth={2}
              className="text-[#00B83F]"
            />
          </div>

          {/* CONTENT */}

          <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-bold leading-tight text-slate-950">
                Create a Match
              </h2>

              <p className="mt-1.5 max-w-[190px] text-[13px] leading-[18px] text-slate-500">
                Find another team and organise a friendly match.
              </p>
            </div>

            <ChevronRight
              size={20}
              strokeWidth={2}
              className="shrink-0 text-slate-400"
            />
          </div>
        </Link>

        {/* CREATE TOURNAMENT */}

        <Link
          href="/create/tournament"
          className="flex min-h-[104px] items-stretch overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm transition active:scale-[0.99]"
        >
          {/* FULL-HEIGHT ICON STRIP */}

          <div className="flex w-[68px] shrink-0 items-center justify-center bg-violet-50">
            <Trophy
              size={27}
              strokeWidth={2}
              className="text-violet-600"
            />
          </div>

          {/* CONTENT */}

          <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-bold leading-tight text-slate-950">
                Create a Tournament
              </h2>

              <p className="mt-1.5 max-w-[190px] text-[13px] leading-[18px] text-slate-500">
                Organise a tournament and invite teams.
              </p>
            </div>

            <ChevronRight
              size={20}
              strokeWidth={2}
              className="shrink-0 text-slate-400"
            />
          </div>
        </Link>
      </section>
    </main>
  );
}
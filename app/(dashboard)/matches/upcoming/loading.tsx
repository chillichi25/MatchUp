import { ArrowLeft } from "lucide-react";

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-slate-200 ${className}`}
    />
  );
}

function MatchSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-32 rounded-full" />

          <Skeleton className="mt-2 h-4 w-20 rounded-full" />
        </div>

        <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
      </div>

      {/* Details */}

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-[17px] w-[17px] shrink-0 rounded-md" />

          <Skeleton className="h-3.5 w-32 rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-[17px] w-[17px] shrink-0 rounded-md" />

          <Skeleton className="h-3.5 w-40 rounded-full" />
        </div>
      </div>

      {/* Footer */}

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <Skeleton className="h-3.5 w-20 rounded-full" />

        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

export default function UpcomingMatchesLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}

      <header className="flex items-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white">
          <ArrowLeft size={20} />
        </div>

        <h1 className="flex-1 pr-11 text-center text-lg font-bold">
          Upcoming Matches
        </h1>
      </header>

      {/* Intro */}

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-950">
          Your Schedule
        </h2>

        <div className="mt-2 flex items-center gap-1">
          <span className="text-sm text-slate-500">
            Confirmed matches for
          </span>

          <Skeleton className="h-3.5 w-20 rounded-full" />
        </div>
      </section>

      {/* Matches */}

      <section className="mt-7 space-y-4">
        <MatchSkeleton />
        <MatchSkeleton />
        <MatchSkeleton />
      </section>
    </main>
  );
}
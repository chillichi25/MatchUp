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

function HistoryCardSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Top row */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Club badge */}

          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />

          {/* Club + team */}

          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-32 rounded-full" />

            <Skeleton className="mt-2 h-3.5 w-20 rounded-full" />
          </div>
        </div>

        {/* Result/status */}

        <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
      </div>

      {/* Date */}

      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-4 w-4 shrink-0 rounded-md" />

        <Skeleton className="h-3.5 w-28 rounded-full" />
      </div>

      {/* Result information */}

      <Skeleton className="mt-3 h-3.5 w-36 rounded-full" />
    </div>
  );
}

export default function MatchHistoryLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* =============================================
          HEADER
      ============================================= */}

      <header className="flex items-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white">
          <ArrowLeft size={20} />
        </div>

        <h1 className="flex-1 pr-11 text-center text-lg font-bold">
          Match History
        </h1>
      </header>

      {/* =============================================
          INTRO
      ============================================= */}

      <section className="mt-8">
        <h2 className="text-3xl font-bold text-slate-950">
          Match History
        </h2>

        <p className="mt-2 text-slate-500">
          View completed and cancelled matches.
        </p>
      </section>

      {/* =============================================
          FILTERS
      ============================================= */}

      <section className="mt-7">
        <div className="flex flex-wrap gap-2">
          {/* Default to All while route loads */}

          <div className="shrink-0 rounded-full bg-[#00B83F] px-4 py-2 text-sm font-medium text-white">
            All
          </div>

          <div className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            Won
          </div>

          <div className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            Drawn
          </div>

          <div className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            Lost
          </div>

          <div className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            Cancelled
          </div>
        </div>
      </section>

      {/* =============================================
          HISTORY
      ============================================= */}

      <section className="mt-8 space-y-4">
        <HistoryCardSkeleton />

        <HistoryCardSkeleton />

        <HistoryCardSkeleton />
      </section>
    </main>
  );
}
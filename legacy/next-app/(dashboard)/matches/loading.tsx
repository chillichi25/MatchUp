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

function MatchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-[124px] items-stretch">
        {/* Date column */}

        <div className="flex w-[58px] shrink-0 flex-col items-center justify-center bg-green-50 px-1">
          <Skeleton className="h-2 w-7 rounded-full" />

          <Skeleton className="mt-2 h-6 w-6 rounded-md" />

          <Skeleton className="mt-2 h-2 w-6 rounded-full" />
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1 px-3.5 py-3.5">
          {/* Top */}

          <div className="flex items-start gap-2.5">
            {/* Badge */}

            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center">
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>

            {/* Club / team */}

            <div className="min-w-0 flex-1 pt-1">
              <Skeleton className="h-4 w-28 rounded-full" />

              <Skeleton className="mt-2 h-3 w-20 rounded-full" />
            </div>

            {/* Chevron */}

            <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded-full" />
          </div>

          {/* Tags */}

          <div className="ml-[55px] mt-2.5 flex gap-1.5">
            <Skeleton className="h-5 w-10 rounded-full" />

            <Skeleton className="h-5 w-16 rounded-full" />

            <Skeleton className="h-5 w-11 rounded-full" />
          </div>

          {/* Meta */}

          <div className="ml-[55px] mt-3 flex items-center gap-3">
            <Skeleton className="h-3 w-20 rounded-full" />

            <Skeleton className="h-3 w-10 rounded-full" />

            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchesLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-4 pb-28 pt-6">
      {/* =============================================
          HEADER
      ============================================= */}

      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-950">
          Find Matches
        </h1>

        <p className="mt-0 text-[13px] text-slate-500">
          Find the right opportunity for your team.
        </p>
      </header>

      {/* =============================================
          SEARCH
      ============================================= */}

      <section className="mt-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
            <Skeleton className="h-[18px] w-[18px] shrink-0 rounded-md" />

            <Skeleton className="h-3 w-40 rounded-full" />
          </div>

          <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
        </div>
      </section>

      {/* =============================================
          FRIENDLIES / TOURNAMENTS
      ============================================= */}

      <section className="mt-4">
        <div className="flex rounded-xl bg-slate-100 p-1">
          {/* Selected Friendlies */}

          <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-white text-[12px] font-bold text-[#00B83F] shadow-sm">
            Friendlies
          </div>

          {/* Tournaments */}

          <div className="flex h-10 flex-1 items-center justify-center rounded-lg text-[12px] font-bold text-slate-500">
            Tournaments
          </div>
        </div>
      </section>

      {/* =============================================
          QUICK FILTERS
      ============================================= */}

      <section className="-mx-4 mt-3">
        <div className="flex items-center gap-1.5 px-4 pb-1">
          <div className="flex h-8 w-11 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50">
            <Skeleton className="h-2.5 w-4 rounded-full bg-green-200" />
          </div>

          <Skeleton className="h-8 w-[91px] shrink-0 rounded-full" />

          <Skeleton className="h-8 w-[75px] shrink-0 rounded-full" />

          <Skeleton className="h-8 w-[61px] shrink-0 rounded-full" />

          <Skeleton className="h-8 w-[54px] shrink-0 rounded-full" />
        </div>
      </section>

      {/* =============================================
          RESULTS
      ============================================= */}

      <section className="mt-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
              Available Friendlies
            </h2>

            <Skeleton className="mt-2 h-3 w-24 rounded-full" />
          </div>

          <Skeleton className="mt-1 h-4 w-16 rounded-full" />
        </div>

        {/* Match cards */}

        <div className="mt-3">
  <MatchCardSkeleton />
</div>
      </section>
    </main>
  );
}
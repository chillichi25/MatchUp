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

function ActivityRowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-32 rounded-full" />
      </div>

      <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-4 pb-28 pt-6">
      {/* =============================================
          HEADER
      ============================================= */}

      <header className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-950">
          Profile
        </h1>

        <Skeleton className="h-10 w-10 rounded-full" />
      </header>

      {/* =============================================
          CLUB IDENTITY
      ============================================= */}

      <section className="mt-5 flex flex-col items-center text-center">
        {/* Club badge */}

        <Skeleton className="h-24 w-24 rounded-full" />

        {/* Club name */}

        <Skeleton className="mt-4 h-7 w-40 rounded-lg" />

        {/* Team name */}

        <Skeleton className="mt-2 h-4 w-24 rounded-full" />

        {/* Edit club button */}

        <Skeleton className="mt-4 h-10 w-28 rounded-xl" />
      </section>

      {/* =============================================
          ACTIVE TEAM
      ============================================= */}

      <section className="mt-7">
        <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
          Active Team
        </h2>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          {/* Team header */}

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-28 rounded-full" />

              <Skeleton className="mt-2 h-4 w-36 rounded-full" />
            </div>

            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          </div>

          {/* Team information */}

          <div className="mt-4 grid grid-cols-[0.8fr_1.4fr_0.8fr] divide-x divide-slate-100 border-t border-slate-100 pt-4">
            <div className="px-2 text-center">
              <Skeleton className="mx-auto h-2.5 w-12 rounded-full" />
              <Skeleton className="mx-auto mt-2 h-3 w-8 rounded-full" />
            </div>

            <div className="px-2 text-center">
              <Skeleton className="mx-auto h-2.5 w-8 rounded-full" />
              <Skeleton className="mx-auto mt-2 h-3 w-20 rounded-full" />
            </div>

            <div className="px-2 text-center">
              <Skeleton className="mx-auto h-2.5 w-10 rounded-full" />
              <Skeleton className="mx-auto mt-2 h-3 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* =============================================
          CLUB MANAGEMENT
      ============================================= */}

      <section className="mt-7">
        <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
          Club Management
        </h2>

        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3.5 px-4 py-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />

            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-24 rounded-full" />

              <Skeleton className="mt-2 h-3 w-40 rounded-full" />
            </div>

            <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
          </div>
        </div>
      </section>

      {/* =============================================
          MY ACTIVITY
      ============================================= */}

      <section className="mt-7">
        <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
          My Activity
        </h2>

        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ActivityRowSkeleton />

          <div className="ml-[68px] border-t border-slate-100" />

          <ActivityRowSkeleton />

          <div className="ml-[68px] border-t border-slate-100" />

          <ActivityRowSkeleton />
        </div>
      </section>

      {/* =============================================
          TEAM PERFORMANCE
      ============================================= */}

      <section className="mt-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
            Team Performance
          </h2>

          <span className="text-[13px] font-semibold text-[#00B83F]">
            View all
          </span>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-sm">
          <div className="grid grid-cols-4 divide-x divide-slate-100">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="min-w-0 px-1.5 text-center"
              >
                <Skeleton className="mx-auto h-5 w-6 rounded-md" />

                <Skeleton className="mx-auto mt-2 h-2.5 w-9 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
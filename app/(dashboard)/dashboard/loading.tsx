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

/* =====================================================
   DASHBOARD LOADING
===================================================== */

export default function DashboardLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* =============================================
          HEADER
      ============================================= */}

      <section>
        <div className="flex items-start justify-between">
          {/* Greeting */}

          <div>
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="mt-2 h-6 w-24 rounded-md" />
          </div>

          {/* Notification bell */}

          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Active team */}

        <div className="mt-4 flex min-h-[74px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="mt-2 h-3 w-20 rounded-full" />
          </div>

          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </section>

      {/* =============================================
          DASHBOARD ACTIONS
      ============================================= */}

      <section className="mt-6">
        <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
          What would you like to do?
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Find a Match */}

          <div className="min-h-[122px] rounded-2xl border border-green-100 bg-green-50/80 p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-[29px] w-[29px] rounded-lg bg-green-200" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>

            <Skeleton className="mt-3 h-4 w-24 rounded-full" />
            <Skeleton className="mt-2 h-3 w-24 rounded-full" />
            <Skeleton className="mt-1.5 h-3 w-16 rounded-full" />
          </div>

          {/* Find Tournaments */}

          <div className="min-h-[122px] rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-[29px] w-[29px] rounded-lg bg-blue-200" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>

            <Skeleton className="mt-3 h-4 w-28 rounded-full" />
            <Skeleton className="mt-2 h-3 w-28 rounded-full" />
            <Skeleton className="mt-1.5 h-3 w-20 rounded-full" />
          </div>

          {/* Create a Match */}

          <div className="min-h-[122px] rounded-2xl border border-green-100 bg-green-50/80 p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-[31px] w-[31px] rounded-full bg-green-200" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>

            <Skeleton className="mt-3 h-4 w-24 rounded-full" />
            <Skeleton className="mt-2 h-3 w-20 rounded-full" />
            <Skeleton className="mt-1.5 h-3 w-14 rounded-full" />
          </div>

          {/* Create a Tournament */}

          <div className="min-h-[122px] rounded-2xl border border-violet-100 bg-violet-50/80 p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-[31px] w-[31px] rounded-full bg-violet-200" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>

            <Skeleton className="mt-3 h-4 w-32 rounded-full" />
            <Skeleton className="mt-2 h-3 w-24 rounded-full" />
            <Skeleton className="mt-1.5 h-3 w-20 rounded-full" />
          </div>
        </div>
      </section>

      {/* =============================================
          UP NEXT
      ============================================= */}

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
            Up Next
          </h2>

          <Skeleton className="h-3 w-12 rounded-full" />
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          {/* Teams + date */}

          <div className="grid grid-cols-[1fr_54px_1fr] items-center gap-2">
            {/* Home */}

            <div className="flex min-w-0 flex-col items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="mt-2 h-2.5 w-14 rounded-full" />
              <Skeleton className="mt-1.5 h-3 w-24 rounded-full" />
            </div>

            {/* Date */}

            <div className="flex flex-col items-center">
              <Skeleton className="h-2 w-6 rounded-full" />
              <Skeleton className="mt-1.5 h-6 w-5 rounded-md bg-green-200" />
              <Skeleton className="mt-1 h-2 w-6 rounded-full" />
              <Skeleton className="mt-2 h-3 w-5 rounded-full" />
            </div>

            {/* Away */}

            <div className="flex min-w-0 flex-col items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="mt-2 h-2.5 w-14 rounded-full" />
              <Skeleton className="mt-1.5 h-3 w-24 rounded-full" />
            </div>
          </div>

          {/* Meta */}

          <div className="mt-3 flex items-center justify-center gap-6 border-t border-slate-100 pt-2.5">
            <Skeleton className="h-3 w-14 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>

          {/* Buttons */}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Skeleton className="h-9 rounded-xl" />
            <Skeleton className="h-9 rounded-xl bg-green-200" />
          </div>
        </div>
      </section>

      {/* =============================================
          RECOMMENDED FOR YOU
      ============================================= */}

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
            Recommended for You
          </h2>

          <Skeleton className="h-3 w-12 rounded-full" />
        </div>

        <div className="mt-3 flex min-h-[98px] items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          {/* Date */}

          <div className="flex w-[42px] shrink-0 flex-col items-center">
            <Skeleton className="h-2 w-6 rounded-full" />
            <Skeleton className="mt-1.5 h-5 w-5 rounded-md bg-green-200" />
            <Skeleton className="mt-1 h-2 w-6 rounded-full" />
          </div>

          {/* Badge */}

          <Skeleton className="ml-2 h-10 w-10 shrink-0 rounded-full" />

          {/* Details */}

          <div className="ml-3 min-w-0 flex-1">
            <Skeleton className="h-3.5 w-28 rounded-full" />

            <Skeleton className="mt-2 h-2.5 w-20 rounded-full" />

            <Skeleton className="mt-2 h-2.5 w-28 rounded-full" />

            <Skeleton className="mt-2 h-5 w-28 rounded-full bg-green-100" />
          </div>

          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
        </div>
      </section>

      {/* =============================================
          UPCOMING
      ============================================= */}

      <section className="mt-7">
        <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
          Upcoming
        </h2>

        {/* Segmented control */}

        <div className="mt-3 flex rounded-xl bg-slate-200/70 p-1">
          <div className="flex h-8 flex-1 items-center justify-center rounded-lg bg-white shadow-sm">
            <Skeleton className="h-3 w-14 rounded-full bg-green-200" />
          </div>

          <div className="flex h-8 flex-1 items-center justify-center">
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
        </div>

        {/* One upcoming event */}

        <div className="mt-3 flex min-h-[72px] items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          {/* Date */}

          <div className="flex w-[42px] shrink-0 flex-col items-center">
            <Skeleton className="h-2 w-6 rounded-full" />
            <Skeleton className="mt-1 h-5 w-5 rounded-md bg-green-200" />
            <Skeleton className="mt-1 h-2 w-6 rounded-full" />
          </div>

          {/* Badge */}

          <Skeleton className="ml-2 h-10 w-10 shrink-0 rounded-full" />

          {/* Details */}

          <div className="ml-3 min-w-0 flex-1">
            <Skeleton className="h-3.5 w-28 rounded-full" />
            <Skeleton className="mt-2 h-2.5 w-20 rounded-full" />
            <Skeleton className="mt-2 h-2.5 w-28 rounded-full" />
          </div>

          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
        </div>

        {/* View all */}

        <Skeleton className="mt-3 h-9 w-full rounded-xl bg-green-100" />
      </section>

      {/* =============================================
          TEAM PERFORMANCE
      ============================================= */}

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
            Team Performance
          </h2>

          <Skeleton className="h-3 w-12 rounded-full" />
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          {/* Win rate circle */}

          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <Skeleton className="h-[112px] w-[112px] rounded-full" />
              <Skeleton className="mt-2 h-2.5 w-12 rounded-full" />
            </div>
          </div>

          {/* Stats */}

          <div className="mt-3 grid grid-cols-4 border-t border-slate-100 pt-3">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex flex-col items-center border-r border-slate-100 last:border-r-0"
              >
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="mt-2 h-4 w-4 rounded-md" />
                <Skeleton className="mt-1.5 h-2 w-10 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================
          RECENT RESULTS
      ============================================= */}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
            Recent Results
          </h2>

          <Skeleton className="h-3 w-12 rounded-full" />
        </div>

        <div className="mt-3 space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="flex min-h-[76px] items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm"
            >
              {/* Date */}

              <div className="flex w-[42px] shrink-0 flex-col items-center rounded-xl bg-slate-50 py-2">
                <Skeleton className="h-2 w-6 rounded-full" />
                <Skeleton className="mt-1 h-5 w-5 rounded-md bg-green-200" />
                <Skeleton className="mt-1 h-2 w-6 rounded-full" />
              </div>

              {/* Badge */}

              <Skeleton className="ml-3 h-10 w-10 shrink-0 rounded-full" />

              {/* Opponent */}

              <div className="ml-3 min-w-0 flex-1">
                <Skeleton className="h-3.5 w-28 rounded-full" />
                <Skeleton className="mt-2 h-2.5 w-20 rounded-full" />
                <Skeleton className="mt-2 h-4 w-9 rounded-full bg-green-100" />
              </div>

              {/* Score */}

              <Skeleton className="h-4 w-10 rounded-full" />

              {/* Chevron */}

              <Skeleton className="ml-2 h-4 w-4 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
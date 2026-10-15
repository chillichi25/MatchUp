import {
  ChevronLeft,
} from "lucide-react";

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

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white px-4 py-4">
      {/* Icon */}

      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

      {/* Content */}

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-32 rounded-full" />

          <Skeleton className="h-2.5 w-10 shrink-0 rounded-full" />
        </div>

        <Skeleton className="mt-2.5 h-3 w-full rounded-full" />

        <Skeleton className="mt-2 h-3 w-3/4 rounded-full" />
      </div>
    </div>
  );
}

export default function NotificationsLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-24 pt-6">
      {/* Header */}

      <header className="relative flex items-center justify-center">
        <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm">
          <ChevronLeft
            size={21}
            strokeWidth={2}
          />
        </div>

        <h1 className="text-[20px] font-bold text-slate-950">
          Notifications
        </h1>
      </header>

      {/* Notifications */}

      <div className="mt-7 space-y-7">
        {/* Today */}

        <section>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Today
          </h2>

          <div className="space-y-1">
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </div>
        </section>

        {/* Earlier */}

        <section>
          <Skeleton className="mb-3 h-3 w-14 rounded-full" />

          <div className="space-y-1">
            <NotificationSkeleton />
            <NotificationSkeleton />
          </div>
        </section>
      </div>
    </main>
  );
}
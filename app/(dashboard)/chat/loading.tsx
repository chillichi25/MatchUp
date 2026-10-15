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

function ConversationSkeleton({
  last = false,
}: {
  last?: boolean;
}) {
  return (
    <div
      className={`px-4 py-4 ${
        !last ? "border-b border-slate-100" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Badge */}

        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">
          {/* Club + time */}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-28 rounded-full" />

              <Skeleton className="mt-2 h-3 w-20 rounded-full" />
            </div>

            <Skeleton className="h-3 w-10 rounded-full" />
          </div>

          {/* Latest message */}

          <div className="mt-2 flex items-center gap-2">
            <Skeleton className="h-3.5 w-40 max-w-full rounded-full" />
          </div>

          {/* Match date */}

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-3 rounded-sm" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>

            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-4 pb-28 pt-6">
      {/* Header */}

      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-950">
          Chat
        </h1>

        <p className="mt-0.5 text-[13px] text-slate-500">
          Your match conversations.
        </p>
      </header>

      {/* Conversations */}

      <section className="mt-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <ConversationSkeleton />
          <ConversationSkeleton />
          <ConversationSkeleton />
          <ConversationSkeleton last />
        </div>
      </section>
    </main>
  );
}
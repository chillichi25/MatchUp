import Link from "next/link";

import {
  ChevronRight,
  Clock3,
  Mail,
} from "lucide-react";

type ActionCentreProps = {
  pendingRequests: number;
  awaitingResponses: number;
};

export function ActionCentre({
  pendingRequests,
  awaitingResponses,
}: ActionCentreProps) {
  // --------------------------------------------------
  // NOTHING REQUIRES THE COACH'S ATTENTION
  // --------------------------------------------------

  if (
    pendingRequests === 0 &&
    awaitingResponses === 0
  ) {
    return null;
  }

  return (
    <section className="mt-8">
      {/* Heading */}

      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
        Requests & Updates
      </h2>

      {/* Requests */}

      <div className="mt-3 space-y-3">
        {/* Match Requests */}

        <Link
          href="/friendlies/requests"
          className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm transition active:scale-[0.99]"
        >
          {/* Icon */}

          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50">
            <Mail
              size={24}
              strokeWidth={2.2}
              className="text-[#00B83F]"
            />

            {pendingRequests > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {pendingRequests > 9
                  ? "9+"
                  : pendingRequests}
              </span>
            )}
          </div>

          {/* Text */}

          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-bold leading-tight text-slate-950">
              Match Requests
            </h3>

            <p className="mt-1 text-[11px] leading-[15px] text-slate-500">
              Teams interested in playing
            </p>
          </div>

          {/* Arrow */}

          <ChevronRight
            size={18}
            strokeWidth={2}
            className="shrink-0 text-slate-500"
          />
        </Link>

        {/* Awaiting Response */}

        <Link
          href="/friendlies/sent"
          className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm transition active:scale-[0.99]"
        >
          {/* Icon */}

          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50">
            <Clock3
              size={25}
              strokeWidth={2.2}
              className="text-amber-500"
            />

            {awaitingResponses > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {awaitingResponses > 9
                  ? "9+"
                  : awaitingResponses}
              </span>
            )}
          </div>

          {/* Text */}

          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-bold leading-tight text-slate-950">
              Awaiting Response
            </h3>

            <p className="mt-1 text-[11px] leading-[15px] text-slate-500">
              Requests you&apos;ve sent
            </p>
          </div>

          {/* Arrow */}

          <ChevronRight
            size={18}
            strokeWidth={2}
            className="shrink-0 text-slate-500"
          />
        </Link>
      </div>
    </section>
  );
}
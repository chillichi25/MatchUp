import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ClubSearchForm } from "./club-search-form";

export default function JoinClubPage() {
  return (
    <main className="min-h-dvh bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-md px-5 pb-12 pt-5">
        {/* Back */}
        <div className="flex h-11 items-center">
          <Link
            href="/clubs"
            aria-label="Back to club options"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#07192D] shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <ChevronLeft
              size={22}
              strokeWidth={2}
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Heading */}
        <div className="mt-6">
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[#07192D]">
            Find your club
          </h1>

          <p className="mt-1.5 text-[14px] leading-5 text-slate-500">
            Search for your club to join it on MatchUp.
          </p>
        </div>

        <ClubSearchForm />
      </div>
    </main>
  );
}
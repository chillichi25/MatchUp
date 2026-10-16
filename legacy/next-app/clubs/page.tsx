import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ChevronRight,
  Search,
  ShieldPlus,
} from "lucide-react";

import {
  getMyApprovedClubMembership,
  getPendingClubRequest,
} from "@/features/clubs/services/club.service";

import { createClient } from "@/lib/supabase/server";

export default async function ClubsPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // 1. Check authentication
  // --------------------------------------------------

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // 2. Check active team
  // --------------------------------------------------

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("active_team_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "CLUBS PROFILE STATE ERROR:",
      profileError
    );
  }

  // --------------------------------------------------
  // 3. Active team = onboarding complete
  // --------------------------------------------------

  if (profile?.active_team_id) {
    redirect("/dashboard");
  }

  // --------------------------------------------------
  // 4. Check club membership state
  // --------------------------------------------------

  const [
    pendingClubRequest,
    approvedClubMembership,
  ] = await Promise.all([
    getPendingClubRequest(),
    getMyApprovedClubMembership(),
  ]);

  // --------------------------------------------------
  // 5. Approved club + no active team
  //    → choose a team
  // --------------------------------------------------

  if (approvedClubMembership) {
    redirect(
      `/clubs/${approvedClubMembership.clubId}/teams`
    );
  }

  // --------------------------------------------------
  // 6. Pending club request
  // --------------------------------------------------

  if (pendingClubRequest) {
    redirect("/clubs/pending");
  }

  // --------------------------------------------------
  // 7. No club membership
  //    → show Find/Create
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/images/matchup-logo.png"
            alt="MatchUp"
            width={220}
            height={120}
            priority
            className="h-auto w-[170px]"
          />
        </div>

        {/* Heading */}
        <div className="mt-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Welcome to MatchUp
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Let&apos;s get your club and team ready.
          </p>
        </div>

        {/* Options */}
        <div className="mt-8 space-y-4">
          {/* Find club */}
          <Link
            href="/clubs/join"
            className="flex min-h-[116px] items-center rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#00B83F] hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex w-full items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#00B83F]">
                <Search
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-900">
                  Find my club
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Join a club already on MatchUp
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-slate-300"
              />
            </div>
          </Link>

          {/* Create club */}
          <Link
            href="/clubs/create"
            className="flex min-h-[116px] items-center rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#00B83F] hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex w-full items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#00B83F]">
                <ShieldPlus
                  size={22}
                  strokeWidth={2}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-900">
                  Create my club
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Add your club to MatchUp
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-slate-300"
              />
            </div>
          </Link>
        </div>

        {/* Helper text */}
        <p className="mt-7 text-center text-xs leading-5 text-slate-500">
          You can update your club details at any time.
        </p>
      </div>
    </main>
  );
}
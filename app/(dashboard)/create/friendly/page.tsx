import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";
import { FriendlyForm } from "@/features/friendlies/components/friendly-form";

export default async function CreateFriendlyPage() {
  const supabase = await createClient();

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // ACTIVE TEAM
  // --------------------------------------------------

  const team = await getActiveTeam();

  if (!team) {
    redirect("/clubs");
  }

  // --------------------------------------------------
  // CLUB
  // --------------------------------------------------

  const clubRelation = team.clubs;

  const club = Array.isArray(clubRelation)
    ? clubRelation[0]
    : clubRelation;

  if (!club) {
    redirect("/clubs");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}

      <header className="flex items-center">
        <Link
          href="/dashboard"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="flex-1 pr-11 text-center text-lg font-bold text-slate-900">
          Create a Match
        </h1>
      </header>

      {/* Intro */}

      <section className="mt-6">
  <h2 className="text-[26px] font-bold tracking-tight text-slate-900">
    Find your next opponent
  </h2>

  <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
    Add the match details and find your next opponent.
  </p>
</section>

      <FriendlyForm
  teamId={team.id}
  teamName={team.name}
  clubName={club.name}
  teamMatchFormat={team.match_format}
/>
    </main>
  );
}
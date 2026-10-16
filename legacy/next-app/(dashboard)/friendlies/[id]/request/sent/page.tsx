import Link from "next/link";
import { Check } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type RequestSentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RequestSentPage({
  params,
}: RequestSentPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // Make sure the user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load the friendly and opponent club
  const { data: friendly, error } = await supabase
    .from("friendlies")
    .select(`
      id,
      teams!friendlies_team_id_fkey (
        id,
        name,
        clubs!teams_club_id_fkey (
          id,
          name
        )
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "ERROR LOADING FRIENDLY:",
      error,
    );
    notFound();
  }

  if (!friendly) {
    notFound();
  }

  // Get opponent team
  const teamRelation = friendly.teams;

  const opponentTeam = Array.isArray(teamRelation)
    ? teamRelation[0]
    : teamRelation;

  if (!opponentTeam) {
    notFound();
  }

  // Get opponent club
  const clubRelation = opponentTeam.clubs;

  const opponentClub = Array.isArray(clubRelation)
    ? clubRelation[0]
    : clubRelation;

  if (!opponentClub) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center bg-gray-50 px-5 pb-32">
      <div className="w-full -translate-y-8 text-center">
        {/* Success icon */}

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
          <Check size={38} strokeWidth={2.5} />
        </div>

        {/* Heading */}

        <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-900">
          Request sent!
        </h1>

        {/* Message */}

        <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
          Your match request has been sent to{" "}
          <span className="font-semibold text-slate-700">
            {opponentClub.name}
          </span>
          . We&apos;ll let you know when they respond.
        </p>

        {/* Actions */}

        <div className="mt-9 space-y-3">
          <Link
            href="/matches?type=friendlies"
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] font-semibold text-white transition hover:bg-[#009F37]"
          >
            Back to Matches
          </Link>

          <Link
            href="/dashboard"
            className="flex h-12 w-full items-center justify-center rounded-full border border-gray-200 bg-white font-semibold text-slate-700 transition hover:bg-gray-50"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
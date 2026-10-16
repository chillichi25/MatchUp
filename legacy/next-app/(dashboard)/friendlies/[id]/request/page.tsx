import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { FriendlyRequestForm } from "@/features/friendlies/components/friendly-request-form";

type RequestPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RequestFriendlyPage({
  params,
}: RequestPageProps) {
  const { id } = await params;

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
  // MATCH / OPPONENT
  // --------------------------------------------------

  const {
    data: friendly,
    error: friendlyError,
  } = await supabase
    .from("friendlies")
    .select(`
      id,
      created_by,
      status,
      teams!friendlies_team_id_fkey (
        id,
        name,
        clubs!teams_club_id_fkey (
          id,
          name,
          badge_url
        )
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (friendlyError) {
    console.error(
      "REQUEST FRIENDLY ERROR:",
      {
        message: friendlyError.message,
        details: friendlyError.details,
        hint: friendlyError.hint,
        code: friendlyError.code,
      },
    );

    throw new Error(
      friendlyError.message,
    );
  }

  if (!friendly) {
    console.error(
      "FRIENDLY NOT FOUND:",
      id,
    );

    notFound();
  }

  // --------------------------------------------------
  // VALIDATE MATCH
  // --------------------------------------------------

  if (
    friendly.created_by === user.id
  ) {
    redirect(
      `/friendlies/${id}`,
    );
  }

  if (friendly.status !== "open") {
    redirect(
      `/friendlies/${id}`,
    );
  }

  // --------------------------------------------------
  // OPPONENT TEAM
  // --------------------------------------------------

  const opponentTeam =
    Array.isArray(friendly.teams)
      ? friendly.teams[0]
      : friendly.teams;

  if (!opponentTeam) {
    console.error(
      "OPPONENT TEAM NOT FOUND:",
      friendly,
    );

    notFound();
  }

  const opponentClub =
    Array.isArray(
      opponentTeam.clubs,
    )
      ? opponentTeam.clubs[0]
      : opponentTeam.clubs;

  if (!opponentClub) {
    console.error(
      "OPPONENT CLUB NOT FOUND:",
      opponentTeam,
    );

    notFound();
  }

  // --------------------------------------------------
  // ACTIVE TEAM
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
      "REQUEST FRIENDLY PROFILE ERROR:",
      profileError,
    );

    throw new Error(
      "We couldn't load your active team.",
    );
  }

  if (!profile?.active_team_id) {
    redirect("/clubs");
  }

  // --------------------------------------------------
  // REQUESTING TEAM
  // --------------------------------------------------

  const {
    data: requestingTeam,
    error: requestingTeamError,
  } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      club_id,
      clubs!teams_club_id_fkey (
        id,
        name,
        badge_url
      )
    `)
    .eq(
      "id",
      profile.active_team_id,
    )
    .maybeSingle();

  if (requestingTeamError) {
    console.error(
      "REQUEST FRIENDLY ACTIVE TEAM ERROR:",
      requestingTeamError,
    );

    throw new Error(
      "We couldn't load your active team.",
    );
  }

  if (!requestingTeam) {
    redirect("/clubs");
  }

  // --------------------------------------------------
  // MY CLUB
  // --------------------------------------------------

  const clubRelation =
    requestingTeam.clubs;

  const myClub =
    Array.isArray(clubRelation)
      ? clubRelation[0]
      : clubRelation;

  if (!myClub) {
    redirect("/clubs");
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* HEADER */}

      <header className="flex items-center">
        <Link
          href={`/friendlies/${id}`}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </Link>

        <h1 className="flex-1 pr-11 text-center text-lg font-bold text-slate-900">
          Request Match
        </h1>
      </header>

      {/* INTRO */}

      {/* INTRO */}

<section className="mt-6">
  <h2 className="text-[26px] font-bold tracking-tight text-slate-900">
    Request this match?
  </h2>

  <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
    Send a request if you&apos;re interested in this match.
  </p>
</section>

{/* MATCHUP */}

<section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">

  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
    {/* YOUR TEAM */}

    <div className="min-w-0 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center">
        {myClub.badge_url ? (
          <img
            src={myClub.badge_url}
            alt={`${myClub.name} badge`}
            className="h-13 w-13 object-contain"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl">
            ⚽
          </div>
        )}
      </div>

      <div className="mt-3 flex h-8 items-start justify-center">
  <p className="line-clamp-2 text-center text-[13px] font-bold leading-4 text-slate-950">
    {myClub.name}
  </p>
</div>

<p className="mt-1 truncate text-[12px] text-slate-500">
  {requestingTeam.name}
</p>
    </div>

    {/* VS */}

    <div className="flex items-center justify-center px-1">
  <span className="text-[11px] font-bold uppercase text-slate-500">
    VS
  </span>
</div>

    {/* OPPONENT */}

    <div className="min-w-0 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center">
        {opponentClub.badge_url ? (
          <img
            src={opponentClub.badge_url}
            alt={`${opponentClub.name} badge`}
            className="h-13 w-13 object-contain"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl">
            ⚽
          </div>
        )}
      </div>

      <div className="mt-3 flex h-8 items-center justify-center">
  <p className="line-clamp-2 text-center text-[13px] font-bold leading-4 text-slate-950">
    {opponentClub.name}
  </p>
</div>

<p className="mt-1 truncate text-[12px] text-slate-500">
  {opponentTeam.name}
</p>
    </div>
  </div>

  {/* LABELS */}

  <div className="mt-5 grid grid-cols-2 border-t border-slate-100 pt-3">
    <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      Your Team
    </p>

    <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      Opponent
    </p>
  </div>
</section>

{/* REQUEST FORM */}

<FriendlyRequestForm
  friendlyId={friendly.id}
  requestingTeamId={requestingTeam.id}
/>
    </main>
  );
}
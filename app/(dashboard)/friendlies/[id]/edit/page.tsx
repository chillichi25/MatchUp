import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { FriendlyForm } from "@/features/friendlies/components/friendly-form";

export default async function EditFriendlyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  // FRIENDLY
  // --------------------------------------------------

  const { data: friendly, error } = await supabase
    .from("friendlies")
    .select(`
      id,
      created_by,
      match_date,
      kick_off_time,
      venue_type,
      match_format,
      location,
      notes,
      status,
      team_id,
      teams (
        id,
        name,
        clubs (
          id,
          name
        )
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("LOAD FRIENDLY FOR EDIT ERROR:", error);
    notFound();
  }

  if (!friendly) {
    notFound();
  }

  // Only the coach who posted the friendly can edit it.
  if (friendly.created_by !== user.id) {
    redirect(`/friendlies/${id}`);
  }

  // Only open friendlies can be edited.
  if (friendly.status !== "open") {
    redirect(`/friendlies/${id}`);
  }

  const team = Array.isArray(friendly.teams)
    ? friendly.teams[0]
    : friendly.teams;

  if (!team) {
    notFound();
  }

  const clubRelation = team.clubs;

  const club = Array.isArray(clubRelation)
    ? clubRelation[0]
    : clubRelation;

  if (!club) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}
      <header className="flex items-center">
  <Link
    href={`/friendlies/${friendly.id}`}
    className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-700"
    aria-label="Back"
  >
    <ArrowLeft size={20} />
  </Link>

  <h1 className="flex-1 pr-11 text-center text-lg font-bold text-slate-900">
    Edit Match
  </h1>
</header>

<section className="mt-6">
  <h2 className="text-[26px] font-bold tracking-tight text-slate-900">
    Update match details
  </h2>

  <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
  Update your match details and save your changes.
</p>
</section>

      <FriendlyForm
        mode="edit"
        friendlyId={friendly.id}
        teamId={friendly.team_id}
        teamName={team.name}
        clubName={club.name}
        initialValues={{
          matchDate: friendly.match_date,
          kickOffTime: friendly.kick_off_time.slice(0, 5),
          venueType: friendly.venue_type as
            | "home"
            | "away"
            | "either",
          matchFormat: friendly.match_format as
            | "5v5"
            | "7v7"
            | "9v9"
            | "11v11",
          location: friendly.location,
          notes: friendly.notes ?? "",
        }}
      />
    </main>
  );
}
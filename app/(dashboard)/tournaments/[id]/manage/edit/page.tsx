import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  ArrowLeft,
  Trophy,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { EditTournamentForm } from "@/features/tournaments/components/edit-tournament-form";

type EditTournamentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTournamentPage({
  params,
}: EditTournamentPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
      id,
      created_by,
      name,
      age_group,
      gender,
      level,
      match_format,
      start_date,
start_time,
end_date,
end_time,
      location,
      entry_fee,
      max_teams,
      description,
      status
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "Edit tournament load error:",
      error
    );

    notFound();
  }

  if (!tournament) {
    notFound();
  }

  if (tournament.created_by !== user.id) {
    redirect(`/tournaments/${id}`);
  }


  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      {/* Header */}
      <header className="relative flex items-center justify-center">
        <Link
          href={`/tournaments/${id}/manage`}
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <ArrowLeft size={22} />
        </Link>

        <h1 className="text-xl font-bold text-slate-950">
          Edit Tournament
        </h1>
      </header>

      {/* Tournament summary */}
      <section className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white">
            <Trophy
              size={24}
              className="text-violet-600"
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-950">
              {tournament.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update tournament details
            </p>
          </div>
        </div>
      </section>

      <EditTournamentForm
  tournament={tournament}
/>
    </main>
  );
}
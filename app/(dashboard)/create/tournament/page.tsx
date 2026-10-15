import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CreateTournamentForm } from "@/features/tournaments/components/create-tournament-form";

export default async function CreateTournamentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-32 pt-6">
      <CreateTournamentForm />
    </main>
  );
}
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setTournamentStatus(
  tournamentId: string,
  status: "open" | "closed"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: tournament, error: tournamentError } =
    await supabase
      .from("tournaments")
      .select(`
        id,
        created_by
      `)
      .eq("id", tournamentId)
      .maybeSingle();

  if (tournamentError || !tournament) {
    throw new Error("Tournament not found.");
  }

  if (tournament.created_by !== user.id) {
    throw new Error(
      "You cannot change this tournament."
    );
  }

  const { error } = await supabase
    .from("tournaments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tournamentId);

  if (error) {
    console.error(
      "Tournament status update error:",
      error
    );

    throw new Error(error.message);
  }

  revalidatePath(
    `/tournaments/${tournamentId}`
  );

  revalidatePath(
    `/tournaments/${tournamentId}/manage`
  );

  revalidatePath("/matches");
}
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function completeTournament(
  tournamentId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const {
    data: tournament,
    error: tournamentError,
  } = await supabase
    .from("tournaments")
    .select(`
      id,
      name,
      created_by,
      status,
      start_date,
      end_date
    `)
    .eq("id", tournamentId)
    .maybeSingle();

  if (
    tournamentError ||
    !tournament
  ) {
    throw new Error(
      "Tournament not found."
    );
  }

  if (
    tournament.created_by !==
    user.id
  ) {
    throw new Error(
      "You cannot complete this tournament."
    );
  }

  if (
    tournament.status === "cancelled"
  ) {
    throw new Error(
      "A cancelled tournament cannot be completed."
    );
  }

  if (
    tournament.status === "completed"
  ) {
    return {
      success: true,
    };
  }

  const { error: updateError } =
    await supabase
      .from("tournaments")
      .update({
        status: "completed",
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", tournamentId);

  if (updateError) {
    console.error(
      "Complete tournament error:",
      updateError
    );

    throw new Error(
      updateError.message
    );
  }

  revalidatePath(
    `/tournaments/${tournamentId}`
  );

  revalidatePath(
    `/tournaments/${tournamentId}/manage`
  );

  revalidatePath(
    `/tournaments/${tournamentId}/manage/teams`
  );

  revalidatePath(
    "/matches"
  );

  return {
    success: true,
  };
}
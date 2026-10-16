"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type SaveMatchNoteInput = {
  matchId: string;
  teamId: string;
  note: string;
};

export async function saveMatchNoteAction(
  input: SaveMatchNoteInput
): Promise<{
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "You must be signed in.",
    };
  }

  const cleanNote =
    input.note.trim();

  if (!input.matchId || !input.teamId) {
    return {
      error: "Invalid match.",
    };
  }

  if (!cleanNote) {
    return {
      error: "Please enter a note.",
    };
  }

  if (cleanNote.length > 2000) {
    return {
      error:
        "Your note must be 2000 characters or less.",
    };
  }

  const { error } = await supabase.rpc(
    "save_match_note",
    {
      p_match_id: input.matchId,
      p_team_id: input.teamId,
      p_note: cleanNote,
    }
  );

  if (error) {
    console.error(
      "SAVE MATCH NOTE ERROR:",
      error
    );

    return {
      error:
        error.message ||
        "Unable to save the note.",
    };
  }

  revalidatePath(
    `/matches/${input.matchId}`
  );

  return {
    error: null,
  };
}
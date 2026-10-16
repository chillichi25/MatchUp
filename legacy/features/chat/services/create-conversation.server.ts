"use server";

import { createClient } from "@/lib/supabase/server";

export async function createConversation(
  matchId: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("match_conversations")
    .insert({
      match_id: matchId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
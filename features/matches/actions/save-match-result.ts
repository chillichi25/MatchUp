"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type SaveMatchResultInput = {
  matchId: string;
  homeScore: number;
  awayScore: number;
};

export async function saveMatchResult({
  matchId,
  homeScore,
  awayScore,
}: SaveMatchResultInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .select();

  console.log("SAVE RESULT DATA:", data);
  console.log("SAVE RESULT ERROR:", error);

  if (error) {
    throw error;
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/matches");
  revalidatePath("/dashboard");
}
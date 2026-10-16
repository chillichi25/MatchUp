import { supabase } from "@/lib/supabase/client";

import {
  computeTeamStatistics,
  type MatchStatRow,
  type TeamStatistics,
} from "../utils/team-statistics";

/**
 * Aggregates the active team's completed matches into a win/draw/loss record
 * with goals for, against and difference.
 */
export async function getTeamStatistics(
  teamId: string
): Promise<TeamStatistics> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
        home_team_id,
        away_team_id,
        home_score,
        away_score
      `
    )
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq("status", "completed");

  if (error) {
    throw error;
  }

  return computeTeamStatistics((data ?? []) as MatchStatRow[], teamId);
}

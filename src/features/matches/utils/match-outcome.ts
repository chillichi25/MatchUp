export type MatchOutcome = "win" | "draw" | "loss";

/** Derives a team's result from its own and the opponent's score. */
export function computeOutcome(
  myScore: number,
  opponentScore: number
): MatchOutcome {
  if (myScore > opponentScore) {
    return "win";
  }

  if (myScore < opponentScore) {
    return "loss";
  }

  return "draw";
}

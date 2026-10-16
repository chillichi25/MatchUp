export type TeamStatistics = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

export type MatchStatRow = {
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
};

/**
 * Pure aggregation of completed match rows into a team's record. Kept free of
 * data-access so the win/draw/loss and goal arithmetic can be unit tested.
 */
export function computeTeamStatistics(
  rows: MatchStatRow[],
  teamId: string
): TeamStatistics {
  let played = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const row of rows) {
    played++;

    const isHome = row.home_team_id === teamId;

    const myGoals = (isHome ? row.home_score : row.away_score) ?? 0;
    const opponentGoals = (isHome ? row.away_score : row.home_score) ?? 0;

    goalsFor += myGoals;
    goalsAgainst += opponentGoals;

    if (myGoals > opponentGoals) {
      wins++;
    } else if (myGoals < opponentGoals) {
      losses++;
    } else {
      draws++;
    }
  }

  return {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
  };
}

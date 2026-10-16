import { describe, expect, it } from "@jest/globals";

import { computeTeamStatistics } from "./team-statistics";

const TEAM = "team-1";

describe("computeTeamStatistics", () => {
  it("returns a zeroed record for no matches", () => {
    expect(computeTeamStatistics([], TEAM)).toEqual({
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    });
  });

  it("counts wins, draws and losses from both home and away", () => {
    const stats = computeTeamStatistics(
      [
        { home_team_id: TEAM, away_team_id: "x", home_score: 3, away_score: 1 },
        { home_team_id: "x", away_team_id: TEAM, home_score: 0, away_score: 2 },
        { home_team_id: TEAM, away_team_id: "x", home_score: 1, away_score: 1 },
        { home_team_id: "x", away_team_id: TEAM, home_score: 4, away_score: 0 },
      ],
      TEAM
    );

    expect(stats.played).toBe(4);
    expect(stats.wins).toBe(2);
    expect(stats.draws).toBe(1);
    expect(stats.losses).toBe(1);
    expect(stats.goalsFor).toBe(6);
    expect(stats.goalsAgainst).toBe(6);
    expect(stats.goalDifference).toBe(0);
  });

  it("treats missing scores as zero", () => {
    const stats = computeTeamStatistics(
      [
        {
          home_team_id: TEAM,
          away_team_id: "x",
          home_score: null,
          away_score: null,
        },
      ],
      TEAM
    );

    expect(stats.played).toBe(1);
    expect(stats.draws).toBe(1);
  });
});

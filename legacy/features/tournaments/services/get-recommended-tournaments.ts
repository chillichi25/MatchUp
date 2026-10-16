"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";
import { calculateTournamentScore } from "@/features/tournaments/services/tournament-recommendation.service";

export type RecommendedTournament = {
  id: string;

  name: string;

  ageGroup: string | null;
  level: string | null;
  gender: string | null;
  matchFormat: string | null;

  startDate: string;
  endDate: string | null;

  location: string | null;

  entryFee: number | null;
  maxTeams: number | null;

  distance: number | null;

  score: number;

  isRecommended: boolean;
};

export async function getRecommendedTournaments(): Promise<
  RecommendedTournament[]
> {
  const supabase = await createClient();

  const team = await getActiveTeam();

  if (!team) {
    return [];
  }

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const [
    tournamentResult,
    tournamentDistanceResult,
  ] = await Promise.all([
    supabase
      .from("tournaments")
      .select(`
        id,
        name,
        age_group,
        gender,
        level,
        match_format,
        start_date,
        end_date,
        location,
        entry_fee,
        max_teams,
        status
      `)
      .eq("status", "open")
      .gte("start_date", today)
      .order("start_date", {
        ascending: true,
      }),

    supabase.rpc(
      "tournaments_with_distance_from_club",
      {
        p_club_id: team.club_id,
      }
    ),
  ]);

  const {
    data: tournamentCandidates,
    error: tournamentError,
  } = tournamentResult;

  const {
    data: tournamentDistanceRows,
    error: tournamentDistanceError,
  } = tournamentDistanceResult;

  if (tournamentError) {
    console.error(
      "RECOMMENDED TOURNAMENTS ERROR:",
      tournamentError
    );

    return [];
  }

  if (tournamentDistanceError) {
    console.error(
      "RECOMMENDED TOURNAMENT DISTANCE ERROR:",
      tournamentDistanceError
    );
  }

  const tournamentDistances =
    new Map<string, number>(
      (tournamentDistanceRows ?? []).map(
        (row: any) => [
          row.tournament_id,
          Number(row.distance_miles),
        ]
      )
    );

  const scoredTournaments =
    (tournamentCandidates ?? [])
      .map((tournament: any) => {
        const distanceMiles =
          tournamentDistances.get(
            tournament.id
          ) ?? null;

        const score =
          calculateTournamentScore({
            activeAgeGroup:
              team.age_group ?? null,

            activeLevel:
              team.level ?? null,

            activeGender:
              team.gender ?? null,

            activeMatchFormat:
              team.match_format ?? null,

            tournamentAgeGroup:
              tournament.age_group ?? null,

            tournamentLevel:
              tournament.level ?? null,

            tournamentGender:
              tournament.gender ?? null,

            tournamentMatchFormat:
              tournament.match_format ?? null,

            distanceMiles,

            startDate:
              tournament.start_date ?? null,

            status:
              tournament.status ?? null,
          });

        return {
          ...tournament,
          distanceMiles,
          score,
        };
      })
      .sort((a: any, b: any) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        if (
          a.distanceMiles !== null &&
          b.distanceMiles !== null &&
          a.distanceMiles !==
            b.distanceMiles
        ) {
          return (
            a.distanceMiles -
            b.distanceMiles
          );
        }

        if (
          a.distanceMiles !== null &&
          b.distanceMiles === null
        ) {
          return -1;
        }

        if (
          a.distanceMiles === null &&
          b.distanceMiles !== null
        ) {
          return 1;
        }

        return (
          new Date(
            a.start_date
          ).getTime() -
          new Date(
            b.start_date
          ).getTime()
        );
      });

  return scoredTournaments.map(
    (tournament, index) => ({
      id:
        tournament.id,

      name:
        tournament.name,

      ageGroup:
        tournament.age_group ??
        null,

      level:
        tournament.level ??
        null,

      gender:
        tournament.gender ??
        null,

      matchFormat:
        tournament.match_format ??
        null,

      startDate:
        new Date(
          `${tournament.start_date}T00:00:00`
        ).toLocaleDateString(
          "en-GB",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
          }
        ),

      endDate:
        tournament.end_date
          ? new Date(
              `${tournament.end_date}T00:00:00`
            ).toLocaleDateString(
              "en-GB",
              {
                weekday: "short",
                day: "numeric",
                month: "short",
              }
            )
          : null,

      location:
        tournament.location ??
        null,

      entryFee:
        tournament.entry_fee ??
        null,

      maxTeams:
        tournament.max_teams ??
        null,

      distance:
        tournament.distanceMiles,

      score:
        tournament.score,

      isRecommended:
        index === 0,
    })
  );
}
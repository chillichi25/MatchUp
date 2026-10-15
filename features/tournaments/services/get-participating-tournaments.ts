"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";

export async function getParticipatingTournaments() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      activeTeam: null,
      tournaments: [],
    };
  }

  const activeTeam =
    await getActiveTeam();

  if (!activeTeam) {
    return {
      activeTeam: null,
      tournaments: [],
    };
  }

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const {
    data: requests,
    error,
  } = await supabase
    .from("tournament_requests")
    .select(`
      id,
      status,
      tournament_id,

      tournaments!inner (
        id,
        name,
        age_group,
        gender,
        level,
        match_format,
        start_date,
        start_time,
        end_date,
        end_time,
        location,
        entry_fee,
        max_teams,
        status
      )
    `)
    .eq(
      "requesting_team_id",
      activeTeam.id
    )
    .eq(
      "status",
      "accepted"
    )
    .in(
      "tournaments.status",
      [
        "open",
        "closed",
      ]
    )
    .gte(
      "tournaments.end_date",
      today
    );

  if (error) {
    console.error(
      "Participating tournaments error:",
      error
    );

    return {
      activeTeam,
      tournaments: [],
    };
  }

  const tournaments =
    (requests ?? [])
      .map((request: any) => {
        const tournament =
          Array.isArray(
            request.tournaments
          )
            ? request.tournaments[0]
            : request.tournaments;

        if (!tournament) {
          return null;
        }

        return {
          requestId:
            request.id,

          id:
            tournament.id,

          name:
            tournament.name,

          ageGroup:
            tournament.age_group ??
            null,

          gender:
            tournament.gender ??
            null,

          level:
            tournament.level ??
            null,

          matchFormat:
            tournament.match_format ??
            null,

          startDate:
            tournament.start_date,

          startTime:
            tournament.start_time ??
            null,

          endDate:
            tournament.end_date ??
            null,

          endTime:
            tournament.end_time ??
            null,

          location:
            tournament.location ??
            null,

          entryFee:
            tournament.entry_fee ??
            null,

          maxTeams:
            tournament.max_teams ??
            null,

          status:
            tournament.status,
        };
      })
      .filter(Boolean)
      .sort(
        (a: any, b: any) => {
          const aDateTime =
            new Date(
              `${a.startDate}T${
                a.startTime ??
                "00:00:00"
              }`
            ).getTime();

          const bDateTime =
            new Date(
              `${b.startDate}T${
                b.startTime ??
                "00:00:00"
              }`
            ).getTime();

          return (
            aDateTime -
            bDateTime
          );
        }
      );

  return {
    activeTeam: {
      id:
        activeTeam.id,

      name:
        activeTeam.name,

      ageGroup:
        activeTeam.age_group ??
        null,
    },

    tournaments,
  };
}
"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";
import { calculateFriendlyScore } from "@/features/matches/services/match-recommendation.service";

export type RecommendedFriendly = {
  id: string;

  clubName: string;
  badgeUrl: string | null;

  teamName: string;
  ageGroup: string | null;
  level: string | null;
  gender: string | null;

  lookingFor: "home" | "away";

  matchFormat: string | null;

  matchDate: string;
  kickOff: string | null;

  location: string | null;

  distance: number | null;

  score: number;

  isBestMatch: boolean;

  matchReasons: string[];
};

export async function getRecommendedFriendlies(): Promise<
  RecommendedFriendly[]
> {
  const supabase = await createClient();

  // --------------------------------------------------
  // ACTIVE TEAM
  // --------------------------------------------------

  const team = await getActiveTeam();

if (!team) {
  return [];
}

// --------------------------------------------------
// EXPIRE OVERDUE FRIENDLIES + REQUESTS
// --------------------------------------------------

const {
  error: expiryError,
} = await supabase.rpc(
  "expire_friendly_requests"
);

if (expiryError) {
  console.error(
    "EXPIRE FRIENDLIES ERROR:",
    expiryError
  );
}

// --------------------------------------------------
// UK DATE / TIME
// --------------------------------------------------

const ukNow = new Date(
  new Date().toLocaleString(
    "en-US",
    {
      timeZone: "Europe/London",
    }
  )
);

const today =
  `${ukNow.getFullYear()}-` +
  `${String(
    ukNow.getMonth() + 1
  ).padStart(2, "0")}-` +
  `${String(
    ukNow.getDate()
  ).padStart(2, "0")}`;

const currentTime =
  `${String(
    ukNow.getHours()
  ).padStart(2, "0")}:` +
  `${String(
    ukNow.getMinutes()
  ).padStart(2, "0")}:` +
  `${String(
    ukNow.getSeconds()
  ).padStart(2, "0")}`;

  // --------------------------------------------------
  // FRIENDLIES + ACTIVE REQUIREMENTS + DISTANCES
  // --------------------------------------------------

  const [
    friendlyResult,
    activeTeamFriendliesResult,
    friendlyDistanceResult,
  ] = await Promise.all([
    // -----------------------------------------------
    // 1. Candidate friendlies
    // -----------------------------------------------

    supabase
      .from("friendlies")
      .select(`
        id,
        team_id,
        created_by,
        match_date,
        kick_off_time,
        venue_type,
        match_format,
        location,
        notes,
        status,

        team:team_id (
          id,
          name,
          age_group,
          gender,
          level,

          clubs (
            id,
            name,
            badge_url,
            city
          )
        )
      `)
      .eq("status", "open")
      .neq("team_id", team.id)
      .gte("match_date", today)
      .order("match_date", {
        ascending: true,
      }),

    // -----------------------------------------------
    // 2. Active team's own open friendlies
    // -----------------------------------------------

    supabase
      .from("friendlies")
      .select(`
        id,
        match_date,
        venue_type,
        match_format
      `)
      .eq("team_id", team.id)
      .eq("status", "open")
      .gte("match_date", today)
      .order("match_date", {
        ascending: true,
      }),

    // -----------------------------------------------
    // 3. Real PostGIS distances
    // -----------------------------------------------

    supabase.rpc(
      "friendlies_with_distance_from_club",
      {
        p_club_id: team.club_id,
      }
    ),
  ]);

  // --------------------------------------------------
  // EXTRACT RESULTS
  // --------------------------------------------------

  const {
    data: friendlyCandidates,
    error: friendlyError,
  } = friendlyResult;

  const {
    data: activeTeamFriendlies,
    error: activeTeamFriendliesError,
  } = activeTeamFriendliesResult;

  const {
    data: friendlyDistanceRows,
    error: friendlyDistanceError,
  } = friendlyDistanceResult;

  // --------------------------------------------------
  // ERRORS
  // --------------------------------------------------

  if (friendlyError) {
    console.error(
      "RECOMMENDED FRIENDLIES ERROR:",
      friendlyError
    );

    return [];
  }

  if (activeTeamFriendliesError) {
    console.error(
      "RECOMMENDED ACTIVE TEAM FRIENDLIES ERROR:",
      activeTeamFriendliesError
    );
  }

  if (friendlyDistanceError) {
    console.error(
      "RECOMMENDED FRIENDLY DISTANCE ERROR:",
      friendlyDistanceError
    );
  }

  // --------------------------------------------------
  // DISTANCE LOOKUP
  // --------------------------------------------------

  const friendlyDistances = new Map<
    string,
    number
  >(
    (friendlyDistanceRows ?? []).map(
      (row: any) => [
        row.friendly_id,
        Number(row.distance_miles),
      ]
    )
  );

  // --------------------------------------------------
  // SCORE FRIENDLIES
  // --------------------------------------------------

  const scoredFriendlies =
  (friendlyCandidates ?? [])
    .filter((friendly: any) => {
      // Future dates are valid.
      if (friendly.match_date > today) {
        return true;
      }

      // Past dates are invalid.
      if (friendly.match_date < today) {
        return false;
      }

      // For today, kick-off must still be in the future.
      if (!friendly.kick_off_time) {
        return false;
      }

      return friendly.kick_off_time > currentTime;
    })
    .map((friendly: any) => {
        const friendlyTeam =
          Array.isArray(friendly.team)
            ? friendly.team[0]
            : friendly.team;

        if (!friendlyTeam) {
          return null;
        }

        // --------------------------------------------
        // Real geographic distance
        // --------------------------------------------

        const distanceMiles =
          friendlyDistances.get(
            friendly.id
          ) ?? null;

        // --------------------------------------------
        // Active team's requirement for same date
        // --------------------------------------------

        const activeFriendlyForDate =
          (activeTeamFriendlies ?? []).find(
            (activeFriendly) =>
              activeFriendly.match_date ===
              friendly.match_date
          );

        const activeVenueType =
          activeFriendlyForDate?.venue_type ===
            "home" ||
          activeFriendlyForDate?.venue_type ===
            "away"
            ? activeFriendlyForDate.venue_type
            : null;

        // --------------------------------------------
        // Candidate's venue requirement
        // --------------------------------------------

        const opportunityVenueType =
          friendly.venue_type === "home" ||
          friendly.venue_type === "away"
            ? friendly.venue_type
            : null;

        // --------------------------------------------
        // Intelligent MatchUp score
        // --------------------------------------------

        const score =
          calculateFriendlyScore({
            activeAgeGroup:
              team.age_group ?? null,

            activeLevel:
              team.level ?? null,

            activeGender:
              team.gender ?? null,

            activeMatchFormat:
              team.match_format ?? null,

            opportunityAgeGroup:
              friendlyTeam.age_group ??
              null,

            opportunityLevel:
              friendlyTeam.level ??
              null,

            opportunityGender:
              friendlyTeam.gender ??
              null,

            opportunityMatchFormat:
              friendly.match_format ??
              null,

            distanceMiles,

            activeVenueType,

            opportunityVenueType,
          });

        return {
          ...friendly,

          friendlyTeam,

          distanceMiles,

          activeVenueType,

          opportunityVenueType,

          score,
        };
      })
      .filter(
        (
          friendly
        ): friendly is NonNullable<
          typeof friendly
        > => friendly !== null
      )

      // ----------------------------------------------
      // RANK
      // ----------------------------------------------

      .sort((a, b) => {
        // Higher MatchUp score first
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        // Same score:
        // closest opportunity first
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

        // Known distance beats unknown distance
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

        // Still tied:
        // earliest opportunity first
        return (
          new Date(
            a.match_date
          ).getTime() -
          new Date(
            b.match_date
          ).getTime()
        );
      });

  // --------------------------------------------------
  // FORMAT FOR UI
  // --------------------------------------------------

  return scoredFriendlies.map(
    (friendly, index) => {
      const friendlyTeam =
        friendly.friendlyTeam;

      const friendlyClub =
        Array.isArray(
          friendlyTeam.clubs
        )
          ? friendlyTeam.clubs[0]
          : friendlyTeam.clubs;

const matchReasons: string[] = [];

if (
  team.age_group &&
  friendlyTeam.age_group === team.age_group
) {
  matchReasons.push("Same age");
}

if (
  team.level &&
  friendlyTeam.level === team.level
) {
  matchReasons.push("Same level");
}

if (
  team.gender &&
  friendlyTeam.gender === team.gender
) {
  matchReasons.push("Same category");
}

if (
  team.match_format &&
  friendly.match_format === team.match_format
) {
  matchReasons.push(team.match_format);
}

if (
  friendly.activeVenueType &&
  friendly.opportunityVenueType &&
  friendly.activeVenueType !==
    friendly.opportunityVenueType
) {
  matchReasons.push("Home/Away fit");
}

if (
  friendly.distanceMiles !== null &&
  friendly.distanceMiles <= 10
) {
  matchReasons.push("Nearby");
}

      return {
        id: friendly.id,

        clubName:
          friendlyClub?.name ?? "",

        badgeUrl:
          friendlyClub?.badge_url ??
          null,

        teamName:
          friendlyTeam.name,

        ageGroup:
          friendlyTeam.age_group ??
          null,

        level:
          friendlyTeam.level ?? null,

        gender:
          friendlyTeam.gender ?? null,

        lookingFor:
          friendly.venue_type === "home"
            ? ("home" as const)
            : ("away" as const),

        matchFormat:
          friendly.match_format ??
          null,

        matchDate: new Date(
          `${friendly.match_date}T00:00:00`
        ).toLocaleDateString(
          "en-GB",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
          }
        ),

        kickOff:
          friendly.kick_off_time?.slice(
            0,
            5
          ) ?? null,

        location:
          friendly.location ?? null,

        distance:
          friendly.distanceMiles,

        score:
          friendly.score,

        // Highest-ranked opportunity only
        isBestMatch: index === 0,

        matchReasons,
      };
    }
  );
}
"use server";

import { createClient } from "@/lib/supabase/server";

import { getActiveTeam } from "@/features/teams/services/get-active-team.server";
import { getAvailableTeams } from "@/features/teams/services/active-team.service";

import { getTeamStatistics } from "@/features/matches/services/get-team-statistics";
import { getRecentResults } from "@/features/matches/services/get-recent-results";
import { calculateFriendlyScore } from "@/features/matches/services/match-recommendation.service";
import { calculateTournamentScore } from "@/features/tournaments/services/tournament-recommendation.service";

export async function getDashboardData() {
  const supabase = await createClient();

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      coachName: "Coach",

      activeTeamId: "",
      teams: [],

      clubName: "",
      teamName: "",
      badgeUrl: null,

      nextMatch: null,
      nextTournament: null,

      upcomingMatches: [],
      upcomingTournaments: [],

      friendly: null,
      tournament: null,

      notifications: [],
      unreadNotifications: 0,

      stats: {
        pendingRequests: 0,
        awaitingResponses: 0,
        upcomingMatches: 0,
        tournaments: 0,
      },

      statistics: null,
      recentResults: [],
    };
  }

  // --------------------------------------------------
  // PROFILE + ACTIVE TEAM + AVAILABLE TEAMS
  // --------------------------------------------------

  const [
    profileResult,
    team,
    availableTeams,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle(),

    getActiveTeam(),

    getAvailableTeams(),
  ]);

  const profile =
    profileResult.data;

  if (profileResult.error) {
    console.error(
      "DASHBOARD PROFILE ERROR:",
      profileResult.error
    );
  }

  // --------------------------------------------------
  // NO ACTIVE TEAM
  // --------------------------------------------------

  if (!team) {
    return {
      coachName:
        profile?.first_name?.trim() ||
        "Coach",

      activeTeamId: "",
      teams: [],

      clubName: "",
      teamName: "",
      badgeUrl: null,

      nextMatch: null,
      nextTournament: null,

      upcomingMatches: [],
      upcomingTournaments: [],

      friendly: null,
      tournament: null,

      notifications: [],
      unreadNotifications: 0,

      stats: {
        pendingRequests: 0,
        awaitingResponses: 0,
        upcomingMatches: 0,
        tournaments: 0,
      },

      statistics: null,
      recentResults: [],
    };
  }

  // --------------------------------------------------
  // ACTIVE CLUB
  // --------------------------------------------------

  const clubRelation =
    team.clubs;

  const club =
    Array.isArray(clubRelation)
      ? clubRelation[0] ?? null
      : clubRelation;

  // --------------------------------------------------
  // TEAM SWITCHER
  // --------------------------------------------------

  const switcherTeams =
    availableTeams.map(
      (availableTeam) => {
        const availableClub =
          Array.isArray(
            availableTeam.clubs
          )
            ? availableTeam.clubs[0] ??
              null
            : availableTeam.clubs;

        return {
          id:
            availableTeam.id,

          name:
            availableTeam.name,

          age_group:
            availableTeam.age_group ??
            null,

          gender:
            availableTeam.gender ??
            null,

          level:
            availableTeam.level ??
            null,

          club: {
            id:
              availableClub?.id ??
              "",

            name:
              availableClub?.name ??
              "",

            badgeUrl:
              availableClub?.badge_url ??
              null,

            city:
              availableClub?.city ??
              null,
          },
        };
      }
    );

  // --------------------------------------------------
  // TODAY
  // --------------------------------------------------

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  // --------------------------------------------------
  // PARALLEL DASHBOARD QUERIES
  // --------------------------------------------------

  const [
    matchesResult,
    participatingTournamentsResult,
    teamTournamentRequestsResult,
    friendlyResult,
    activeTeamFriendliesResult,
    friendlyDistanceResult,
    notificationsResult,
    upcomingMatchesCountResult,
    pendingRequestsResult,
    awaitingResponsesResult,
    tournamentCandidatesResult,
    tournamentDistanceResult,
    tournamentCountResult,
    unreadNotificationsResult,
    statistics,
    recentResults,
  ] = await Promise.all([
    // ------------------------------------------------
    // UPCOMING SCHEDULED MATCHES
    // ------------------------------------------------

    supabase
      .from("matches")
      .select(`
        id,
        match_date,
        kick_off_time,
        location,

        home:home_team_id (
          id,
          name,

          clubs (
            name,
            badge_url
          )
        ),

        away:away_team_id (
          id,
          name,

          clubs (
            name,
            badge_url
          )
        ),

        match_conversations (
          id
        )
      `)
      .or(
        `home_team_id.eq.${team.id},away_team_id.eq.${team.id}`
      )
      .eq(
        "status",
        "scheduled"
      )
      .gte(
        "match_date",
        today
      )
      .order(
        "match_date",
        {
          ascending: true,
        }
      )
      .order(
        "kick_off_time",
        {
          ascending: true,
        }
      )
      .limit(5),

    // ------------------------------------------------
    // PARTICIPATING TOURNAMENTS
    // ------------------------------------------------

    supabase
      .from("tournament_requests")
      .select(`
        id,
        status,
        tournament_id,

        tournaments!inner (
          id,
          name,
          age_group,
          start_date,
          start_time,
          end_date,
          end_time,
          location,
          status
        )
      `)
      .eq(
        "requesting_team_id",
        team.id
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
      ),

    // ------------------------------------------------
    // TEAM TOURNAMENT REQUESTS
    // ------------------------------------------------

    supabase
      .from("tournament_requests")
      .select(`
        tournament_id,
        status
      `)
      .eq(
        "requesting_team_id",
        team.id
      )
      .in(
        "status",
        [
          "pending",
          "accepted",
        ]
      ),

    // ------------------------------------------------
    // CANDIDATE FRIENDLIES
    // ------------------------------------------------

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
      .eq(
        "status",
        "open"
      )
      .neq(
        "team_id",
        team.id
      )
      .gte(
        "match_date",
        today
      )
      .order(
        "match_date",
        {
          ascending: true,
        }
      ),

    // ------------------------------------------------
    // ACTIVE TEAM'S OWN FRIENDLIES
    // ------------------------------------------------

    supabase
      .from("friendlies")
      .select(`
        id,
        match_date,
        venue_type,
        match_format
      `)
      .eq(
        "team_id",
        team.id
      )
      .eq(
        "status",
        "open"
      )
      .gte(
        "match_date",
        today
      )
      .order(
        "match_date",
        {
          ascending: true,
        }
      ),

    // ------------------------------------------------
    // FRIENDLY DISTANCES
    // ------------------------------------------------

    supabase.rpc(
      "friendlies_with_distance_from_club",
      {
        p_club_id:
          team.club_id,
      }
    ),

    // ------------------------------------------------
    // NOTIFICATIONS
    // ------------------------------------------------

    supabase
      .from("notifications")
      .select("*")
      .eq(
        "user_id",
        user.id
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(5),

    // ------------------------------------------------
    // UPCOMING MATCH COUNT
    // ------------------------------------------------

    supabase
      .from("matches")
      .select(
        "*",
        {
          count: "exact",
          head: true,
        }
      )
      .or(
        `home_team_id.eq.${team.id},away_team_id.eq.${team.id}`
      )
      .eq(
        "status",
        "scheduled"
      )
      .gte(
        "match_date",
        today
      ),

    // ------------------------------------------------
    // INCOMING FRIENDLY REQUESTS
    // ------------------------------------------------

    supabase
      .from(
        "friendly_requests"
      )
      .select(
        `
          id,

          friendlies!inner (
            team_id
          )
        `,
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "status",
        "pending"
      )
      .eq(
        "friendlies.team_id",
        team.id
      ),

    // ------------------------------------------------
    // REQUESTS SENT BY COACH
    // ------------------------------------------------

    supabase
      .from("friendly_requests")
      .select(
        "id, requested_by, requesting_team_id, status"
      )
      .eq(
        "requested_by",
        user.id
      )
      .eq(
        "status",
        "pending"
      ),

    // ------------------------------------------------
    // TOURNAMENT CANDIDATES
    // ------------------------------------------------

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
      .eq(
        "status",
        "open"
      )
      .gte(
        "start_date",
        today
      )
      .order(
        "start_date",
        {
          ascending: true,
        }
      ),

    // ------------------------------------------------
    // TOURNAMENT DISTANCES
    // ------------------------------------------------

    supabase.rpc(
      "tournaments_with_distance_from_club",
      {
        p_club_id:
          team.club_id,
      }
    ),

    // ------------------------------------------------
    // TOURNAMENT COUNT
    // ------------------------------------------------

    supabase
      .from("tournaments")
      .select(
        "*",
        {
          count: "exact",
          head: true,
        }
      )
      .neq(
        "status",
        "cancelled"
      ),

    // ------------------------------------------------
    // UNREAD NOTIFICATIONS
    // ------------------------------------------------

    supabase
      .from("notifications")
      .select(
        "*",
        {
          count: "exact",
          head: true,
        }
      )
      .eq(
        "user_id",
        user.id
      )
      .eq(
        "is_read",
        false
      ),

    // ------------------------------------------------
    // STATISTICS
    // ------------------------------------------------

    getTeamStatistics(
      team.id
    ),

    // ------------------------------------------------
    // RECENT RESULTS
    // ------------------------------------------------

    getRecentResults(
      team.id
    ),
  ]);

  // --------------------------------------------------
  // EXTRACT RESULTS
  // --------------------------------------------------

  const {
    data: matches,
    error: matchesError,
  } = matchesResult;

  const {
    data:
      participatingTournamentRequests,
    error:
      participatingTournamentsError,
  } =
    participatingTournamentsResult;

  const {
    data: teamTournamentRequests,
    error:
      teamTournamentRequestsError,
  } =
    teamTournamentRequestsResult;

  const {
    data: friendlyCandidates,
    error: friendlyError,
  } = friendlyResult;

  const {
    data: activeTeamFriendlies,
    error:
      activeTeamFriendliesError,
  } =
    activeTeamFriendliesResult;

  const {
    data: friendlyDistanceRows,
    error:
      friendlyDistanceError,
  } =
    friendlyDistanceResult;

  const {
    data: notifications,
    error: notificationsError,
  } =
    notificationsResult;

  const upcomingMatchesCount =
    upcomingMatchesCountResult
      .count;

  const pendingRequests =
    pendingRequestsResult.count;

  const awaitingResponses =
    awaitingResponsesResult
      .data?.length ?? 0;

  const {
    data: tournamentCandidates,
    error:
      tournamentCandidatesError,
  } =
    tournamentCandidatesResult;

  const {
    data: tournamentDistanceRows,
    error:
      tournamentDistanceError,
  } =
    tournamentDistanceResult;

  const unreadNotifications =
    unreadNotificationsResult
      .count;

  // --------------------------------------------------
  // ERRORS
  // --------------------------------------------------

  if (matchesError) {
    console.error(
      "DASHBOARD UPCOMING MATCHES ERROR:",
      matchesError
    );
  }

  if (
    participatingTournamentsError
  ) {
    console.error(
      "DASHBOARD PARTICIPATING TOURNAMENTS ERROR:",
      participatingTournamentsError
    );
  }

  if (
    teamTournamentRequestsError
  ) {
    console.error(
      "DASHBOARD TEAM TOURNAMENT REQUESTS ERROR:",
      teamTournamentRequestsError
    );
  }

  if (friendlyError) {
    console.error(
      "DASHBOARD FRIENDLIES ERROR:",
      friendlyError
    );
  }

  if (
    activeTeamFriendliesError
  ) {
    console.error(
      "ACTIVE TEAM FRIENDLIES ERROR:",
      activeTeamFriendliesError
    );
  }

  if (
    friendlyDistanceError
  ) {
    console.error(
      "FRIENDLY DISTANCE ERROR:",
      friendlyDistanceError
    );
  }

  if (
    tournamentCandidatesError
  ) {
    console.error(
      "DASHBOARD TOURNAMENT CANDIDATES ERROR:",
      tournamentCandidatesError
    );
  }

  if (
    tournamentDistanceError
  ) {
    console.error(
      "DASHBOARD TOURNAMENT DISTANCE ERROR:",
      tournamentDistanceError
    );
  }

  if (notificationsError) {
    console.error(
      "DASHBOARD NOTIFICATIONS ERROR:",
      notificationsError
    );
  }

  // --------------------------------------------------
  // FRIENDLY DISTANCE MAP
  // --------------------------------------------------

  const friendlyDistances =
    new Map<string, number>(
      (
        friendlyDistanceRows ??
        []
      ).map(
        (row: any) => [
          row.friendly_id,
          Number(
            row.distance_miles
          ),
        ]
      )
    );

  // --------------------------------------------------
  // SCORE FRIENDLIES
  // --------------------------------------------------

  const scoredFriendlies =
    (
      friendlyCandidates ??
      []
    )
      .map(
        (friendly: any) => {
          const friendlyTeam =
            Array.isArray(
              friendly.team
            )
              ? friendly.team[0]
              : friendly.team;

          if (!friendlyTeam) {
            return null;
          }

          const distanceMiles =
            friendlyDistances.get(
              friendly.id
            ) ?? null;

          const activeFriendlyForDate =
            (
              activeTeamFriendlies ??
              []
            ).find(
              (
                activeFriendly
              ) =>
                activeFriendly
                  .match_date ===
                friendly
                  .match_date
            );

          const activeVenueType =
            activeFriendlyForDate
              ?.venue_type ===
              "home" ||
            activeFriendlyForDate
              ?.venue_type ===
              "away"
              ? activeFriendlyForDate
                  .venue_type
              : null;

          const opportunityVenueType =
            friendly.venue_type ===
              "home" ||
            friendly.venue_type ===
              "away"
              ? friendly.venue_type
              : null;

          const score =
            calculateFriendlyScore(
              {
                activeAgeGroup:
                  team.age_group ??
                  null,

                activeLevel:
                  team.level ??
                  null,

                activeGender:
                  team.gender ??
                  null,

                activeMatchFormat:
                  team.match_format ??
                  null,

                opportunityAgeGroup:
                  friendlyTeam
                    .age_group ??
                  null,

                opportunityLevel:
                  friendlyTeam
                    .level ??
                  null,

                opportunityGender:
                  friendlyTeam
                    .gender ??
                  null,

                opportunityMatchFormat:
                  friendly
                    .match_format ??
                  null,

                distanceMiles,

                activeVenueType,

                opportunityVenueType,
              }
            );

          return {
            ...friendly,

            friendlyTeam,

            distanceMiles,

            activeVenueType,

            opportunityVenueType,

            score,
          };
        }
      )
      .filter(Boolean)
      .sort(
        (
          a: any,
          b: any
        ) => {
          if (
            b.score !==
            a.score
          ) {
            return (
              b.score -
              a.score
            );
          }

          if (
            a.distanceMiles !==
              null &&
            b.distanceMiles !==
              null &&
            a.distanceMiles !==
              b.distanceMiles
          ) {
            return (
              a.distanceMiles -
              b.distanceMiles
            );
          }

          if (
            a.distanceMiles !==
              null &&
            b.distanceMiles ===
              null
          ) {
            return -1;
          }

          if (
            a.distanceMiles ===
              null &&
            b.distanceMiles !==
              null
          ) {
            return 1;
          }

          return (
            new Date(
              a.match_date
            ).getTime() -
            new Date(
              b.match_date
            ).getTime()
          );
        }
      );

  const bestFriendly =
    scoredFriendlies[0] ??
    null;

  // --------------------------------------------------
  // TOURNAMENT DISTANCE MAP
  // --------------------------------------------------

  const tournamentDistances =
    new Map<string, number>(
      (
        tournamentDistanceRows ??
        []
      ).map(
        (row: any) => [
          row.tournament_id,
          Number(
            row.distance_miles
          ),
        ]
      )
    );

  // --------------------------------------------------
  // TOURNAMENTS ALREADY JOINED / REQUESTED
  // --------------------------------------------------

  const unavailableTournamentIds =
    new Set(
      (
        teamTournamentRequests ??
        []
      ).map(
        (request: any) =>
          request.tournament_id
      )
    );

  // --------------------------------------------------
  // SCORE TOURNAMENTS
  // --------------------------------------------------

  const scoredTournaments =
    (
      tournamentCandidates ??
      []
    )
      .filter(
        (tournament: any) => {
          if (
            unavailableTournamentIds.has(
              tournament.id
            )
          ) {
            return false;
          }

          if (
            team.age_group &&
            tournament.age_group &&
            team.age_group
              .trim()
              .toLowerCase() !==
              tournament.age_group
                .trim()
                .toLowerCase()
          ) {
            return false;
          }

          const teamGender =
            team.gender
              ?.trim()
              .toLowerCase() ??
            null;

          const tournamentGender =
            tournament.gender
              ?.trim()
              .toLowerCase() ??
            null;

          if (
            teamGender &&
            tournamentGender &&
            tournamentGender !==
              "mixed" &&
            teamGender !==
              tournamentGender
          ) {
            return false;
          }

          return true;
        }
      )
      .map(
        (tournament: any) => {
          const distanceMiles =
            tournamentDistances.get(
              tournament.id
            ) ?? null;

          const score =
            calculateTournamentScore(
              {
                activeAgeGroup:
                  team.age_group ??
                  null,

                activeLevel:
                  team.level ??
                  null,

                activeGender:
                  team.gender ??
                  null,

                activeMatchFormat:
                  team.match_format ??
                  null,

                tournamentAgeGroup:
                  tournament
                    .age_group ??
                  null,

                tournamentLevel:
                  tournament.level ??
                  null,

                tournamentGender:
                  tournament.gender ??
                  null,

                tournamentMatchFormat:
                  tournament
                    .match_format ??
                  null,

                distanceMiles,

                startDate:
                  tournament
                    .start_date ??
                  null,

                status:
                  tournament.status ??
                  null,
              }
            );

          return {
            ...tournament,

            distanceMiles,

            score,
          };
        }
      )
      .sort(
        (
          a: any,
          b: any
        ) => {
          if (
            b.score !==
            a.score
          ) {
            return (
              b.score -
              a.score
            );
          }

          if (
            a.distanceMiles !==
              null &&
            b.distanceMiles !==
              null &&
            a.distanceMiles !==
              b.distanceMiles
          ) {
            return (
              a.distanceMiles -
              b.distanceMiles
            );
          }

          if (
            a.distanceMiles !==
              null &&
            b.distanceMiles ===
              null
          ) {
            return -1;
          }

          if (
            a.distanceMiles ===
              null &&
            b.distanceMiles !==
              null
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
        }
      );

  const bestTournament =
    scoredTournaments[0] ??
    null;

  // --------------------------------------------------
  // FORMAT RECOMMENDED TOURNAMENT
  // --------------------------------------------------

  const tournament =
    bestTournament
      ? {
          id:
            bestTournament.id,

          name:
            bestTournament.name,

          badgeUrl:
            null,

          ageGroup:
            bestTournament
              .age_group ??
            "",

          teams:
            bestTournament
              .max_teams ??
            0,

          date:
            new Date(
              `${bestTournament.start_date}T00:00:00`
            ).toLocaleDateString(
              "en-GB",
              {
                weekday:
                  "short",

                day:
                  "numeric",

                month:
                  "short",
              }
            ),

          location:
            bestTournament
              .location ??
            "",

          distance:
            bestTournament
              .distanceMiles,

          level:
            bestTournament
              .level ??
            null,

          gender:
            bestTournament
              .gender ??
            null,

          matchFormat:
            bestTournament
              .match_format ??
            null,

          entryFee:
            bestTournament
              .entry_fee ??
            null,

          score:
            bestTournament.score,

          recommendation:
            "recommended" as const,
        }
      : null;

  // --------------------------------------------------
  // PARTICIPATING TOURNAMENTS
  // --------------------------------------------------

  const participatingTournaments =
    (
      participatingTournamentRequests ??
      []
    )
      .map(
        (request: any) => {
          const tournament =
            Array.isArray(
              request.tournaments
            )
              ? request
                  .tournaments[0]
              : request.tournaments;

          return (
            tournament ??
            null
          );
        }
      )
      .filter(Boolean)
      .sort(
        (
          a: any,
          b: any
        ) => {
          const aDateTime =
            new Date(
              `${a.start_date}T${
                a.start_time ??
                "00:00:00"
              }`
            ).getTime();

          const bDateTime =
            new Date(
              `${b.start_date}T${
                b.start_time ??
                "00:00:00"
              }`
            ).getTime();

          return (
            aDateTime -
            bDateTime
          );
        }
      );

  const upcomingParticipatingTournamentCount =
    participatingTournaments.length;

  // --------------------------------------------------
  // FORMAT UPCOMING TOURNAMENTS
  // --------------------------------------------------

  const upcomingTournaments =
    participatingTournaments
      .slice(0, 5)
      .map(
        (
          participatingTournament: any
        ) => ({
          id:
            participatingTournament.id,

          name:
            participatingTournament.name,

          ageGroup:
            participatingTournament
              .age_group ??
            null,

          startDate:
            participatingTournament
              .start_date,

          startTime:
            participatingTournament
              .start_time ??
            null,

          endDate:
            participatingTournament
              .end_date ??
            null,

          endTime:
            participatingTournament
              .end_time ??
            null,

          location:
            participatingTournament
              .location ??
            null,
        })
      );

  const formattedNextTournament =
    upcomingTournaments[0] ??
    null;

  // --------------------------------------------------
  // FORMAT UPCOMING MATCHES
  // --------------------------------------------------

  const upcomingMatches =
    (
      matches ??
      []
    ).map(
      (match: any) => {
        const home =
          match.home as any;

        const away =
          match.away as any;

        const conversation =
          Array.isArray(
            match
              .match_conversations
          )
            ? match
                .match_conversations[0]
            : match
                .match_conversations;

        const homeClub =
          Array.isArray(
            home?.clubs
          )
            ? home.clubs[0]
            : home?.clubs;

        const awayClub =
          Array.isArray(
            away?.clubs
          )
            ? away.clubs[0]
            : away?.clubs;

        const isHome =
          home?.id ===
          team.id;

        const opponent =
          isHome
            ? away
            : home;

        const opponentClub =
          isHome
            ? awayClub
            : homeClub;

        return {
          id:
            match.id,

          matchDate:
            match.match_date,

          kickOff:
            match.kick_off_time,

          location:
            match.location,

          conversationId:
            conversation?.id ??
            null,

          isHome,

          opponent: {
            teamName:
              opponent?.name ??
              "Opponent",

            clubName:
              opponentClub
                ?.name ??
              "Opponent",

            badgeUrl:
              opponentClub
                ?.badge_url ??
              null,
          },

          homeTeam: {
            id:
              home?.id ??
              "",

            name:
              home?.name ??
              "",

            clubName:
              homeClub?.name ??
              "",

            badgeUrl:
              homeClub
                ?.badge_url ??
              null,
          },

          awayTeam: {
            id:
              away?.id ??
              "",

            name:
              away?.name ??
              "",

            clubName:
              awayClub?.name ??
              "",

            badgeUrl:
              awayClub
                ?.badge_url ??
              null,
          },
        };
      }
    );

  // The first upcoming match is still
  // used by the existing Up Next card.

  const formattedMatch =
    upcomingMatches[0] ??
    null;

  // --------------------------------------------------
  // FORMAT BEST FRIENDLY
  // --------------------------------------------------

  let formattedFriendly =
    null;

  if (bestFriendly) {
    const friendlyTeam =
      bestFriendly
        .friendlyTeam;

    const friendlyClub =
      Array.isArray(
        friendlyTeam.clubs
      )
        ? friendlyTeam
            .clubs[0]
        : friendlyTeam.clubs;

    formattedFriendly = {
      id:
        bestFriendly.id,

      clubName:
        friendlyClub?.name ??
        "",

      badgeUrl:
        friendlyClub
          ?.badge_url ??
        null,

      teamName:
        friendlyTeam.name,

      ageGroup:
        friendlyTeam
          .age_group,

      level:
        friendlyTeam.level,

      gender:
        friendlyTeam.gender,

      lookingFor:
        bestFriendly
          .venue_type ===
        "home"
          ? "home"
          : "away",

      matchFormat:
        bestFriendly
          .match_format,

      matchDate:
        new Date(
          `${bestFriendly.match_date}T00:00:00`
        ).toLocaleDateString(
          "en-GB",
          {
            weekday:
              "short",

            day:
              "numeric",

            month:
              "short",
          }
        ),

      kickOff:
        bestFriendly
          .kick_off_time
          ?.slice(
            0,
            5
          ) ?? null,

      location:
        bestFriendly
          .location,

      distance:
        bestFriendly
          .distanceMiles,

      score:
        bestFriendly.score,

      recommendation:
        "best-match" as const,
    };
  }

  // --------------------------------------------------
  // COACH NAME
  // --------------------------------------------------

  const coachName =
    profile?.first_name?.trim() ||
    "Coach";

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

  return {
    coachName,

    activeTeamId:
      team.id,

    teams:
      switcherTeams,

    clubName:
      club?.name ?? "",

    teamName:
      team.name,

    badgeUrl:
      club?.badge_url ??
      null,

    // Existing Up Next data

    nextMatch:
      formattedMatch,

    nextTournament:
      formattedNextTournament,

    // New Upcoming section data

    upcomingMatches,

    upcomingTournaments,

    friendly:
      formattedFriendly,

    tournament,

    notifications:
      notifications ??
      [],

    unreadNotifications:
      unreadNotifications ??
      0,

    stats: {
      pendingRequests:
        pendingRequests ??
        0,

      awaitingResponses:
        awaitingResponses ??
        0,

      upcomingMatches:
        upcomingMatchesCount ??
        0,

      tournaments:
        upcomingParticipatingTournamentCount,
    },

    statistics,

    recentResults,
  };
}
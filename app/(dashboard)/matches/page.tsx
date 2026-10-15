import Link from "next/link";

import { TournamentFilters } from "@/features/tournaments/components/tournament-filters";
import { TournamentSort } from "@/features/tournaments/components/tournament-sort";
import { FriendlyFilters } from "@/features/friendlies/components/friendly-filters";
import { FriendlySort } from "@/features/friendlies/components/friendly-sort";
import { GiTrophyCup } from "react-icons/gi";

import {
  CalendarDays,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Trophy,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type MatchesPageProps = {
  searchParams: Promise<{
    type?: string;
    q?: string;
    age?: string;
    level?: string;
    gender?: string;
    format?: string;
    date?: string;
    location?: string;
    distance?: string;
    venue?: string;
    quick?: string;
    sort?: string;
  }>;
};

type GeocodedLocation = {
  lat: number;
  lng: number;
};

async function geocodeLocation(
  location: string
): Promise<GeocodedLocation | null> {
  const params = new URLSearchParams({
    q: location,
    format: "jsonv2",
    limit: "1",
    countrycodes: "gb",
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          "User-Agent": "MatchUp/1.0",
        },
        next: {
          revalidate: 86400,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Location geocoding failed:",
        response.status
      );

      return null;
    }

    const results = await response.json();

    if (
      !Array.isArray(results) ||
      results.length === 0
    ) {
      return null;
    }

    return {
      lat: Number(results[0].lat),
      lng: Number(results[0].lon),
    };
  } catch (error) {
    console.error(
      "Location geocoding error:",
      error
    );

    return null;
  }
}

export default async function MatchesPage({
  searchParams,
}: MatchesPageProps) {
  const {
    type,
    q,
    age,
    level,
    gender,
    format,
    date,
    location,
    distance,
    venue,
    quick,
    sort,
  } = await searchParams;

  const hasActiveFriendlyFilters =
    Boolean(
      q?.trim() ||
        age ||
        level ||
        gender ||
        format ||
        date ||
        location?.trim() ||
        distance ||
        venue ||
        quick
    );

  const hasActiveTournamentFilters =
    Boolean(
      q?.trim() ||
        date ||
        age ||
        level ||
        gender ||
        format ||
        location?.trim() ||
        distance
    );

  const activeType =
    type === "tournaments"
      ? "tournaments"
      : "friendlies";

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ==================================================
  // ACTIVE TEAM / CLUB
  // ==================================================

  let activeTeamId:
    | string
    | null = null;

  let coachClub: {
    id: string;
    name: string;
    city: string | null;
    county: string | null;
    country: string | null;
  } | null = null;

  let coachAgeGroup:
    | string
    | null = null;

  let coachLevel:
    | string
    | null = null;

    let coachMatchFormat:
  | string
  | null = null;

  if (user) {
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("active_team_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Error loading active team:",
        profileError
      );
    }

    if (profile?.active_team_id) {
      activeTeamId =
        profile.active_team_id;

      const {
        data: activeTeam,
        error: activeTeamError,
      } = await supabase
        .from("teams")
        .select(`
  id,
  club_id,
  age_group,
  level,
  match_format,

  clubs!teams_club_id_fkey (
    id,
    name,
    city,
    county,
    country
  )
`)
        .eq(
          "id",
          profile.active_team_id
        )
        .maybeSingle();

      if (activeTeamError) {
        console.error(
          "Error loading active team club:",
          activeTeamError
        );
      }

      coachAgeGroup =
        activeTeam?.age_group ??
        null;

      coachLevel =
        activeTeam?.level ??
        null;

      coachMatchFormat =
        activeTeam?.match_format ??
        null;

      if (activeTeam?.clubs) {
        const clubRelation =
          activeTeam.clubs;

        coachClub =
          Array.isArray(
            clubRelation
          )
            ? clubRelation[0] ??
              null
            : clubRelation;
      }
    }
  }

  const defaultClubCity =
    coachClub?.city?.trim() ??
    "";

  // ==================================================
  // EXPIRE OLD FRIENDLIES
  // ==================================================

  if (user) {
    const {
      error: expiryError,
    } = await supabase.rpc(
      "expire_friendly_requests"
    );

    if (expiryError) {
      console.error(
        "Error expiring friendlies:",
        expiryError
      );
    }
  }

  // ==================================================
  // CURRENT UK DATE / TIME
  // ==================================================

  const ukNow = new Date(
    new Date().toLocaleString(
      "en-US",
      {
        timeZone:
          "Europe/London",
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

  const weekEndDate =
    new Date(ukNow);

  weekEndDate.setDate(
    weekEndDate.getDate() + 6
  );

  const weekEnd =
    `${weekEndDate.getFullYear()}-` +
    `${String(
      weekEndDate.getMonth() + 1
    ).padStart(2, "0")}-` +
    `${String(
      weekEndDate.getDate()
    ).padStart(2, "0")}`;

  // ==================================================
  // FRIENDLIES / MATCHES
  // ==================================================

  const {
    data: friendlies,
    error: friendliesError,
  } = await supabase
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
      created_at,

      teams!friendlies_team_id_fkey (
        id,
        name,
        age_group,
        gender,
        level,

        clubs!teams_club_id_fkey (
          id,
          name,
          badge_url
        )
      )
    `)
    .eq("status", "open")
    .gte("match_date", today)
    .order("match_date", {
      ascending: true,
    })
    .order("kick_off_time", {
      ascending: true,
    });

  if (friendliesError) {
    console.error(
      "Error loading friendlies:",
      friendliesError
    );
  }

  const friendlySearch =
    q?.trim().toLowerCase() ??
    "";

  let radiusFriendlyIds:
    | string[]
    | null = null;

  let friendlyDistances =
    new Map<string, number>();

  if (
    distance ||
    sort === "nearest"
  ) {
    const radiusMiles =
      distance
        ? Number(distance)
        : 10000;

    let radiusRows: {
      id: string;
      distance_miles: number;
    }[] = [];

    if (location?.trim()) {
      const coordinates =
        await geocodeLocation(
          location.trim()
        );

      if (coordinates) {
        const {
          data: radiusResults,
          error: radiusError,
        } = await supabase.rpc(
          "friendlies_within_radius",
          {
            search_lat:
              coordinates.lat,
            search_lng:
              coordinates.lng,
            radius_miles:
              radiusMiles,
          }
        );

        if (radiusError) {
          console.error(
            "Friendly custom location radius error:",
            radiusError
          );
        } else {
          radiusRows = (
            radiusResults ?? []
          ) as {
            id: string;
            distance_miles: number;
          }[];
        }
      }
    } else if (
      coachClub?.id
    ) {
      const {
        data: radiusResults,
        error: radiusError,
      } = await supabase.rpc(
        "friendlies_within_radius_from_club",
        {
          p_club_id:
            coachClub.id,
          radius_miles:
            radiusMiles,
        }
      );

      if (radiusError) {
        console.error(
          "Friendly club radius error:",
          radiusError
        );
      } else {
        radiusRows = (
          radiusResults ?? []
        ) as {
          id: string;
          distance_miles: number;
        }[];
      }
    }

    radiusFriendlyIds =
      radiusRows.map(
        (result) =>
          result.id
      );

    friendlyDistances =
      new Map(
        radiusRows.map(
          (result) => [
            result.id,
            Number(
              result.distance_miles
            ),
          ]
        )
      );
  }

  let availableFriendlies =
    (friendlies ?? []).filter(
      (friendly: any) => {
        const teamRelation =
          friendly.teams;

        const team =
          Array.isArray(
            teamRelation
          )
            ? teamRelation[0]
            : teamRelation;

                    const clubRelation =
          team?.clubs;

        const club =
          Array.isArray(
            clubRelation
          )
            ? clubRelation[0]
            : clubRelation;

        // Past match

        if (
          friendly.match_date <
          today
        ) {
          return false;
        }

        if (
          friendly.match_date ===
            today &&
          (!friendly.kick_off_time ||
            friendly.kick_off_time <=
              currentTime)
        ) {
          return false;
        }

        // Search

        if (friendlySearch) {
          const searchableText = [
            club?.name,
            team?.name,
            friendly.location,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (
            !searchableText.includes(
              friendlySearch
            )
          ) {
            return false;
          }
        }

        // Age group

        if (
          age &&
          team?.age_group !== age
        ) {
          return false;
        }

        // Level

        if (
          level &&
          team?.level !== level
        ) {
          return false;
        }

        // Gender

        if (
          gender &&
          team?.gender !== gender
        ) {
          return false;
        }

        // Format

        if (
          format &&
          friendly.match_format !==
            format
        ) {
          return false;
        }

        // Date

        if (
          date &&
          friendly.match_date !==
            date
        ) {
          return false;
        }

        // Venue

        if (
          venue &&
          friendly.venue_type !==
            venue
        ) {
          return false;
        }

        // Radius

        if (
          distance &&
          radiusFriendlyIds !==
            null &&
          !radiusFriendlyIds.includes(
            friendly.id
          )
        ) {
          return false;
        }

        // This week

        if (
          quick === "this-week" &&
          (friendly.match_date <
            today ||
            friendly.match_date >
              weekEnd)
        ) {
          return false;
        }

        return true;
      }
    );

  // ==================================================
  // FRIENDLY SORTING
  // ==================================================

  if (sort === "nearest") {
    availableFriendlies = [
      ...availableFriendlies,
    ].sort((a: any, b: any) => {
      const distanceA =
        friendlyDistances.get(
          a.id
        ) ??
        Number.POSITIVE_INFINITY;

      const distanceB =
        friendlyDistances.get(
          b.id
        ) ??
        Number.POSITIVE_INFINITY;

      return (
        distanceA - distanceB
      );
    });
  } else if (
    sort === "newest"
  ) {
    availableFriendlies = [
      ...availableFriendlies,
    ].sort((a: any, b: any) => {
      return (
        new Date(
          b.created_at
        ).getTime() -
        new Date(
          a.created_at
        ).getTime()
      );
    });
  } else {
    availableFriendlies = [
      ...availableFriendlies,
    ].sort((a: any, b: any) => {
      const dateA =
        `${a.match_date}T${
          a.kick_off_time ??
          "00:00:00"
        }`;

      const dateB =
        `${b.match_date}T${
          b.kick_off_time ??
          "00:00:00"
        }`;

      return (
        new Date(
          dateA
        ).getTime() -
        new Date(
          dateB
        ).getTime()
      );
    });
  }

  // ==================================================
  // SPLIT MATCHES INTO SECTIONS
  // ==================================================

  const yourPosts =
    availableFriendlies.filter(
      (friendly: any) =>
        friendly.created_by ===
        user?.id
    );

  const otherFriendlies =
    availableFriendlies.filter(
      (friendly: any) =>
        friendly.created_by !==
        user?.id
    );

  const recommendedFriendlies =
    coachAgeGroup || coachLevel
      ? otherFriendlies.filter(
          (friendly: any) => {
            const teamRelation =
              friendly.teams;

            const team =
              Array.isArray(
                teamRelation
              )
                ? teamRelation[0]
                : teamRelation;

            const ageMatches =
              !coachAgeGroup ||
              team?.age_group ===
                coachAgeGroup;

            const levelMatches =
              !coachLevel ||
              team?.level ===
                coachLevel;

            return (
              ageMatches &&
              levelMatches
            );
          }
        )
      : [];

  const recommendedIds =
    new Set(
      recommendedFriendlies.map(
        (friendly: any) =>
          friendly.id
      )
    );

  const remainingFriendlies =
    otherFriendlies.filter(
      (friendly: any) =>
        !recommendedIds.has(
          friendly.id
        )
    );

  // ==================================================
  // TOURNAMENTS
  // ==================================================

  let tournamentsQuery =
    supabase
      .from("tournaments")
      .select(`
        id,
        created_by,
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
        description,
        status,
        created_at
      `)
      .eq("status", "open");

  let radiusTournamentIds:
    | string[]
    | null = null;

  let tournamentDistances =
    new Map<string, number>();

  if (
    distance ||
    sort === "nearest"
  ) {
    const radiusMiles =
      distance
        ? Number(distance)
        : 10000;

    let radiusRows: {
      id: string;
      distance_miles: number;
    }[] = [];

    if (location?.trim()) {
      const coordinates =
        await geocodeLocation(
          location.trim()
        );

      if (coordinates) {
        const {
          data: radiusResults,
          error: radiusError,
        } = await supabase.rpc(
          "tournaments_within_radius",
          {
            search_lat:
              coordinates.lat,
            search_lng:
              coordinates.lng,
            radius_miles:
              radiusMiles,
          }
        );

        if (radiusError) {
          console.error(
            "Custom location radius search error:",
            radiusError
          );
        } else {
          radiusRows = (
            radiusResults ?? []
          ) as {
            id: string;
            distance_miles: number;
          }[];
        }
      }
    } else if (
      coachClub?.id
    ) {
      const {
        data: radiusResults,
        error: radiusError,
      } = await supabase.rpc(
        "tournaments_within_radius_from_club",
        {
          p_club_id:
            coachClub.id,
          radius_miles:
            radiusMiles,
        }
      );

      if (radiusError) {
        console.error(
          "Club radius search error:",
          radiusError
        );
      } else {
        radiusRows = (
          radiusResults ?? []
        ) as {
          id: string;
          distance_miles: number;
        }[];
      }
    }

    radiusTournamentIds =
      radiusRows.map(
        (result) => result.id
      );

    tournamentDistances =
      new Map(
        radiusRows.map(
          (result) => [
            result.id,
            Number(
              result.distance_miles
            ),
          ]
        )
      );
  }

  // ==================================================
  // TOURNAMENT DISTANCE FILTER
  // ==================================================

  if (
    distance &&
    radiusTournamentIds !== null
  ) {
    if (
      radiusTournamentIds.length >
      0
    ) {
      tournamentsQuery =
        tournamentsQuery.in(
          "id",
          radiusTournamentIds
        );
    } else {
      tournamentsQuery =
        tournamentsQuery.eq(
          "id",
          "00000000-0000-0000-0000-000000000000"
        );
    }
  }

  // ==================================================
  // TOURNAMENT SEARCH / FILTERS
  // ==================================================

  if (q?.trim()) {
    tournamentsQuery =
      tournamentsQuery.or(
        `name.ilike.%${q.trim()}%,location.ilike.%${q.trim()}%`
      );
  }

  if (
    location?.trim() &&
    !distance
  ) {
    tournamentsQuery =
      tournamentsQuery.ilike(
        "location",
        `%${location.trim()}%`
      );
  }

  if (age) {
    tournamentsQuery =
      tournamentsQuery.eq(
        "age_group",
        age
      );
  }

  if (level) {
    tournamentsQuery =
      tournamentsQuery.eq(
        "level",
        level
      );
  }

  if (gender) {
    tournamentsQuery =
      tournamentsQuery.eq(
        "gender",
        gender
      );
  }

  if (format) {
    tournamentsQuery =
      tournamentsQuery.eq(
        "match_format",
        format
      );
  }

  if (date) {
    tournamentsQuery =
      tournamentsQuery.or(
        `start_date.eq.${date},and(start_date.lte.${date},end_date.gte.${date})`
      );
  }

  // ==================================================
  // TOURNAMENT SORTING
  // ==================================================

  let orderedTournamentQuery =
    tournamentsQuery;

  if (sort === "fee") {
    orderedTournamentQuery =
      orderedTournamentQuery.order(
        "entry_fee",
        {
          ascending: true,
          nullsFirst: false,
        }
      );
  } else if (
    sort === "newest"
  ) {
    orderedTournamentQuery =
      orderedTournamentQuery.order(
        "created_at",
        {
          ascending: false,
        }
      );
  } else {
    orderedTournamentQuery =
      orderedTournamentQuery.order(
        "start_date",
        {
          ascending: true,
        }
      );
  }

  const {
    data: tournaments,
    error: tournamentsError,
  } = await orderedTournamentQuery;

  if (tournamentsError) {
    console.error(
      "Error loading tournaments:",
      {
        message:
          tournamentsError.message,
        code:
          tournamentsError.code,
        details:
          tournamentsError.details,
        hint:
          tournamentsError.hint,
      }
    );
  }

  let availableTournaments =
    (tournaments ?? []).filter(
      (tournament: any) => {
        if (
          tournament.end_date
        ) {
          return (
            tournament.end_date >=
            today
          );
        }

        return (
          tournament.start_date >=
          today
        );
      }
    );

  if (
    sort === "nearest" &&
    radiusTournamentIds !== null
  ) {
    availableTournaments = [
      ...availableTournaments,
    ].sort(
      (a: any, b: any) => {
        const distanceA =
          tournamentDistances.get(
            a.id
          ) ??
          Number.POSITIVE_INFINITY;

        const distanceB =
          tournamentDistances.get(
            b.id
          ) ??
          Number.POSITIVE_INFINITY;

        return (
          distanceA -
          distanceB
        );
      }
    );
  }

  // ==================================================
  // SPLIT TOURNAMENTS INTO SECTIONS
  // ==================================================

  const yourTournamentPosts =
    availableTournaments.filter(
      (tournament: any) =>
        tournament.created_by ===
        user?.id
    );

  const otherTournaments =
    availableTournaments.filter(
      (tournament: any) =>
        tournament.created_by !==
        user?.id
    );

  const recommendedTournaments =
    coachAgeGroup || coachLevel
      ? otherTournaments.filter(
          (tournament: any) => {
            const ageMatches =
              !coachAgeGroup ||
              tournament.age_group ===
                coachAgeGroup;

            const levelMatches =
              !coachLevel ||
              tournament.level ===
                coachLevel;

            return (
              ageMatches &&
              levelMatches
            );
          }
        )
      : [];

  const recommendedTournamentIds =
    new Set(
      recommendedTournaments.map(
        (tournament: any) =>
          tournament.id
      )
    );

  const remainingTournaments =
    otherTournaments.filter(
      (tournament: any) =>
        !recommendedTournamentIds.has(
          tournament.id
        )
    );

  // ==================================================
  // REUSABLE MATCH CARD
  // ==================================================

  const renderMatchCard = (
    friendly: any,
    options?: {
      recommended?: boolean;
    }
  ) => {
    const teamRelation =
      friendly.teams;

    const team =
      Array.isArray(
        teamRelation
      )
        ? teamRelation[0]
        : teamRelation;

    const clubRelation =
      team?.clubs;

    const club =
      Array.isArray(
        clubRelation
      )
        ? clubRelation[0]
        : clubRelation;

    if (!team || !club) {
      return null;
    }

    const friendlyDate =
      new Date(
        `${friendly.match_date}T00:00:00`
      );

    const day =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          day: "numeric",
        }
      ).format(
        friendlyDate
      );

    const weekday =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          weekday: "short",
        }
      )
        .format(
          friendlyDate
        )
        .toUpperCase();

    const month =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          month: "short",
        }
      )
        .format(
          friendlyDate
        )
        .toUpperCase();

    const formattedDate =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          weekday: "short",
          day: "numeric",
          month: "short",
        }
      ).format(
        friendlyDate
      );

    const formattedTime =
      friendly.kick_off_time?.slice(
        0,
        5
      ) ?? "";

    const isOwnPost =
      user?.id ===
      friendly.created_by;

    const distanceMiles =
      friendlyDistances.get(
        friendly.id
      );

    return (
      <Link
        key={friendly.id}
        href={`/friendlies/${friendly.id}?from=discovery`}
        className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition active:scale-[0.99]"
      >
        <div className="flex min-h-[104px] items-stretch">
          {/* DATE */}

          <div className="flex w-[52px] shrink-0 flex-col items-center justify-center bg-green-50 px-1 text-center">
            <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
              {weekday}
            </span>

            <span className="mt-1 text-[22px] font-bold leading-none text-[#00B83F]">
              {day}
            </span>

            <span className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
              {month}
            </span>
          </div>

          {/* CONTENT */}

          <div className="min-w-0 flex-1 px-3 py-3">
            <div className="flex items-start gap-2.5">
              {/* CLUB BADGE */}

              <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center">
                {club.badge_url ? (
                  <img
                    src={
                      club.badge_url
                    }
                    alt={
                      club.name
                    }
                    className="h-10 w-10 rounded-full object-contain"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-[11px] font-bold text-[#00B83F]">
                    {club.name
                      ?.slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              {/* CLUB / TEAM */}

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="min-w-0 flex-1 truncate text-[13px] font-bold leading-tight text-slate-950">
                    {club.name}
                  </h3>

                  {isOwnPost && (
                    <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[9px] font-bold leading-none text-[#00A638]">
                      Your post
                    </span>
                  )}
                </div>

                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  {team.name}
                </p>
              </div>

              <ChevronRight
                size={17}
                strokeWidth={2}
                className="mt-1 shrink-0 text-slate-400"
              />
            </div>

            {/* TAGS */}

<div className="ml-[45px] mt-2 flex items-center gap-1.5 overflow-hidden">
  {team.age_group && (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
        options?.recommended &&
        team.age_group === coachAgeGroup
          ? "bg-green-50 text-[#00A638]"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {team.age_group}
    </span>
  )}

  {team.level && (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-medium ${
        options?.recommended &&
        team.level === coachLevel
          ? "bg-green-50 text-[#00A638]"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {team.level}
    </span>
  )}

  {friendly.match_format && (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-medium ${
        options?.recommended &&
        friendly.match_format === coachMatchFormat
          ? "bg-green-50 text-[#00A638]"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {friendly.match_format}
    </span>
  )}
</div>

            {/* DATE / TIME / LOCATION */}

            <div className="ml-[45px] mt-2 flex min-w-0 items-center gap-3 text-[10px] text-slate-500">

              {formattedTime && (
                <div className="flex shrink-0 items-center gap-1">
                  <Clock
                    size={12}
                    strokeWidth={2}
                  />

                  <span>
                    {formattedTime}
                  </span>
                </div>
              )}

              {friendly.location && (
                <div className="flex min-w-0 items-center gap-1">
                  <MapPin
                    size={12}
                    strokeWidth={2}
                    className="shrink-0"
                  />

                  <span className="truncate">
                    {
                      friendly.location
                    }

                    {distanceMiles !==
                      undefined &&
                      ` · ${
                        distanceMiles <
                        0.1
                          ? "<0.1 mi"
                          : `${distanceMiles.toFixed(
                              1
                            )} mi`
                      }`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  };

    // ==================================================
  // UI
  // ==================================================

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-4 pb-28 pt-6">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-950">
  {activeType === "tournaments"
    ? "Find a Tournament"
    : "Find a Match"}
</h1>

        <p className="mt-0 text-[13px] text-slate-500">
          Find the right match for your team.
        </p>
      </header>

      {/* ==================================================
          MATCH SEARCH
      ================================================== */}

      {activeType === "friendlies" && (
        <section className="mt-3">
          <form
            action="/matches"
            method="GET"
            className="flex items-center gap-2.5"
          >
            <input
              type="hidden"
              name="type"
              value="friendlies"
            />

            <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
              <Search
                size={18}
                strokeWidth={2}
                className="shrink-0 text-slate-400"
              />

              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search teams or locations"
                enterKeyHint="search"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>

            <FriendlyFilters
              age={age}
              level={level}
              gender={gender}
              format={format}
              date={date}
              location={location}
              distance={distance}
              venue={venue}
              defaultLocation={
                defaultClubCity
              }
            />
          </form>
        </section>
      )}

      {/* ==================================================
          TOURNAMENT SEARCH
      ================================================== */}

      {activeType ===
        "tournaments" && (
        <TournamentFilters
          defaultLocation={
            defaultClubCity
          }
        />
      )}

      {/* ==================================================
          MATCHES / TOURNAMENTS SWITCH
      ================================================== */}

      <section className="mt-4">
        <div className="flex rounded-xl bg-slate-100 p-1">
          <Link
            href="/matches?type=friendlies"
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-[12px] font-bold transition ${
              activeType === "friendlies"
                ? "bg-white text-[#00B83F] shadow-sm"
                : "text-slate-500"
            }`}
          >
            Matches
          </Link>

          <Link
            href="/matches?type=tournaments"
            className={`flex h-10 flex-1 items-center justify-center rounded-lg text-[12px] font-bold transition ${
              activeType === "tournaments"
                ? "bg-white text-[#00B83F] shadow-sm"
                : "text-slate-500"
            }`}
          >
            Tournaments
          </Link>
        </div>
      </section>

      {/* ==================================================
          MATCHES
      ================================================== */}

      {activeType === "friendlies" && (
        <>
          {/* ==================================================
    QUICK FILTERS
================================================== */}

<section className="-mx-4 mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
  <div className="flex w-max items-center gap-1 px-4 pb-1">

    {/* ALL */}
    <Link
      href="/matches?type=friendlies"
      className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
        !quick && !age && !level && !venue && !distance
          ? "border border-green-200 bg-green-50 text-[#00A638]"
          : "border border-slate-200 bg-white text-slate-600"
      }`}
    >
      All
    </Link>

    {/* MY AGE GROUP */}
    {coachAgeGroup && (
      <Link
        href={`/matches?type=friendlies&age=${encodeURIComponent(
          coachAgeGroup
        )}`}
        className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
          age === coachAgeGroup && !quick
            ? "border border-green-200 bg-green-50 text-[#00A638]"
            : "border border-slate-200/80 bg-white/70 text-slate-600"
        }`}
      >
        My age group
      </Link>
    )}

    {/* MY LEVEL */}
    {coachLevel && (
      <Link
        href={`/matches?type=friendlies&level=${encodeURIComponent(
          coachLevel
        )}`}
        className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
          level === coachLevel && !quick
            ? "border border-green-200 bg-green-50 text-[#00A638]"
            : "border border-slate-200/80 bg-white/70 text-slate-600"
        }`}
      >
        My level
      </Link>
    )}

    {/* THIS WEEK */}
    <Link
      href="/matches?type=friendlies&quick=this-week"
      className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
        quick === "this-week"
          ? "border border-green-200 bg-green-50 text-[#00A638]"
          : "border border-slate-200/80 bg-white/70 text-slate-600"
      }`}
    >
      This week
    </Link>

    {/* NEARBY */}
    <Link
      href="/matches?type=friendlies&distance=10&sort=nearest"
      className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
        distance === "10"
          ? "border border-green-200 bg-green-50 text-[#00A638]"
          : "border border-slate-200/80 bg-white/70 text-slate-600"
      }`}
    >
      Nearby
    </Link>

  </div>
</section>

          {/* ==================================================
              RECOMMENDED FOR YOU
          ================================================== */}

          {recommendedFriendlies.length >
            0 && (
            <section className="mt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
                  Recommended for You
                </h2>

                <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#00B83F]">
                  View all

                  <ChevronRight
                    size={14}
                    strokeWidth={2.5}
                  />
                </span>
              </div>

              <div className="mt-2.5 space-y-2.5">
                {recommendedFriendlies
                  .slice(0, 2)
                  .map(
                    (
                      friendly: any
                    ) =>
                      renderMatchCard(
                        friendly,
                        {
                          recommended:
                            true,
                        }
                      )
                  )}
              </div>
            </section>
          )}

          {/* ==================================================
              YOUR POSTS
          ================================================== */}

          {yourPosts.length > 0 && (
            <section className="mt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
                  Your Posts (
                  {yourPosts.length})
                </h2>

                <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#00B83F]">
                  View all

                  <ChevronRight
                    size={14}
                    strokeWidth={2.5}
                  />
                </span>
              </div>

              <div className="mt-2.5 space-y-2.5">
                {yourPosts
                  .slice(0, 2)
                  .map(
                    (
                      friendly: any
                    ) =>
                      renderMatchCard(
                        friendly
                      )
                  )}
              </div>
            </section>
          )}

          {/* ==================================================
              AVAILABLE MATCHES
          ================================================== */}

          <section className="mt-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
                  Available Matches
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  {
                    remainingFriendlies.length
                  }{" "}
                  {remainingFriendlies.length ===
                  1
                    ? "match"
                    : "matches"}{" "}
                  available
                </p>
              </div>

              <FriendlySort />
            </div>

            {remainingFriendlies.length ===
            0 ? (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-sm">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                  <Search
                    size={18}
                    strokeWidth={2}
                    className="text-[#00B83F]"
                  />
                </div>

                <h3 className="mt-3 text-[14px] font-bold text-slate-950">
                  {hasActiveFriendlyFilters
                    ? "No matches found"
                    : "No matches available"}
                </h3>

                <p className="mx-auto mt-1 max-w-[250px] text-[11px] leading-5 text-slate-500">
                  {hasActiveFriendlyFilters
                    ? "Try changing your filters to see more matches."
                    : "New match opportunities will appear here when coaches post them."}
                </p>

                {hasActiveFriendlyFilters && (
                  <Link
                    href="/matches?type=friendlies"
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#00B83F] px-5 text-[11px] font-bold text-white"
                  >
                    Reset filters
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                {remainingFriendlies.map(
                  (
                    friendly: any
                  ) =>
                    renderMatchCard(
                      friendly
                    )
                )}
              </div>
            )}
          </section>
        </>
      )}

      {/* ==================================================
          TOURNAMENTS
      ================================================== */}

      {activeType ===
        "tournaments" && (
        <>
          {/* ==================================================
    TOURNAMENT QUICK FILTERS
================================================== */}

<section className="-mx-4 mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
  <div className="flex w-max items-center gap-1 px-4 pb-1">

    {/* ALL */}
    <Link
      href="/matches?type=tournaments"
      className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
        !age && !level && !date && !distance
          ? "border border-purple-200 bg-purple-50 text-purple-600"
          : "border border-slate-200 bg-white text-slate-600"
      }`}
    >
      All
    </Link>

    {/* MY AGE GROUP */}
    {coachAgeGroup && (
      <Link
        href={`/matches?type=tournaments&age=${encodeURIComponent(
          coachAgeGroup
        )}`}
        className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
          age === coachAgeGroup
            ? "border border-purple-200 bg-purple-50 text-purple-600"
            : "border border-slate-200/80 bg-white/70 text-slate-600"
        }`}
      >
        My age group
      </Link>
    )}

    {/* MY LEVEL */}
    {coachLevel && (
      <Link
        href={`/matches?type=tournaments&level=${encodeURIComponent(
          coachLevel
        )}`}
        className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
          level === coachLevel
            ? "border border-purple-200 bg-purple-50 text-purple-600"
            : "border border-slate-200/80 bg-white/70 text-slate-600"
        }`}
      >
        My level
      </Link>
    )}

    {/* TODAY */}
    <Link
      href={`/matches?type=tournaments&date=${today}`}
      className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
        date === today
          ? "border border-purple-200 bg-purple-50 text-purple-600"
          : "border border-slate-200/80 bg-white/70 text-slate-600"
      }`}
    >
      Today
    </Link>

    {/* NEARBY */}
    <Link
      href="/matches?type=tournaments&distance=20"
      className={`shrink-0 rounded-full px-2.5 py-2 text-[10px] font-semibold transition ${
        distance === "20"
          ? "border border-purple-200 bg-purple-50 text-purple-600"
          : "border border-slate-200/80 bg-white/70 text-slate-600"
      }`}
    >
      Nearby
    </Link>

  </div>
</section>

          {/* ==================================================
              TOURNAMENT CARD RENDERER
          ================================================== */}

          {(() => {
            const renderTournamentCard = (
              tournament: any
            ) => {
              const tournamentDate =
                new Date(
                  `${tournament.start_date}T00:00:00`
                );

              const day =
                new Intl.DateTimeFormat(
                  "en-GB",
                  {
                    day: "numeric",
                  }
                ).format(
                  tournamentDate
                );

              const weekday =
                new Intl.DateTimeFormat(
                  "en-GB",
                  {
                    weekday:
                      "short",
                  }
                )
                  .format(
                    tournamentDate
                  )
                  .toUpperCase();

              const month =
                new Intl.DateTimeFormat(
                  "en-GB",
                  {
                    month: "short",
                  }
                )
                  .format(
                    tournamentDate
                  )
                  .toUpperCase();

              const formattedTime =
                tournament.start_time?.slice(
                  0,
                  5
                ) ?? "";

              const isOwnTournament =
                user?.id ===
                tournament.created_by;

              const distanceMiles =
                tournamentDistances.get(
                  tournament.id
                );

              return (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}?from=discovery`}
                  className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition active:scale-[0.99]"
                >
                  <div className="flex min-h-[104px] items-stretch">
                    {/* DATE */}

                    <div className="flex w-[52px] shrink-0 flex-col items-center justify-center bg-violet-50 px-1 text-center">
                      <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                        {weekday}
                      </span>

                      <span className="mt-1 text-[22px] font-bold leading-none text-violet-600">
                        {day}
                      </span>

                      <span className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
                        {month}
                      </span>
                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1 px-3 py-3">
                      <div className="flex items-start gap-2.5">
                        {/* TOURNAMENT ICON */}

                        <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50">
                            {/* TOURNAMENT ICON */}

{/* TOURNAMENT ICON */}

<div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center">
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50">
    <GiTrophyCup
      size={22}
      className="text-violet-600"
    />
  </div>
</div>
                          </div>
                        </div>

                        {/* TOURNAMENT NAME */}

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <h3 className="min-w-0 flex-1 truncate text-[13px] font-bold leading-tight text-slate-950">
                              {
                                tournament.name
                              }
                            </h3>

                            {isOwnTournament && (
                              <span className="shrink-0 rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold leading-none text-violet-600">
                                Your post
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 truncate text-[10px] text-slate-500">
                            {tournament.age_group ??
                              "Open age"}

                            {tournament.max_teams
                              ? ` · ${tournament.max_teams} teams`
                              : ""}
                          </p>
                        </div>

                        <ChevronRight
                          size={17}
                          strokeWidth={2}
                          className="mt-1 shrink-0 text-slate-400"
                        />
                      </div>

                      {/* TAGS */}

<div className="ml-[45px] mt-2 flex items-center gap-1.5 overflow-hidden">
  {tournament.age_group && (
    <span className="shrink-0 rounded-full bg-violet-50 px-2 py-1 text-[9px] font-semibold text-violet-600">
      {tournament.age_group}
    </span>
  )}

  {tournament.level && (
    <span className="shrink-0 rounded-full bg-violet-50 px-2 py-1 text-[9px] font-medium text-violet-600">
      {tournament.level}
    </span>
  )}

  {tournament.match_format && (
    <span className="shrink-0 rounded-full bg-violet-50 px-2 py-1 text-[9px] font-medium text-violet-600">
      {tournament.match_format}
    </span>
  )}
</div>

                      {/* DETAILS */}

                      <div className="ml-[45px] mt-2 flex min-w-0 items-center justify-between gap-3 text-[10px] text-slate-500">
                        <div className="flex min-w-0 items-center gap-3">
                          {formattedTime && (
                            <div className="flex shrink-0 items-center gap-1">
                              <Clock
                                size={
                                  12
                                }
                                strokeWidth={
                                  2
                                }
                              />

                              <span>
                                {
                                  formattedTime
                                }
                              </span>
                            </div>
                          )}

                          {tournament.location && (
                            <div className="flex min-w-0 items-center gap-1">
                              <MapPin
                                size={
                                  12
                                }
                                strokeWidth={
                                  2
                                }
                                className="shrink-0"
                              />

                              <span className="truncate">
                                {
                                  tournament.location
                                }

                                {distanceMiles !==
                                  undefined &&
                                  ` · ${
                                    distanceMiles <
                                    0.1
                                      ? "<0.1 mi"
                                      : `${distanceMiles.toFixed(
                                          1
                                        )} mi`
                                  }`}
                              </span>
                            </div>
                          )}
                        </div>

                        {tournament.entry_fee !==
                          null &&
                          tournament.entry_fee !==
                            undefined && (
                            <span className="shrink-0 font-bold text-slate-700">
                              {Number(
                                tournament.entry_fee
                              ) === 0
                                ? "Free"
                                : `£${Number(
                                    tournament.entry_fee
                                  ).toFixed(
                                    0
                                  )}`}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            };

                        return (
              <>
                {/* ==================================================
                    RECOMMENDED FOR YOU
                ================================================== */}

                {recommendedTournaments.length >
                  0 && (
                  <section className="mt-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
                        Recommended for You
                      </h2>

                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#00B83F]">
                        View all

                        <ChevronRight
                          size={14}
                          strokeWidth={2.5}
                        />
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2.5">
                      {recommendedTournaments
                        .slice(0, 2)
                        .map(
                          (
                            tournament: any
                          ) =>
                            renderTournamentCard(
                              tournament
                            )
                        )}
                    </div>
                  </section>
                )}

                {/* ==================================================
                    YOUR POSTS
                ================================================== */}

                {yourTournamentPosts.length >
                  0 && (
                  <section className="mt-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
                        Your Posts (
                        {
                          yourTournamentPosts.length
                        }
                        )
                      </h2>

                      <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#00B83F]">
                        View all

                        <ChevronRight
                          size={14}
                          strokeWidth={2.5}
                        />
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-2.5">
                      {yourTournamentPosts
                        .slice(0, 2)
                        .map(
                          (
                            tournament: any
                          ) =>
                            renderTournamentCard(
                              tournament
                            )
                        )}
                    </div>
                  </section>
                )}

                {/* ==================================================
                    AVAILABLE TOURNAMENTS
                ================================================== */}

                <section className="mt-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h2 className="text-[18px] font-bold tracking-tight text-slate-950">
                        Available Tournaments
                      </h2>

                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {
                          remainingTournaments.length
                        }{" "}
                        {remainingTournaments.length ===
                        1
                          ? "other tournament"
                          : "other tournaments"}{" "}
                        available
                      </p>
                    </div>

                    <TournamentSort />
                  </div>

                  {/* ==================================================
                      EMPTY STATE
                  ================================================== */}

                  {remainingTournaments.length ===
                  0 ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-sm">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-violet-50">
                        <GiTrophyCup
  size={22}
  className="text-violet-600"
/>
                      </div>

                      <h3 className="mt-3 text-[14px] font-bold text-slate-950">
                        {hasActiveTournamentFilters
                          ? "No tournaments found"
                          : "No other tournaments available"}
                      </h3>

                      <p className="mx-auto mt-1 max-w-[250px] text-[11px] leading-5 text-slate-500">
                        {hasActiveTournamentFilters
                          ? "Try changing your filters to see more tournaments."
                          : "New tournament opportunities will appear here when organisers post them."}
                      </p>

                      {hasActiveTournamentFilters && (
                        <Link
                          href="/matches?type=tournaments"
                          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[#00B83F] px-5 text-[11px] font-bold text-white"
                        >
                          Reset filters
                        </Link>
                      )}
                    </div>
                  ) : (
                    /* ==================================================
                        TOURNAMENT LIST
                    ================================================== */

                    <div className="mt-3 space-y-2.5">
                      {remainingTournaments.map(
                        (
                          tournament: any
                        ) =>
                          renderTournamentCard(
                            tournament
                          )
                      )}
                    </div>
                  )}
                </section>
              </>
            );
          })()}
        </>
      )}
    </main>
  );
}
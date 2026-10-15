"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function getAvailableTeams() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "get_my_available_teams"
  );

  if (error) {
    console.error(
      "AVAILABLE TEAMS ERROR:",
      error
    );

    return [];
  }

  return (data ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    age_group: team.age_group,
    gender: team.gender,
    level: team.level,
    club_id: team.club_id,

    clubs: {
      id: team.club_id,
      name: team.club_name,
      badge_url: team.badge_url,
      city: team.city,
    },
  }));
}

export async function setActiveTeam(
  teamId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be logged in."
    );
  }

  const { error } = await supabase.rpc(
    "set_my_active_team",
    {
      p_team_id: teamId,
    }
  );

  if (error) {
    console.error(
      "SET ACTIVE TEAM ERROR:",
      error
    );

    throw new Error(
      error.message ||
        "Unable to switch team."
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/matches");
  revalidatePath("/matches/history");
  revalidatePath("/chat");

  return {
    success: true,
    teamId,
  };
}
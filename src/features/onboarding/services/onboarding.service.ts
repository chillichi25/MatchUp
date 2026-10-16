import { supabase } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  active_team_id: string | null;
  [key: string]: unknown;
};

/**
 * Ensures a profile row exists for the signed-in account. Profile creation is
 * idempotent: a concurrent insert (23505 unique violation) is treated as
 * success by re-reading the row.
 */
export async function ensureProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("PROFILE LOOKUP ERROR:", profileError);
    throw new Error(profileError.message);
  }

  if (profile) {
    return profile as Profile;
  }

  const { data: newProfile, error: createError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      first_name: user.user_metadata?.first_name ?? "",
      last_name: user.user_metadata?.last_name ?? "",
      full_name: user.user_metadata?.full_name ?? "",
      role: "coach",
    })
    .select()
    .single();

  if (createError?.code === "23505") {
    const { data: existingProfile, error: reloadError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (reloadError) {
      console.error("PROFILE RELOAD ERROR:", reloadError);
      throw new Error(reloadError.message);
    }

    return existingProfile as Profile;
  }

  if (createError) {
    console.error("PROFILE CREATION ERROR:", createError);
    throw new Error(createError.message);
  }

  return newProfile as Profile;
}

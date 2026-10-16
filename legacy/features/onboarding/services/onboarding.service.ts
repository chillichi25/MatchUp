import { createClient } from "@/lib/supabase/server";

export async function ensureProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Check whether the profile already exists
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "PROFILE LOOKUP ERROR:",
      profileError
    );

    throw new Error(profileError.message);
  }

  if (profile) {
    return profile;
  }

  // Try to create the profile
  const {
    data: newProfile,
    error: createError,
  } = await supabase
    .from("profiles")
.insert({
  id: user.id,

  first_name:
    user.user_metadata?.first_name ?? "",

  last_name:
    user.user_metadata?.last_name ?? "",

  full_name:
    user.user_metadata?.full_name ?? "",

  role: "coach",
})
    .select()
    .single();

  // Another request may have created it first
  if (createError?.code === "23505") {
    const {
      data: existingProfile,
      error: existingProfileError,
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (existingProfileError) {
      console.error(
        "PROFILE RELOAD ERROR:",
        existingProfileError
      );

      throw new Error(
        existingProfileError.message
      );
    }

    return existingProfile;
  }

  if (createError) {
    console.error(
      "PROFILE CREATION ERROR:",
      createError
    );

    throw new Error(createError.message);
  }

  return newProfile;
}
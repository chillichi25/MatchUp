"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadClubBadge(
  formData: FormData
) {
  const supabase = await createClient();

  const file = formData.get("badge") as File;

  if (!file || file.size === 0) {
    throw new Error("Please select an image.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: team } = await supabase
    .from("teams")
    .select("club_id")
    .eq("created_by", user.id)
    .single();

  if (!team) {
    throw new Error("Team not found.");
  }

  const extension = file.name.split(".").pop();
const fileName = `${team.club_id}.${extension}`;

const { error: uploadError } = await supabase.storage
  .from("club-badges")
  .upload(fileName, file, {
  upsert: true,
  cacheControl: "3600",
});

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("club-badges")
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("clubs")
    .update({
      badge_url: publicUrl,
    })
    .eq("id", team.club_id);

  if (updateError) {
    throw updateError;
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}
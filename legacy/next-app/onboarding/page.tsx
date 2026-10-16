import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ensureProfile } from "@/features/onboarding/services/onboarding.service";
import { getActiveTeam } from "@/features/teams/services/get-active-team.server";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Make sure the user has a profile
  await ensureProfile();

  // Check whether the coach has a valid active team
  const activeTeam =
    await getActiveTeam();

  // No active team means onboarding is not complete
  if (!activeTeam) {
    redirect("/clubs");
  }

  // Coach already has a team and club
  redirect("/dashboard");
}
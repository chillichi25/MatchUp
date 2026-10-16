import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/features/onboarding/services/onboarding.service";
import { BottomNav } from "@/components/navigation/bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  //await ensureProfile();

  return (
  <div className="min-h-screen bg-gray-50">
    {children}

    <BottomNav />
  </div>
);
}
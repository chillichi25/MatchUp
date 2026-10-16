import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/providers/auth-provider";
import { ensureProfile } from "@/features/onboarding/services/onboarding.service";
import { getActiveTeam } from "@/features/teams/services/active-team.service";

export default function OnboardingScreen() {
  const router = useRouter();
  const { session, isLoading } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isLoading || !session) return;

    let active = true;

    async function run() {
      try {
        setError(null);

        // Guarantee the profile row exists before any team lookup.
        await ensureProfile();

        const activeTeam = await getActiveTeam();

        if (!active) return;

        // No active team means club onboarding is not complete.
        router.replace(activeTeam ? "/dashboard" : "/clubs");
      } catch {
        if (!active) return;
        setError(
          "We couldn't finish setting up your account. Please try again."
        );
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [isLoading, session, router, attempt]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-[#F8FAFC] px-8">
        <Text className="text-center text-sm text-slate-600">{error}</Text>
        <Button
          variant="outline"
          fullWidth={false}
          onPress={() => setAttempt((current) => current + 1)}
        >
          Try again
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-[#F8FAFC]">
      <ActivityIndicator color="#00B83F" />
      <Text className="text-sm text-slate-500">Setting things up…</Text>
    </View>
  );
}

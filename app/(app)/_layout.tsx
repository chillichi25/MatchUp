import { Redirect, Stack } from "expo-router";

import { Splash } from "@/components/splash";
import { useSession } from "@/features/auth/providers/auth-provider";

export default function AppLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <Splash />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

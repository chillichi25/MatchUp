import { useLocalSearchParams } from "expo-router";

import { VerifyEmailView } from "@/features/auth/components/verify-email-view";

export default function VerifyEmailScreen() {
  const { verified, error } = useLocalSearchParams<{
    verified?: string;
    error?: string;
  }>();

  return (
    <VerifyEmailView verified={verified === "true"} hasError={Boolean(error)} />
  );
}

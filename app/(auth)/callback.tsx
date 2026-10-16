import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import {
  exchangeCodeForSession,
  verifyEmailOtp,
} from "@/features/auth/services/auth.service";

/**
 * Deep-link target for Supabase auth emails (verification and password
 * recovery). Supabase may return either `code` (PKCE) or `token_hash` (OTP),
 * and either `error`/`error_code` on failure.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_code?: string;
    token_hash?: string;
    type?: string;
    flow?: string;
  }>();

  const { code, error, error_code, token_hash, type, flow } = params;

  useEffect(() => {
    let active = true;

    function fail(reason: string) {
      router.replace({ pathname: "/verify-email", params: { error: reason } });
    }

    function succeed() {
      if (flow === "recovery") {
        router.replace("/reset-password");
        return;
      }
      router.replace({
        pathname: "/verify-email",
        params: { verified: "true" },
      });
    }

    async function run() {
      if (error) {
        fail(error_code ?? "verification_failed");
        return;
      }

      if (code) {
        const { error: exchangeError } =
          await exchangeCodeForSession(code);

        if (!active) return;

        if (exchangeError) {
          fail("verification_failed");
          return;
        }

        succeed();
        return;
      }

      if (token_hash && type === "signup") {
        const { error: otpError } = await verifyEmailOtp(token_hash, "signup");

        if (!active) return;

        if (otpError) {
          fail("verification_failed");
          return;
        }

        succeed();
        return;
      }

      fail("verification_failed");
    }

    run();

    return () => {
      active = false;
    };
  }, [code, error, error_code, token_hash, type, flow, router]);

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-[#F8FAFC]">
      <ActivityIndicator color="#00B83F" />
      <Text
        accessibilityRole="text"
        className="text-sm text-slate-500"
      >
        Confirming your link…
      </Text>
    </View>
  );
}

import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";

import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/providers/auth-provider";
import { ensureProfile } from "@/features/onboarding/services/onboarding.service";
import { getActiveTeam } from "@/features/teams/services/active-team.service";

export default function OnboardingScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { session, isLoading } = useSession();

  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isLoading || !session) return;

    let active = true;

    async function run() {
      try {
        setError(null);

        await ensureProfile();

        if (!active) return;

        const activeTeam = await getActiveTeam();

        if (!active) return;

        router.replace(activeTeam ? "/dashboard" : "/clubs");
      } catch {
        if (!active) return;

        setError(
          "We couldn't load your account. Please try again."
        );
      }
    }

    void run();

    return () => {
      active = false;
    };
  }, [isLoading, session, router, attempt]);

  if (!isLoading && !session) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient
              id="onboardingBackground"
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={0}
              y2={height * 0.65}
            >
              <Stop offset="0" stopColor="#A8DCFA" />
              <Stop offset="1" stopColor="#FFFFFF" />
            </LinearGradient>
          </Defs>

          <Rect
            width="100%"
            height="100%"
            fill="url(#onboardingBackground)"
          />
        </Svg>
      </View>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        {error ? (
          <View
            style={{
              width: "100%",
              maxWidth: 320,
              padding: 24,
              borderRadius: 24,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
            }}
          >
            <Text
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={{
                color: "#526176",
                fontSize: 15,
                lineHeight: 23,
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {error}
            </Text>

            <Button
              variant="outline"
              fullWidth={false}
              onPress={() => {
                setError(null);
                setAttempt((current) => current + 1);
              }}
            >
              Try again
            </Button>
          </View>
        ) : (
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Loading your account"
            accessibilityState={{ busy: true }}
          >
          </View>
        )}
      </View>
    </View>
  );
}
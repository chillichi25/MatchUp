import { Image } from "expo-image";
import Svg, {
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { Redirect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSession } from "@/features/auth/providers/auth-provider";

const WHITE = "#FFFFFF";
const NAVY = "#07192D";
const GREEN = "#009E45";
const MUTED = "#596B80";

export default function LandingScreen() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const compact = height < 700;
  const photoHeight = Math.min(290, Math.max(180, height * 0.30));

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View style={styles.screen}>
      <View
  pointerEvents="none"
  style={{
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  }}
>
  <Svg width="100%" height="100%">
    <Defs>
      <LinearGradient
  id="welcomeBackground"
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
      fill="url(#welcomeBackground)"
    />
  </Svg>
</View>

      <ScrollView
        style={{ flex: 1, zIndex: 1 }}
        contentContainerStyle={{ minHeight: height }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + (compact ? 24 : 40),
            },
          ]}
        >
          <Image
            source={require("../assets/images/matchup-logo.png")}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="MatchUp"
          />

          <View style={styles.introduction}>
            <Text
              accessibilityRole="header"
              style={[
                styles.headline,
                { fontSize: width < 350 ? 25 : 28 },
              ]}
            >
              Find. <Text style={{ color: "#0B253D", fontWeight: "900" }}>Match.</Text>{" "}
<Text style={[styles.accent, { fontWeight: "900" }]}>
  Play.
</Text>
            </Text>

            <Text style={styles.description}>
              Find opponents. Organise friendlies.{"\n"}
              Discover tournaments.
            </Text>
          </View>

          <View
            style={[
              styles.actions,
              { marginTop: compact ? 32 : 48 },
            ]}
          >
            <Pressable
  onPress={() => router.push("/register")}
  accessibilityRole="button"
  className="min-h-[48px] w-full items-center justify-center rounded-full bg-[#009E45] px-6 py-4 active:opacity-80"
>
  <Text className="text-center text-[16px] font-bold text-white">
  Get Started
</Text>
</Pressable>

            <View className="mt-2 flex-row flex-wrap items-center justify-center">
  <Text className="text-[13px] text-[#596B80]">
    Already have an account?{" "}
  </Text>

  <Pressable
    onPress={() => router.push("/login")}
    accessibilityRole="link"
    className="min-h-[48px] items-center justify-center px-0.5 active:opacity-70"
  >
    <Text className="text-[13px] font-semibold text-[#008638] underline">
      Log in
    </Text>
  </Pressable>
</View>
          </View>
        </View>

        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.photo, { height: photoHeight }]}
        >
          <Image
            source={require("../assets/images/matchup-sports.png")}
            style={styles.photoImage}
            contentFit="cover"
            contentPosition="left bottom"
          />

          <View style={styles.photoFade}>
  <Svg width="100%" height="100%">
    <Defs>
      <LinearGradient
        id="photoFade"
        x1="0%"
        y1="0%"
        x2="0%"
        y2="100%"
      >
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
        <Stop offset="0.28" stopColor="#FFFFFF" stopOpacity="0.88" />
        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </LinearGradient>
    </Defs>

    <Rect
      width="100%"
      height="100%"
      fill="url(#photoFade)"
    />
  </Svg>
</View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: WHITE,
    overflow: "hidden",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },
  scroll: {
    flex: 1,
  },
  topRing: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 36,
    borderColor: "#E0F5E7",
    top: -155,
    left: -165,
  },
  rightShape: {
    position: "absolute",
    width: 320,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#F0FAF4",
    top: 90,
    right: -280,
  },
  content: {
    flexGrow: 1,
    flexShrink: 0,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 28,
    transform: [{ translateY: 50 }],
  },
  logo: {
  width: 155,
  height: 120,
},
  introduction: {
    width: "100%",
    alignItems: "center",
    marginTop: 25,
  },
  headline: {
  color: NAVY,
  fontWeight: "800",
  letterSpacing: -1.7,
  textAlign: "center",
},
  accent: {
    color: GREEN,
  },
  description: {
    marginTop: 6,
    color: MUTED,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "center",
  },
  actions: {
  width: "100%",
  maxWidth: 300,
  alignSelf: "center",
},
  primaryButton: {
    width: "100%",
    minHeight: 54,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonPressed: {
    backgroundColor: "#008638",
    transform: [{ scale: 0.985 }],
  },
  primaryButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  loginRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  loginPrompt: {
    color: MUTED,
    fontSize: 13,
  },
  loginButton: {
    minHeight: 48,
    paddingHorizontal: 6,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonPressed: {
    backgroundColor: "#EAF7EF",
  },
  loginText: {
    color: "#008638",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  photo: {
    width: "100%",
    flexShrink: 0,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
  },
});
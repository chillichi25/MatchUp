import { Image } from "expo-image";
import { Link, Redirect } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme/tokens";
import { useSession } from "@/features/auth/providers/auth-provider";

export default function LandingScreen() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <View className="flex-1 bg-[#F8FAFC]" />;
  }

  if (session) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="flex-1 overflow-hidden bg-[#F8FAFC]">
      <View
        className="absolute -left-[75px] -top-[105px] h-[230px] w-[230px] rounded-full"
        style={{ backgroundColor: colors.brandSoft }}
        pointerEvents="none"
      />
      <View
        className="absolute -right-[175px] top-[165px] h-[360px] w-[360px] rounded-full"
        style={{ backgroundColor: colors.brandSofter }}
        pointerEvents="none"
      />

      <View className="z-10 mx-auto w-full max-w-md flex-1 px-6">
        <View className="items-center pt-[100px]">
          <Image
            source={require("../assets/images/matchup-logo.png")}
            style={{ width: 190, height: 110 }}
            contentFit="contain"
            accessibilityLabel="MatchUp"
          />
        </View>

        <View className="mt-16 items-center">
          <Text className="text-center text-[26px] font-bold tracking-tight text-[#07192D]">
            Find. Match. <Text className="text-[#00B83F]">Play.</Text>
          </Text>

          <Text className="mt-3 max-w-[290px] text-center text-[15px] leading-6 text-slate-500">
            Find and organise matches and tournaments across all sports.
          </Text>
        </View>

        <View className="mt-14 w-full">
          <Link href="/register" asChild>
            <Pressable
              accessibilityRole="button"
              className="h-12 w-full items-center justify-center rounded-full bg-[#00B83F]"
            >
              <Text className="text-sm font-semibold text-white">
                Get Started
              </Text>
            </Pressable>
          </Link>

          <Text className="mt-5 text-center text-[13px] text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#00B83F]">
              Log in
            </Link>
          </Text>
        </View>
      </View>

      <View className="pointer-events-none absolute inset-x-0 bottom-0 h-[175px] overflow-hidden">
        <Image
          source={require("../assets/images/matchup-sports.png")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          contentPosition="center"
        />
      </View>
    </View>
  );
}

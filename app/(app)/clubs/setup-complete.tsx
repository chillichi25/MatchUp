import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";

export default function ClubSetupCompleteScreen() {
  const router = useRouter();

  return (
    <Screen className="px-7">
      <View className="items-center pt-16">
        <Image
          source={require("@/assets/images/matchup-logo.png")}
          style={{ width: 190, height: 102 }}
          contentFit="contain"
          accessibilityLabel="MatchUp"
        />
      </View>

      <View className="mt-12 items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <Check size={32} color="#00B83F" strokeWidth={2.4} />
        </View>

        <Text className="mt-6 text-center text-[26px] font-bold tracking-tight text-slate-900">
          Your club is ready!
        </Text>

        <Text className="mt-3 max-w-[310px] text-center text-[14px] leading-5 text-slate-500">
          Your club and team are ready. Start finding matches, tournaments and
          other teams on MatchUp.
        </Text>

        <Button
          className="mt-8"
          onPress={() => router.replace("/dashboard")}
        >
          Go to dashboard
        </Button>
      </View>
    </Screen>
  );
}

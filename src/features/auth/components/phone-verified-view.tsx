import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Static success state for the out-of-scope phone flow.
 */
export function PhoneVerifiedView() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="mx-auto w-full max-w-md flex-1 px-7 pb-8 pt-5">
          <View className="h-12 items-center justify-center">
            <Text className="text-[17px] font-bold text-[#07192D]">
              Verify phone
            </Text>
          </View>

          <View className="flex-1 items-center justify-center">
            <View className="h-[76px] w-[76px] items-center justify-center rounded-full bg-[#EAFBF0]">
              <View className="h-[56px] w-[56px] items-center justify-center rounded-full border border-[#00B83F]/15 bg-white">
                <Check size={28} color="#00B83F" strokeWidth={3} />
              </View>
            </View>

            <Text className="mt-6 text-[28px] font-bold tracking-tight text-slate-900">
              Phone verified
            </Text>

            <Text className="mt-2 text-[15px] text-slate-400">
              Your number has been verified.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/onboarding")}
            className="h-12 w-full items-center justify-center rounded-full bg-[#00B83F]"
          >
            <Text className="text-sm font-semibold text-white">Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

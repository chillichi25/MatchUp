import { useRouter } from "expo-router";
import { ChevronRight, Swords, Trophy } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Screen } from "@/components/ui/screen";

export default function CreateScreen() {
  const router = useRouter();

  return (
    <Screen edges={["top"]}>
      <View className="flex-1 px-4 pb-28 pt-6">
        <Text className="text-[28px] font-bold tracking-tight text-slate-950">
          Create
        </Text>
        <Text className="mt-0.5 text-[13px] text-slate-500">
          What would you like to organise?
        </Text>

        <View className="mt-6 gap-3.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a match"
            onPress={() => router.push("/create/friendly" as never)}
            className="min-h-[104px] flex-row overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm"
          >
            <View className="w-[68px] items-center justify-center bg-green-50">
              <Swords size={27} color="#00B83F" strokeWidth={2} />
            </View>

            <View className="min-w-0 flex-1 flex-row items-center gap-3 px-4 py-4">
              <View className="min-w-0 flex-1">
                <Text className="text-[16px] font-bold leading-tight text-slate-950">
                  Create a Match
                </Text>
                <Text className="mt-1.5 text-[13px] leading-[18px] text-slate-500">
                  Find another team and organise a friendly match.
                </Text>
              </View>

              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a tournament"
            onPress={() => router.push("/create/tournament" as never)}
            className="min-h-[104px] flex-row overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm"
          >
            <View className="w-[68px] items-center justify-center bg-violet-50">
              <Trophy size={27} color="#7C3AED" strokeWidth={2} />
            </View>

            <View className="min-w-0 flex-1 flex-row items-center gap-3 px-4 py-4">
              <View className="min-w-0 flex-1">
                <Text className="text-[16px] font-bold leading-tight text-slate-950">
                  Create a Tournament
                </Text>
                <Text className="mt-1.5 text-[13px] leading-[18px] text-slate-500">
                  Organise a tournament and invite teams.
                </Text>
              </View>

              <ChevronRight size={20} color="#94A3B8" />
            </View>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

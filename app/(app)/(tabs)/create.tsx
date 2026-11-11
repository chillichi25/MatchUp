import { useRouter } from "expo-router";
import { ChevronRight, CirclePlus, Trophy } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/ui/screen";

type CreateOptionProps = {
  title: string;
  description: string;
  icon: ReactNode;
  tint: string;
  onPress: () => void;
};

function CreateOption({
  title,
  description,
  icon,
  tint,
  onPress,
}: CreateOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      className="min-h-[104px] flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white active:bg-slate-50"
    >
      <View
        className="w-[64px] shrink-0 self-stretch items-center justify-center"
        style={{ backgroundColor: tint }}
      >
        {icon}
      </View>

      <View className="min-w-0 flex-1 flex-row items-center gap-3 p-4">
        <View className="min-w-0 flex-1">
          <Text className="text-[16px] font-bold leading-5 text-[#07192D]">
            {title}
          </Text>
          <Text className="mt-1 text-[13px] leading-[19px] text-[#596B80]">
            {description}
          </Text>
        </View>

        <ChevronRight size={18} color="#64748B" strokeWidth={1.8} />
      </View>
    </Pressable>
  );
}

export default function CreateScreen() {
  const router = useRouter();

  return (
    <Screen edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 112,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          accessibilityRole="header"
          className="text-[28px] font-bold tracking-tight text-[#07192D]"
        >
          Create
        </Text>
        <Text className="mt-1 text-[13px] leading-5 text-[#596B80]">
          What would you like to organise?
        </Text>

        <View className="mt-6 gap-3">
          <CreateOption
            title="Create a friendly"
            description="List a match and receive requests from other teams."
            tint="#EFF9F2"
            icon={<CirclePlus size={26} color="#009E45" strokeWidth={1.9} />}
            onPress={() => router.push("/create/friendly" as never)}
          />

          <CreateOption
            title="Create a tournament"
            description="Set up a tournament and invite teams to enter."
            tint="#F5F0FC"
            icon={<Trophy size={26} color="#7C3AED" strokeWidth={1.9} />}
            onPress={() => router.push("/create/tournament" as never)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
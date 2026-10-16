import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { ScreenScroll } from "@/components/ui/screen";
import { ClubSearchForm } from "@/features/clubs/components/club-search-form";

export default function JoinClubSearchScreen() {
  const router = useRouter();

  return (
    <ScreenScroll contentClassName="px-7 pb-10">
      <View className="h-12 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to club options"
          hitSlop={10}
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ChevronLeft size={20} color="#07192D" strokeWidth={2} />
        </Pressable>
      </View>

      <View className="mt-4">
        <Text className="text-[26px] font-bold tracking-tight text-slate-900">
          Find your club
        </Text>
        <Text className="mt-2 text-[14px] text-slate-400">
          Search for your club to join it on MatchUp.
        </Text>
      </View>

      <ClubSearchForm />
    </ScreenScroll>
  );
}

import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { Building2, Search, ShieldPlus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Screen } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/state-views";
import {
  useMyApprovedClubMembership,
  usePendingClubRequest,
} from "@/features/clubs/hooks/use-club-queries";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function ClubsLandingScreen() {
  const router = useRouter();

  const { data: activeTeam, isLoading: loadingActiveTeam } = useActiveTeam();
  const { data: approved, isLoading: loadingApproved } =
    useMyApprovedClubMembership();
  const { data: pending, isLoading: loadingPending } = usePendingClubRequest();

  if (loadingActiveTeam || loadingApproved || loadingPending) {
    return (
      <Screen>
        <LoadingState label="Loading your club…" />
      </Screen>
    );
  }

  if (activeTeam) return <Redirect href="/dashboard" />;
  if (approved) return <Redirect href="/dashboard" />;
  if (pending) return <Redirect href="/clubs/pending" />;

  return (
    <Screen className="px-7">
      <View className="items-center pt-10">
        <Image
          source={require("@/assets/images/matchup-logo.png")}
          style={{ width: 170, height: 92 }}
          contentFit="contain"
          accessibilityLabel="MatchUp"
        />
      </View>

      <View className="mt-8 items-center">
        <Text className="text-center text-[26px] font-bold tracking-tight text-slate-900">
          Welcome to MatchUp
        </Text>
        <Text className="mt-2 text-center text-[15px] text-slate-400">
          Let&apos;s get your club and team ready.
        </Text>
      </View>

      <View className="mt-8 gap-4">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/clubs/join")}
          className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5"
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E4F9EB]">
            <Search size={22} color="#00B83F" strokeWidth={1.9} />
          </View>

          <View className="min-w-0 flex-1">
            <Text className="text-[16px] font-bold text-slate-900">
              Find my club
            </Text>
            <Text className="mt-1 text-[13px] text-slate-500">
              Join a club already on MatchUp
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/clubs/create")}
          className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5"
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#E4F9EB]">
            <ShieldPlus size={22} color="#00B83F" strokeWidth={1.9} />
          </View>

          <View className="min-w-0 flex-1">
            <Text className="text-[16px] font-bold text-slate-900">
              Create my club
            </Text>
            <Text className="mt-1 text-[13px] text-slate-500">
              Add your club to MatchUp
            </Text>
          </View>
        </Pressable>
      </View>

      <View className="mt-8 flex-row items-center justify-center gap-2">
        <Building2 size={15} color="#94A3B8" strokeWidth={1.8} />
        <Text className="text-[12px] text-slate-400">
          You can update your club details at any time.
        </Text>
      </View>
    </Screen>
  );
}

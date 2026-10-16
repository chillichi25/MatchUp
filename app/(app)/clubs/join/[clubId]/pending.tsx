import { useLocalSearchParams, useRouter } from "expo-router";
import { Building2, ChevronLeft, Clock3, Shirt } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScreenScroll } from "@/components/ui/screen";
import {
  useClub,
  useClubTeams,
} from "@/features/clubs/hooks/use-club-queries";
import { formatTeamDetails } from "@/features/clubs/utils/team-labels";

export default function JoinClubPendingScreen() {
  const router = useRouter();
  const { clubId, teamId } = useLocalSearchParams<{
    clubId: string;
    teamId?: string;
  }>();

  const { data: club } = useClub(clubId);
  const { data: teams = [] } = useClubTeams(clubId);

  const team = teamId ? teams.find((item) => item.id === teamId) : undefined;

  return (
    <ScreenScroll contentClassName="px-7 pb-10">
      <View className="h-12 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ChevronLeft size={20} color="#07192D" strokeWidth={2} />
        </Pressable>
      </View>

      <View className="mt-4 items-center">
        {club?.badge_url ? (
          <Avatar uri={club.badge_url} name={club.name} size={82} />
        ) : (
          <View className="h-[82px] w-[82px] items-center justify-center">
            <Building2 size={42} color="#94A3B8" strokeWidth={1.8} />
          </View>
        )}

        <Text className="mt-4 text-center text-[22px] font-bold tracking-tight text-slate-900">
          {club?.name ?? "Club"}
        </Text>
      </View>

      <View className="mt-8 items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <Clock3 size={28} color="#D97706" strokeWidth={2} />
        </View>

        <Text className="mt-5 text-[22px] font-bold tracking-tight text-slate-900">
          Awaiting approval
        </Text>

        <Text className="mt-2 max-w-[300px] text-center text-[14px] leading-5 text-slate-500">
          {team
            ? `Your request to join ${team.name} is waiting for club approval.`
            : "Your request is waiting for club approval."}
        </Text>

        <Text className="mt-1 text-[12px] text-slate-400">
          We&apos;ll let you know when the club responds.
        </Text>
      </View>

      {team ? (
        <View className="mt-7 flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#E4F9EB]">
            <Shirt size={20} color="#00B83F" strokeWidth={1.9} />
          </View>

          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-semibold text-slate-900">
              {team.name}
            </Text>
            <Text className="mt-1 text-[13px] text-slate-500">
              {formatTeamDetails(team)}
            </Text>
          </View>
        </View>
      ) : null}

      <Button className="mt-8" onPress={() => router.replace("/clubs/pending")}>
        Done
      </Button>
    </ScreenScroll>
  );
}

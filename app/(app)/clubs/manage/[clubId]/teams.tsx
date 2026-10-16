import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Plus, Shield, Users } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import {
  useClub,
  useClubTeams,
} from "@/features/clubs/hooks/use-club-queries";
import { formatTeamDetails } from "@/features/clubs/utils/team-labels";

export default function ManageTeamsScreen() {
  const router = useRouter();
  const { clubId } = useLocalSearchParams<{ clubId: string }>();

  const { data: club } = useClub(clubId);
  const { data: teams = [], isLoading } = useClubTeams(clubId);

  return (
    <ScreenScroll contentClassName="px-6 pb-12">
      <View className="h-12 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to club management"
          hitSlop={10}
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ChevronLeft size={20} color="#07192D" strokeWidth={2} />
        </Pressable>
      </View>

      <View className="mt-4">
        <Text className="text-[24px] font-bold tracking-tight text-slate-900">
          Manage teams
        </Text>
        <Text className="mt-2 text-[14px] leading-5 text-slate-500">
          Manage the teams at {club?.name ?? "your club"}.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({ pathname: "/clubs/manage/[clubId]/team-form", params: { clubId } })
        }
        className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-[#00B83F]"
      >
        <Plus size={20} color="#FFFFFF" strokeWidth={2.2} />
        <Text className="text-[15px] font-semibold text-white">Add team</Text>
      </Pressable>

      <View className="mt-8 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-slate-500">Teams</Text>
        <Text className="text-[13px] text-slate-400">{teams.length}</Text>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : teams.length === 0 ? (
        <View className="mt-3">
          <EmptyState
            icon={<Users size={24} color="#94A3B8" strokeWidth={1.8} />}
            title="No teams yet"
            description="Add the first team for this club."
          />
        </View>
      ) : (
        <View className="mt-3 gap-3">
          {teams.map((team) => (
            <Pressable
              key={team.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/clubs/manage/[clubId]/team-form",
                  params: { clubId, teamId: team.id },
                })
              }
              className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4"
            >
              <View className="h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <Shield size={21} color="#00B83F" strokeWidth={1.9} />
              </View>

              <View className="min-w-0 flex-1">
                <Text className="text-[15px] font-semibold text-slate-900">
                  {team.name}
                </Text>
                <Text className="mt-1 text-[13px] text-slate-500">
                  {formatTeamDetails(team)}
                </Text>
                {team.level ? (
                  <Text className="mt-1 text-[12px] text-slate-400">
                    {team.level}
                  </Text>
                ) : null}
              </View>

              <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
            </Pressable>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

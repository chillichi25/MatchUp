import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Crown, ShieldCheck, UserRound } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import {
  useClub,
  useClubMemberTeams,
  useClubMembers,
} from "@/features/clubs/hooks/use-club-queries";

export default function ClubMembersScreen() {
  const router = useRouter();
  const { clubId } = useLocalSearchParams<{ clubId: string }>();

  const { data: club } = useClub(clubId);
  const { data: members = [], isLoading } = useClubMembers(clubId);
  const { data: memberTeams = [] } = useClubMemberTeams(clubId);

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
          Club members
        </Text>
        <Text className="mt-2 text-[14px] leading-5 text-slate-500">
          View the people who are members of {club?.name ?? "this club"}.
        </Text>
      </View>

      <View className="mt-7 flex-row items-center justify-between">
        <Text className="text-[13px] font-semibold text-slate-500">
          Members
        </Text>
        <Text className="text-[13px] text-slate-400">{members.length}</Text>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : members.length === 0 ? (
        <View className="mt-3">
          <EmptyState
            icon={<UserRound size={24} color="#94A3B8" strokeWidth={1.8} />}
            title="No members"
            description="There are no approved members to show."
          />
        </View>
      ) : (
        <View className="mt-3 gap-3">
          {members.map((member) => {
            const isOwner = member.club_role === "owner";
            const name =
              [member.first_name, member.last_name].filter(Boolean).join(" ") ||
              "Member";

            const teams = memberTeams.filter(
              (team) => team.coach_id === member.coach_id
            );

            return (
              <View
                key={member.membership_id}
                className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4"
              >
                <View
                  className={
                    isOwner
                      ? "h-12 w-12 items-center justify-center rounded-full bg-amber-50"
                      : "h-12 w-12 items-center justify-center rounded-full bg-green-50"
                  }
                >
                  {isOwner ? (
                    <Crown size={21} color="#D97706" strokeWidth={1.9} />
                  ) : (
                    <ShieldCheck size={21} color="#00B83F" strokeWidth={1.9} />
                  )}
                </View>

                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold text-slate-900">
                    {name}
                  </Text>

                  <Text className="mt-1 text-[12px] text-slate-500">
                    <Text className="capitalize">{member.club_role}</Text>
                    {teams.length > 0
                      ? ` • ${teams.map((team) => team.team_name).join(", ")}`
                      : ""}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScreenScroll>
  );
}

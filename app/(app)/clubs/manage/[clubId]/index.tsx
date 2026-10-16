import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Shield,
  UserRound,
  Users,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { ScreenScroll } from "@/components/ui/screen";
import { ErrorState, LoadingState } from "@/components/ui/state-views";
import {
  useCanManageClub,
  useClub,
  useClubTeams,
  usePendingClubJoinRequests,
  usePendingTeamJoinRequests,
} from "@/features/clubs/hooks/use-club-queries";

export default function ManageClubScreen() {
  const router = useRouter();
  const { clubId } = useLocalSearchParams<{ clubId: string }>();

  const { data: club, isLoading: loadingClub } = useClub(clubId);
  const { data: canManage, isLoading: loadingPermission } =
    useCanManageClub(clubId);
  const { data: clubRequests = [] } = usePendingClubJoinRequests(clubId);
  const { data: teamRequests = [] } = usePendingTeamJoinRequests(clubId);
  const { data: teams = [] } = useClubTeams(clubId);

  const isLoading = loadingClub || loadingPermission;

  const links = [
    {
      href: `/clubs/manage/${clubId}/requests`,
      icon: UserRound,
      title: "Join requests",
      subtitle: `${clubRequests.length} pending`,
    },
    {
      href: `/clubs/manage/${clubId}/team-requests`,
      icon: Shield,
      title: "Team requests",
      subtitle: `${teamRequests.length} pending`,
    },
    {
      href: `/clubs/manage/${clubId}/members`,
      icon: Users,
      title: "Members",
      subtitle: "View and manage members",
    },
    {
      href: `/clubs/manage/${clubId}/teams`,
      icon: Shield,
      title: "Teams",
      subtitle: `${teams.length} teams`,
    },
  ];

  return (
    <ScreenScroll contentClassName="px-6 pb-12">
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

      {isLoading ? (
        <LoadingState />
      ) : !canManage ? (
        <View className="mt-8">
          <ErrorState
            title="Not authorised"
            description="You don't have permission to manage this club."
          />
        </View>
      ) : (
        <>
          <View className="mt-4 flex-row items-center gap-4">
            <Avatar
              uri={club?.badge_url ?? null}
              name={club?.name ?? "Club"}
              size={56}
            />

            <View className="min-w-0 flex-1">
              <Text className="text-[20px] font-bold tracking-tight text-slate-900">
                {club?.name ?? "Club"}
              </Text>

              {[club?.city, club?.county].filter(Boolean).length > 0 ? (
                <View className="mt-1 flex-row items-center gap-1">
                  <MapPin size={13} color="#94A3B8" strokeWidth={1.8} />
                  <Text className="text-[13px] text-slate-500">
                    {[club?.city, club?.county].filter(Boolean).join(", ")}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text className="mt-8 text-[13px] font-semibold uppercase tracking-wide text-slate-400">
            Manage
          </Text>

          <View className="mt-3 gap-3">
            {links.map((link) => {
              const Icon = link.icon;

              return (
                <Pressable
                  key={link.href}
                  accessibilityRole="button"
                  onPress={() => router.push(link.href as never)}
                  className="flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-[#E4F9EB]">
                    <Icon size={20} color="#00B83F" strokeWidth={1.9} />
                  </View>

                  <View className="min-w-0 flex-1">
                    <Text className="text-[15px] font-semibold text-slate-900">
                      {link.title}
                    </Text>
                    <Text className="mt-0.5 text-[12px] text-slate-500">
                      {link.subtitle}
                    </Text>
                  </View>

                  <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </ScreenScroll>
  );
}

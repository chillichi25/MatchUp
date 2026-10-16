import { useLocalSearchParams, useRouter } from "expo-router";
import { Building2, ChevronLeft, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { ScreenScroll } from "@/components/ui/screen";
import {
  LoadingState,
  ErrorState,
} from "@/components/ui/state-views";
import { TeamSelectionForm } from "@/features/clubs/components/team-selection-form";
import {
  useClub,
  useClubTeams,
} from "@/features/clubs/hooks/use-club-queries";

export default function JoinClubDetailScreen() {
  const router = useRouter();
  const { clubId } = useLocalSearchParams<{ clubId: string }>();

  const {
    data: club,
    isLoading: loadingClub,
    isError: clubError,
    refetch: refetchClub,
  } = useClub(clubId);
  const { data: teams = [], isLoading: loadingTeams } = useClubTeams(clubId);

  const isLoading = loadingClub || loadingTeams;

  return (
    <ScreenScroll contentClassName="px-7 pb-10">
      <View className="h-12 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to search"
          hitSlop={10}
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ChevronLeft size={20} color="#07192D" strokeWidth={2} />
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : clubError || !club ? (
        <View className="mt-8">
          <ErrorState
            title="Club unavailable"
            description="We couldn't load this club."
            onRetry={() => refetchClub()}
          />
        </View>
      ) : (
        <>
          <View className="mt-4 items-center">
            {club.badge_url ? (
              <Avatar uri={club.badge_url} name={club.name} size={72} />
            ) : (
              <View className="h-[72px] w-[72px] items-center justify-center">
                <Building2 size={40} color="#94A3B8" strokeWidth={1.8} />
              </View>
            )}

            <Text className="mt-4 text-center text-[24px] font-bold tracking-tight text-slate-900">
              {club.name}
            </Text>

            {[club.city, club.county].filter(Boolean).length > 0 ? (
              <View className="mt-2 flex-row items-center gap-1">
                <MapPin size={14} color="#94A3B8" strokeWidth={1.8} />
                <Text className="text-[13px] text-slate-500">
                  {[club.city, club.county].filter(Boolean).join(", ")}
                </Text>
              </View>
            ) : null}
          </View>

          <TeamSelectionForm
            clubId={club.id}
            clubName={club.name}
            teams={teams}
          />
        </>
      )}
    </ScreenScroll>
  );
}

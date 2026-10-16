import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { ChevronLeft, Clock3, MapPin } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { LoadingState } from "@/components/ui/state-views";
import {
  useMyClub,
  usePendingClubRequest,
} from "@/features/clubs/hooks/use-club-queries";

export default function ClubPendingScreen() {
  const router = useRouter();

  const { data: myClub, isLoading: loadingMyClub } = useMyClub();
  const { data: pending, isLoading: loadingPending } = usePendingClubRequest();

  if (loadingMyClub || loadingPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (myClub) return <Redirect href="/dashboard" />;
  if (!pending) return <Redirect href="/clubs" />;

  return (
    <Screen className="px-6">
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

      <View className="items-center pt-6">
        <Image
          source={require("@/assets/images/matchup-logo.png")}
          style={{ width: 125, height: 68 }}
          contentFit="contain"
          accessibilityLabel="MatchUp"
        />
      </View>

      <View className="mt-8 items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <Clock3 size={28} color="#D97706" strokeWidth={2} />
        </View>

        <Text className="mt-5 text-[24px] font-bold tracking-tight text-slate-900">
          Awaiting approval
        </Text>

        <Text className="mt-2 max-w-[300px] text-center text-[14px] leading-5 text-slate-500">
          Your request to join {pending.club.name} is waiting for approval.
        </Text>
      </View>

      <Card className="mt-7 p-5">
        <View className="flex-row items-center gap-4">
          <Avatar
            uri={pending.club.badge_url}
            name={pending.club.name}
            size={56}
          />

          <View className="min-w-0 flex-1">
            <Text className="text-[16px] font-bold text-slate-900">
              {pending.club.name}
            </Text>

            {[pending.club.city, pending.club.county].filter(Boolean).length >
            0 ? (
              <View className="mt-1 flex-row items-center gap-1">
                <MapPin size={14} color="#94A3B8" strokeWidth={1.8} />
                <Text className="text-[13px] text-slate-500">
                  {[pending.club.city, pending.club.county]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </View>
            ) : null}

            {pending.club.country ? (
              <Text className="mt-0.5 text-[12px] text-slate-400">
                {pending.club.country}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="mt-5 flex-row items-start gap-3 border-t border-gray-100 pt-4">
          <Clock3 size={18} color="#D97706" strokeWidth={1.9} />
          <View className="min-w-0 flex-1">
            <Text className="text-[13px] font-semibold text-slate-900">
              Request pending
            </Text>
            <Text className="mt-0.5 text-[12px] text-slate-500">
              A club owner or admin will review your request.
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}

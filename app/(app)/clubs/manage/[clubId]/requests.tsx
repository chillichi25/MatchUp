import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Clock3, UserRound } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import {
  CLUB_QUERY_KEYS,
  useClub,
  usePendingClubJoinRequests,
} from "@/features/clubs/hooks/use-club-queries";
import { approveClubJoinRequest } from "@/features/clubs/services/club.service";

export default function ClubRequestsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clubId } = useLocalSearchParams<{ clubId: string }>();

  const { data: club } = useClub(clubId);
  const { data: requests = [], isLoading } =
    usePendingClubJoinRequests(clubId);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleApprove(membershipId: string) {
    setBusyId(membershipId);
    setErrorMessage("");

    try {
      await approveClubJoinRequest(membershipId);
      await queryClient.invalidateQueries({
        queryKey: CLUB_QUERY_KEYS.clubRequests(clubId),
      });
      await queryClient.invalidateQueries({ queryKey: CLUB_QUERY_KEYS.members(clubId) });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't approve this request."
      );
    } finally {
      setBusyId(null);
    }
  }

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
          Join requests
        </Text>
        <Text className="mt-2 text-[14px] leading-5 text-slate-500">
          Review coaches who want to join {club?.name ?? "your club"}.
        </Text>
      </View>

      {errorMessage ? (
        <Text className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
          {errorMessage}
        </Text>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : requests.length === 0 ? (
        <View className="mt-7">
          <EmptyState
            icon={<UserRound size={24} color="#94A3B8" strokeWidth={1.8} />}
            title="No pending requests"
            description="New requests to join your club will appear here."
          />
        </View>
      ) : (
        <View className="mt-7 gap-3">
          {requests.map((request) => (
            <View
              key={request.membership_id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <View className="flex-row items-center gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-green-50">
                  <UserRound size={21} color="#00B83F" strokeWidth={1.9} />
                </View>

                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold text-slate-900">
                    {[request.first_name, request.last_name]
                      .filter(Boolean)
                      .join(" ") || "Coach"}
                  </Text>

                  <View className="mt-1 flex-row items-center gap-1.5">
                    <Clock3 size={13} color="#94A3B8" strokeWidth={1.8} />
                    <Text className="text-[12px] text-slate-500">
                      Waiting for approval
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-4 border-t border-gray-100 pt-4">
                <Button
                  loading={busyId === request.membership_id}
                  onPress={() => handleApprove(request.membership_id)}
                >
                  Approve
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

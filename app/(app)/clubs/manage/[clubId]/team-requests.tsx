import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, ChevronLeft, Shield, Users } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { ScreenScroll } from "@/components/ui/screen";
import { EmptyState, LoadingState } from "@/components/ui/state-views";
import {
  CLUB_QUERY_KEYS,
  useClub,
  usePendingTeamJoinRequests,
} from "@/features/clubs/hooks/use-club-queries";
import { approveTeamJoinRequest } from "@/features/clubs/services/club.service";
import { formatTeamDetails } from "@/features/clubs/utils/team-labels";

export default function ClubTeamRequestsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clubId } = useLocalSearchParams<{ clubId: string }>();

  const { data: club } = useClub(clubId);
  const { data: requests = [], isLoading } = usePendingTeamJoinRequests(clubId);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleApprove(membershipId: string) {
    setBusyId(membershipId);
    setErrorMessage("");

    try {
      await approveTeamJoinRequest(membershipId);
      await queryClient.invalidateQueries({
        queryKey: CLUB_QUERY_KEYS.teamRequests(clubId),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't approve this team request."
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
          Team requests
        </Text>
        <Text className="mt-2 text-[14px] leading-5 text-slate-500">
          Review coaches requesting access to teams at{" "}
          {club?.name ?? "your club"}.
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
        <View className="mt-8">
          <EmptyState
            icon={<Check size={24} color="#00B83F" strokeWidth={2} />}
            title="No pending requests"
            description="You're all caught up."
          />
        </View>
      ) : (
        <View className="mt-7 gap-4">
          {requests.map((request) => (
            <View
              key={request.membership_id}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <View className="flex-row items-center gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Users size={21} color="#475569" strokeWidth={1.8} />
                </View>

                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-bold text-slate-900">
                    {[request.first_name, request.last_name]
                      .filter(Boolean)
                      .join(" ") || "Coach"}
                  </Text>
                  {request.role ? (
                    <Text className="mt-0.5 text-[12px] capitalize text-slate-500">
                      {request.role}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className="mt-4 flex-row items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-green-50">
                  <Shield size={19} color="#00B83F" strokeWidth={1.8} />
                </View>

                <View className="min-w-0 flex-1">
                  <Text className="text-[14px] font-semibold text-slate-900">
                    {request.team_name}
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-slate-500">
                    {formatTeamDetails({
                      age_group: request.age_group,
                      gender: request.gender,
                      match_format: request.match_format,
                    })}
                  </Text>
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

import { useRouter } from "expo-router";
import { Check, ChevronRight, Shirt, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { requestToJoinTeam } from "../services/club.service";
import type { ClubTeam } from "../types";
import { formatTeamDetails } from "../utils/team-labels";

type TeamSelectionFormProps = {
  clubId: string;
  clubName: string;
  teams: ClubTeam[];
};

export function TeamSelectionForm({
  clubId,
  clubName,
  teams,
}: TeamSelectionFormProps) {
  const router = useRouter();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRequest() {
    if (!selectedTeamId) return;

    setErrorMessage("");
    setSubmitting(true);

    try {
      await requestToJoinTeam(selectedTeamId);

      router.replace({
        pathname: "/clubs/join/[clubId]/pending",
        params: { clubId },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't send your team request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="mt-6">
      <Text className="text-[15px] font-bold text-slate-900">
        Teams at this club
      </Text>

      {teams.length === 0 ? (
        <View className="mt-3 rounded-2xl border border-gray-200 bg-white px-6 py-8">
          <Text className="text-[14px] font-semibold text-slate-900">
            No teams available
          </Text>
          <Text className="mt-1.5 text-[13px] text-slate-500">
            {clubName} hasn&apos;t added any teams yet.
          </Text>
        </View>
      ) : (
        <>
          <View className="mt-3 gap-3">
            {teams.map((team) => {
              const isSelected = team.id === selectedTeamId;

              return (
                <Pressable
                  key={team.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() =>
                    setSelectedTeamId(isSelected ? null : team.id)
                  }
                  className={
                    isSelected
                      ? "flex-row items-center gap-4 rounded-2xl border-2 border-[#00B83F] bg-[#F1FBF4] p-4"
                      : "flex-row items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4"
                  }
                >
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

                  {isSelected ? (
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-[#00B83F]">
                      <Check size={15} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : (
                    <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View className="mt-5 flex-row items-start gap-3 rounded-2xl bg-[#F1FBF4] px-4 py-3">
            <ShieldCheck size={18} color="#00B83F" strokeWidth={1.9} />
            <View className="min-w-0 flex-1">
              <Text className="text-[13px] font-semibold text-slate-900">
                Club approval required
              </Text>
              <Text className="mt-0.5 text-[12px] text-slate-500">
                Your request will be reviewed by the club owner or admin.
              </Text>
            </View>
          </View>

          {errorMessage ? (
            <Text className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
              {errorMessage}
            </Text>
          ) : null}

          <Button
            className="mt-5"
            loading={submitting}
            disabled={!selectedTeamId}
            onPress={handleRequest}
          >
            {submitting ? "Sending request..." : "Request to join team"}
          </Button>
        </>
      )}
    </View>
  );
}

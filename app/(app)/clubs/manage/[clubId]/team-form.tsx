import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { LoadingState } from "@/components/ui/state-views";
import {
  AGE_GROUP_OPTIONS,
  MATCH_FORMAT_OPTIONS,
  TEAM_CATEGORY_OPTIONS,
  TEAM_LEVEL_OPTIONS,
} from "@/features/clubs/constants";
import {
  CLUB_QUERY_KEYS,
  useClubTeams,
} from "@/features/clubs/hooks/use-club-queries";
import {
  createTeamForClub,
  updateTeamForClub,
} from "@/features/clubs/services/club.service";
import type { ClubTeam } from "@/features/clubs/types";

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ label: value, value }));

export default function TeamFormScreen() {
  const { clubId, teamId } = useLocalSearchParams<{
    clubId: string;
    teamId?: string;
  }>();

  const { data: teams = [], isLoading } = useClubTeams(clubId);
  const existing = teamId ? teams.find((team) => team.id === teamId) : undefined;

  if (teamId && isLoading) {
    return (
      <View className="flex-1 bg-[#F8FAFC]">
        <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
          <LoadingState />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <TeamForm
      key={teamId ?? "new"}
      clubId={clubId}
      teamId={teamId}
      existing={existing}
    />
  );
}

function TeamForm({
  clubId,
  teamId,
  existing,
}: {
  clubId: string;
  teamId?: string;
  existing?: ClubTeam;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState(existing?.name ?? "");
  const [ageGroup, setAgeGroup] = useState(existing?.age_group ?? "");
  const [matchFormat, setMatchFormat] = useState(existing?.match_format ?? "");
  const [gender, setGender] = useState(existing?.gender ?? "");
  const [level, setLevel] = useState(existing?.level ?? "");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSave() {
    setErrorMessage("");

    if (!name.trim() || !ageGroup || !matchFormat || !gender || !level) {
      setErrorMessage("Please complete all team details.");
      return;
    }

    setSaving(true);

    try {
      if (teamId) {
        await updateTeamForClub({
          teamId,
          name,
          ageGroup,
          matchFormat,
          gender,
          level,
        });
      } else {
        await createTeamForClub({
          clubId,
          name,
          ageGroup,
          matchFormat,
          gender,
          level,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: CLUB_QUERY_KEYS.teams(clubId),
      });

      router.back();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "We couldn't save this team."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="px-6 pb-12 pt-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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

            <View className="mt-4">
              <Text className="text-[24px] font-bold tracking-tight text-slate-900">
                {teamId ? "Edit team" : "Add team"}
              </Text>
              <Text className="mt-2 text-[14px] leading-5 text-slate-500">
                {teamId
                  ? "Update this team's details."
                  : "Add a team to your club."}
              </Text>
            </View>

            <View className="mt-6">
              <Input
                label="Team name"
                placeholder="e.g. U12 Reds"
                value={name}
                onChangeText={setName}
              />

              <SelectField
                containerClassName="mt-4"
                label="Age group"
                placeholder="Select age group"
                options={toOptions(AGE_GROUP_OPTIONS)}
                value={ageGroup || null}
                onChange={setAgeGroup}
              />

              <SelectField
                containerClassName="mt-4"
                label="Match format"
                placeholder="Select match format"
                options={toOptions(MATCH_FORMAT_OPTIONS)}
                value={matchFormat || null}
                onChange={setMatchFormat}
              />

              <SelectField
                containerClassName="mt-4"
                label="Team category"
                placeholder="Select team category"
                options={toOptions(TEAM_CATEGORY_OPTIONS)}
                value={gender || null}
                onChange={setGender}
              />

              <SelectField
                containerClassName="mt-4"
                label="Team level"
                placeholder="Select team level"
                helperText="Choose the level that best reflects your team."
                options={toOptions(TEAM_LEVEL_OPTIONS)}
                value={level || null}
                onChange={setLevel}
              />

              {errorMessage ? (
                <Text className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
                  {errorMessage}
                </Text>
              ) : null}

              <Button className="mt-6" loading={saving} onPress={handleSave}>
                {saving ? "Saving..." : teamId ? "Save changes" : "Add team"}
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

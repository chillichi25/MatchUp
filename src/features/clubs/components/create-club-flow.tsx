import { useRouter } from "expo-router";
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
import {
  AGE_GROUP_OPTIONS,
  MATCH_FORMAT_OPTIONS,
  TEAM_CATEGORY_OPTIONS,
  TEAM_LEVEL_OPTIONS,
} from "../constants";
import { completeClubSetup } from "../services/club.service";
import type { LocationValue } from "../types";
import { LocationPicker } from "./location-picker";

type Step = 1 | 2 | 3;

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ label: value, value }));

export function CreateClubFlow() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [clubName, setClubName] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [clubError, setClubError] = useState("");

  const [teamName, setTeamName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [matchFormat, setMatchFormat] = useState("");
  const [gender, setGender] = useState("");
  const [level, setLevel] = useState("");
  const [teamError, setTeamError] = useState("");

  function handleContinueFromClub() {
    setClubError("");

    if (!clubName.trim()) {
      setClubError("Please enter your club name.");
      return;
    }

    if (!location) {
      setClubError("Please select your club's location.");
      return;
    }

    setStep(2);
  }

  function handleContinueFromTeam() {
    setTeamError("");

    if (!teamName.trim()) {
      setTeamError("Please enter a team name.");
      return;
    }

    if (!ageGroup || !matchFormat || !gender || !level) {
      setTeamError("Please complete all team details.");
      return;
    }

    setStep(3);
  }

  async function handleCreate() {
    if (!location) return;

    setErrorMessage("");
    setSubmitting(true);

    try {
      await completeClubSetup({
        clubName: clubName.trim(),
        country: location.country,
        county: location.county,
        city: location.city,
        lat: location.lat,
        lng: location.lng,
        teamName: teamName.trim(),
        ageGroup,
        matchFormat,
        gender,
        level,
      });

      router.replace("/clubs/setup-complete");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn't create your club and team. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const progress = step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full";

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="px-7 pb-10 pt-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="h-10 flex-row items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={10}
                onPress={() =>
                  step === 1 ? router.back() : setStep((step - 1) as Step)
                }
                className="h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white"
              >
                <ChevronLeft size={20} color="#07192D" strokeWidth={2} />
              </Pressable>
            </View>

            <View className="mt-6">
              <View className="flex-row items-center justify-between">
                <Text className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                  {step === 3 ? "Review setup" : "Club setup"}
                </Text>
                <Text className="text-[12px] font-semibold text-[#00B83F]">
                  Step {step} of 3
                </Text>
              </View>

              <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <View className={`h-full rounded-full bg-[#00B83F] ${progress}`} />
              </View>
            </View>

            {step === 1 ? (
              <View className="mt-7">
                <Text className="text-[24px] font-bold tracking-tight text-slate-900">
                  Create your club
                </Text>
                <Text className="mt-1.5 text-[14px] text-slate-400">
                  Tell us about your club and where it&apos;s based.
                </Text>

                <View className="mt-6">
                  <Input
                    label="Club name"
                    placeholder="e.g. Leeds Juniors FC"
                    autoComplete="organization"
                    value={clubName}
                    onChangeText={setClubName}
                  />

                  <Text className="mb-1.5 mt-4 text-[13px] font-medium text-slate-700">
                    Club location
                  </Text>
                  <Text className="mb-2 text-[12px] text-slate-400">
                    Search for your club&apos;s town or city.
                  </Text>

                  <LocationPicker value={location} onChange={setLocation} />

                  {clubError ? (
                    <Text className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
                      {clubError}
                    </Text>
                  ) : null}

                  <Button className="mt-6" onPress={handleContinueFromClub}>
                    Continue
                  </Button>
                </View>
              </View>
            ) : step === 2 ? (
              <View className="mt-7">
                <Text className="text-[24px] font-bold tracking-tight text-slate-900">
                  Tell us about your team
                </Text>
                <Text className="mt-1.5 text-[14px] text-slate-400">
                  This is the first team at {clubName.trim() || "your club"}.
                </Text>

                <View className="mt-6">
                  <Input
                    label="Team name"
                    placeholder="e.g. U12 Reds"
                    value={teamName}
                    onChangeText={setTeamName}
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

                  {teamError ? (
                    <Text className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
                      {teamError}
                    </Text>
                  ) : null}

                  <Button className="mt-6" onPress={handleContinueFromTeam}>
                    Continue
                  </Button>
                </View>
              </View>
            ) : (
              <View className="mt-7">
                <Text className="text-[24px] font-bold tracking-tight text-slate-900">
                  Ready to go?
                </Text>
                <Text className="mt-1.5 text-[14px] text-slate-400">
                  Check your club and team details before creating your MatchUp
                  profile.
                </Text>

                <View className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <Text className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                    Club
                  </Text>
                  <Text className="mt-2 text-[16px] font-semibold text-slate-900">
                    {clubName.trim()}
                  </Text>
                  <Text className="mt-1 text-[13px] text-slate-500">
                    {[location?.city, location?.county]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                  <Text className="text-[13px] text-slate-500">
                    {location?.country}
                  </Text>
                </View>

                <View className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
                  <Text className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                    Team
                  </Text>

                  {[
                    ["Team name", teamName.trim()],
                    ["Age group", ageGroup],
                    ["Match format", matchFormat],
                    ["Category", gender],
                    ["Team level", level],
                  ].map(([label, value]) => (
                    <View
                      key={label}
                      className="mt-3 flex-row items-center justify-between"
                    >
                      <Text className="text-[13px] text-slate-500">{label}</Text>
                      <Text className="text-[13px] font-medium text-slate-900">
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>

                {errorMessage ? (
                  <Text className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
                    {errorMessage}
                  </Text>
                ) : null}

                <Button
                  className="mt-6"
                  loading={submitting}
                  onPress={handleCreate}
                >
                  {submitting ? "Creating..." : "Create club & team"}
                </Button>

                <Text className="mt-3 text-center text-[12px] text-slate-400">
                  You can update these details later from your profile.
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

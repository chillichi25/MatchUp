import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const NAVY = "#07192D";
const GREEN = "#009E45";
const MUTED = "#596B80";
const BORDER = "#CBD5E1";

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ label: value, value }));

const STEP_CONTENT = {
  1: {
    title: "Create your club",
    description: "Add your club’s name and location.",
  },
  2: {
    title: "Add your team",
    description: "Set up your club’s first team.",
  },
  3: {
  title: "Everything look right?",
  description: "Check your club and team details.",
},
};

export function CreateClubFlow() {
  const router = useRouter();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const submittingRef = useRef(false);

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

  const [focusedField, setFocusedField] = useState<
    "club" | "team" | null
  >(null);

  function goToStep(nextStep: Step) {
    if (submittingRef.current) return;

    Keyboard.dismiss();
    setErrorMessage("");
    setStep(nextStep);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function handleBack() {
    if (submittingRef.current) return;

    if (step > 1) {
      goToStep((step - 1) as Step);
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/clubs");
    }
  }

  function handleContinueFromClub() {
    setClubError("");

    if (!clubName.trim()) {
      setClubError("Please enter your club name.");
      return;
    }

    if (!location) {
      setClubError("Please select your club’s location.");
      return;
    }

    goToStep(2);
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

    goToStep(3);
  }

  async function handleCreate() {
    if (submittingRef.current) return;

    if (!clubName.trim() || !location) {
      goToStep(1);
      setClubError("Please complete your club details.");
      return;
    }

    if (
      !teamName.trim() ||
      !ageGroup ||
      !matchFormat ||
      !gender ||
      !level
    ) {
      goToStep(2);
      setTeamError("Please complete all team details.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setErrorMessage("");
    Keyboard.dismiss();

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
          : "We couldn’t create your club and team. Please try again."
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  const heading = STEP_CONTENT[step];

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Add your club</Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    step === 1
                      ? "Back to club options"
                      : "Back to previous step"
                  }
                  disabled={submitting}
                  onPress={handleBack}
                  style={styles.backTouch}
                >
                  <View style={styles.backCircle}>
                    <ChevronLeft
                      size={20}
                      color={NAVY}
                      strokeWidth={2}
                    />
                  </View>
                </Pressable>
              </View>

              <View style={styles.introduction}>
                <Text
                  accessibilityRole="header"
                  style={styles.heading}
                >
                  {heading.title}
                </Text>

                <Text style={styles.description}>
                  {heading.description}
                </Text>
              </View>

              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel="Club setup"
                accessibilityValue={{
                  min: 1,
                  max: 3,
                  now: step,
                  text: `Step ${step} of 3`,
                }}
                style={styles.progressSection}
              >
                <Text style={styles.stepText}>
                  Step {step} of 3
                </Text>

                <View style={styles.progressRow}>
                  {([1, 2, 3] as const).map((item) => (
                    <View
                      key={item}
                      style={[
                        styles.progressSegment,
                        item <= step && styles.progressActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {step === 1 ? (
                <View style={styles.form}>
                  <Text style={styles.label}>Club name</Text>

                  <TextInput
                    accessibilityLabel="Club name"
                    placeholder="e.g. Leeds Juniors FC"
                    placeholderTextColor="#7B8798"
                    autoComplete="organization"
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={clubName}
                    onChangeText={(value) => {
                      setClubName(value);
                      setClubError("");
                    }}
                    onFocus={() => setFocusedField("club")}
                    onBlur={() => setFocusedField(null)}
                    style={[
                      styles.input,
                      focusedField === "club" && styles.inputFocused,
                    ]}
                  />

                  <Text style={[styles.label, styles.nextField]}>
                    Town or city
                  </Text>

                  <LocationPicker
                    value={location}
                    onChange={(value) => {
                      setLocation(value);
                      setClubError("");
                    }}
                  />

                  {clubError ? (
                    <View
                      accessibilityRole="alert"
                      style={styles.errorBox}
                    >
                      <Text style={styles.errorText}>{clubError}</Text>
                    </View>
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    onPress={handleContinueFromClub}
                    className="mt-6 min-h-[50px] w-full items-center justify-center rounded-full bg-[#009E45] px-6 py-3 active:opacity-80"
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                  </Pressable>
                </View>
              ) : step === 2 ? (
                <View style={styles.form}>
                  <Text style={styles.label}>Team name</Text>

                  <TextInput
                    accessibilityLabel="Team name"
                    placeholder="e.g. U12 Reds"
                    placeholderTextColor="#7B8798"
                    autoCapitalize="words"
                    autoCorrect={false}
                    value={teamName}
                    onChangeText={(value) => {
                      setTeamName(value);
                      setTeamError("");
                    }}
                    onFocus={() => setFocusedField("team")}
                    onBlur={() => setFocusedField(null)}
                    style={[
                      styles.input,
                      focusedField === "team" && styles.inputFocused,
                    ]}
                  />

                  <SelectField
                    containerClassName="mt-3"
                    label="Age group"
                    placeholder="Select age group"
                    options={toOptions(AGE_GROUP_OPTIONS)}
                    value={ageGroup || null}
                    onChange={setAgeGroup}
                  />

                  <SelectField
                    containerClassName="mt-3"
                    label="Match format"
                    placeholder="Select match format"
                    options={toOptions(MATCH_FORMAT_OPTIONS)}
                    value={matchFormat || null}
                    onChange={setMatchFormat}
                  />

                  <SelectField
                    containerClassName="mt-3"
                    label="Team category"
                    placeholder="Select team category"
                    options={toOptions(TEAM_CATEGORY_OPTIONS)}
                    value={gender || null}
                    onChange={setGender}
                  />

                  <SelectField
                    containerClassName="mt-3"
                    label="Team level"
                    placeholder="Select team level"
                    options={toOptions(TEAM_LEVEL_OPTIONS)}
                    value={level || null}
                    onChange={setLevel}
                  />

                  {teamError ? (
                    <View
                      accessibilityRole="alert"
                      style={styles.errorBox}
                    >
                      <Text style={styles.errorText}>{teamError}</Text>
                    </View>
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    onPress={handleContinueFromTeam}
                    className="mt-4 min-h-[50px] w-full items-center justify-center rounded-full bg-[#009E45] px-6 py-3 active:opacity-80"
                  >
                    <Text style={styles.buttonText}>Continue</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.form}>
                  <View style={styles.reviewCard}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Club details</Text>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Edit club details"
                        disabled={submitting}
                        onPress={() => goToStep(1)}
                        style={styles.editButton}
                      >
                        <Text style={styles.editText}>Edit</Text>
                      </Pressable>
                    </View>

                    <Text style={styles.clubName}>
                      {clubName.trim()}
                    </Text>

                    <Text style={styles.location}>
                      {[
                        location?.city,
                        location?.county,
                        location?.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </Text>
                  </View>

                  <View style={[styles.reviewCard, { marginTop: 12 }]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>Team details</Text>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Edit team details"
                        disabled={submitting}
                        onPress={() => goToStep(2)}
                        style={styles.editButton}
                      >
                        <Text style={styles.editText}>Edit</Text>
                      </Pressable>
                    </View>

                    {[
                      ["Team name", teamName.trim()],
                      ["Age group", ageGroup],
                      ["Match format", matchFormat],
                      ["Category", gender],
                      ["Team level", level],
                    ].map(([label, value]) => (
                      <View key={label} style={styles.reviewRow}>
                        <Text style={styles.reviewLabel}>{label}</Text>
                        <Text style={styles.reviewValue}>{value}</Text>
                      </View>
                    ))}
                  </View>

                  {errorMessage ? (
                    <View
                      accessibilityRole="alert"
                      style={styles.errorBox}
                    >
                      <Text style={styles.errorText}>
                        {errorMessage}
                      </Text>
                    </View>
                  ) : null}

                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: submitting,
                      busy: submitting,
                    }}
                    disabled={submitting}
                    onPress={() => {
                      void handleCreate();
                    }}
                    className="mt-6 min-h-[50px] w-full flex-row items-center justify-center gap-2 rounded-full bg-[#009E45] px-6 py-3 active:opacity-80"
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : null}

                    <Text style={styles.buttonText}>
                      {submitting ? "Creating…" : "Create club & team"}
                    </Text>
                  </Pressable>

                  <Text style={styles.footerText}>
                    You can update your club and team details later.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  topBar: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    color: NAVY,
    fontSize: 17,
    fontWeight: "700",
  },
  backTouch: {
    position: "absolute",
    left: -8,
    top: 0,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  backCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  introduction: {
    marginTop: 24,
    alignItems: "center",
  },
  heading: {
    color: NAVY,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1.7,
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  progressSection: {
    marginTop: 24,
  },
  stepText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  progressRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
  },
  progressActive: {
    backgroundColor: GREEN,
  },
  form: {
    marginTop: 24,
  },
  label: {
    marginBottom: 4,
    color: NAVY,
    fontSize: 14,
    fontWeight: "500",
  },
  nextField: {
    marginTop: 16,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    color: NAVY,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: GREEN,
  },
  errorBox: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    lineHeight: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  editButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  editText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  clubName: {
    marginTop: 4,
    color: NAVY,
    fontSize: 16,
    fontWeight: "600",
  },
  location: {
    marginTop: 6,
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 12,
  },
  reviewLabel: {
    flex: 1,
    color: MUTED,
    fontSize: 13,
    lineHeight: 20,
  },
  reviewValue: {
    flex: 1,
    color: NAVY,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "right",
  },
  footerText: {
    marginTop: 12,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
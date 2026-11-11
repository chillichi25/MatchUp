import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  Shield,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/avatar";
import { ErrorState } from "@/components/ui/state-views";
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

  const {
    data: teams = [],
    isLoading: loadingTeams,
    isError: teamsError,
    refetch: refetchTeams,
  } = useClubTeams(clubId);

  const isLoading = loadingClub || loadingTeams;

  const location = club
    ? [club.city, club.county].filter(Boolean).join(", ")
    : "";

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/clubs/join");
    }
  }

  function retryLoading() {
    void refetchClub();
    void refetchTeams();
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top", "bottom"]}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexGrow: 1,
              width: "100%",
              maxWidth: 440,
              alignSelf: "center",
            }}
          >
            <View className="h-12 flex-row items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to club search"
                onPress={handleBack}
                className="h-12 w-12 items-center justify-center active:opacity-70"
              >
                <View className="h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-white">
                  <ChevronLeft
                    size={20}
                    color="#07192D"
                    strokeWidth={2}
                  />
                </View>
              </Pressable>

              <Text className="flex-1 text-center text-[17px] font-bold text-[#07192D]">
                Choose your team
              </Text>

              <View style={{ width: 48 }} />
            </View>

            {isLoading ? (
              <View
                style={{
                  flexGrow: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 48,
                }}
              >
                <ActivityIndicator
                  size="small"
                  color="#009E45"
                  accessibilityLabel="Loading club and teams"
                />
              </View>
            ) : clubError || !club ? (
              <View className="mt-6">
                <ErrorState
                  title="Club unavailable"
                  description="We couldn't load this club. Please try again."
                  onRetry={retryLoading}
                />
              </View>
            ) : (
              <>
                <View
                  style={{
                    marginTop: 24,
                    alignItems: "center",
                  }}
                >
                  <Text
                    accessibilityRole="header"
                    style={{
                      color: "#07192D",
                      fontSize: 28,
                      fontWeight: "800",
                      letterSpacing: -1.7,
                      textAlign: "center",
                    }}
                  >
                    {club.name}
                  </Text>

                  {location ? (
                    <View
                      style={{
                        marginTop: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        maxWidth: "100%",
                        gap: 4,
                      }}
                    >
                      <MapPin
                        size={14}
                        color="#7B8798"
                        strokeWidth={1.8}
                      />

                      <Text
                        style={{
                          flexShrink: 1,
                          color: "#596B80",
                          fontSize: 13,
                          lineHeight: 20,
                          textAlign: "center",
                        }}
                      >
                        {location}
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={{ marginTop: 20 }}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  >
                    {club.badge_url ? (
                      <Avatar
                        uri={club.badge_url}
                        name={club.name}
                        size={80}
                      />
                    ) : (
                      <View
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          backgroundColor: "#E4F5EB",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Shield
                          size={30}
                          color="#009E45"
                          strokeWidth={1.8}
                        />
                      </View>
                    )}
                  </View>
                </View>

                {teamsError ? (
                  <View className="mt-6">
                    <ErrorState
                      title="Couldn't load teams"
                      description="Please check your connection and try again."
                      onRetry={() => {
                        void refetchTeams();
                      }}
                    />
                  </View>
                ) : (
                  <TeamSelectionForm
                    clubId={club.id}
                    clubName={club.name}
                    teams={teams}
                  />
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
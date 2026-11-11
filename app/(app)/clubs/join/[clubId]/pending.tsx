import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock3, Shield, Shirt } from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/avatar";
import {
  useClub,
  useClubTeams,
} from "@/features/clubs/hooks/use-club-queries";
import { formatTeamDetails } from "@/features/clubs/utils/team-labels";

const NAVY = "#07192D";
const GREEN = "#009E45";
const MUTED = "#596B80";
const BACKGROUND = "#F8FAFC";

export default function JoinClubPendingScreen() {
  const router = useRouter();

  const { clubId, teamId } = useLocalSearchParams<{
    clubId: string;
    teamId?: string;
  }>();

  const {
    data: club,
    isLoading: loadingClub,
    isError: clubError,
    refetch: refetchClub,
  } = useClub(clubId);

  const { data: teams = [] } = useClubTeams(clubId);

  const team = teamId
    ? teams.find((item) => item.id === teamId)
    : undefined;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.topBar}>
              <Text style={styles.topBarTitle}>Request sent</Text>
            </View>

            <View style={styles.introduction}>
              <Text accessibilityRole="header" style={styles.heading}>
                Awaiting approval
              </Text>

              <Text style={styles.description}>
                A club owner or admin will review your request to join.
              </Text>
            </View>

            <View style={styles.clubSection}>
              {loadingClub ? (
                <View style={styles.badgePlaceholder}>
                  <ActivityIndicator size="small" color={GREEN} />
                </View>
              ) : club?.badge_url ? (
                <Avatar
                  uri={club.badge_url}
                  name={club.name}
                  size={80}
                />
              ) : (
                <View style={styles.fallbackBadge}>
                  <Shield
                    size={32}
                    color={GREEN}
                    strokeWidth={1.8}
                  />
                </View>
              )}

              {club ? (
                <Text style={styles.clubName}>{club.name}</Text>
              ) : null}

              <View style={styles.statusBadge}>
                <Clock3 size={15} color="#B45309" strokeWidth={1.8} />
                <Text style={styles.statusText}>Pending approval</Text>
              </View>

              {clubError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    We couldn&apos;t load the club details.
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      void refetchClub();
                    }}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryText}>Try again</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>

            {team ? (
              <View style={styles.teamCard}>
                <View style={styles.teamIcon}>
                  <Shirt
                    size={20}
                    color={GREEN}
                    strokeWidth={1.8}
                  />
                </View>

                <View style={styles.teamContent}>
                  <Text style={styles.teamName}>{team.name}</Text>

                  <Text style={styles.teamDetails}>
                    {formatTeamDetails(team)}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace("/clubs/pending")}
                className="min-h-[50px] w-full items-center justify-center rounded-full bg-[#009E45] px-6 py-3 active:opacity-80"
              >
                <Text style={styles.buttonText}>Done</Text>
              </Pressable>

              <Text style={styles.footerText}>
                You can check your request status when you return.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
    textAlign: "center",
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
    maxWidth: 300,
    marginTop: 8,
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  clubSection: {
    marginTop: 32,
    alignItems: "center",
  },
  badgePlaceholder: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E4F5EB",
    alignItems: "center",
    justifyContent: "center",
  },
  clubName: {
    marginTop: 16,
    color: NAVY,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  statusBadge: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#FFF7E6",
  },
  statusText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "600",
  },
  errorContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  errorText: {
    color: MUTED,
    fontSize: 13,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  teamCard: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  teamIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E4F5EB",
    alignItems: "center",
    justifyContent: "center",
  },
  teamContent: {
    flex: 1,
    minWidth: 0,
  },
  teamName: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "600",
  },
  teamDetails: {
    marginTop: 4,
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 40,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  footerText: {
    marginTop: 12,
    color: MUTED,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
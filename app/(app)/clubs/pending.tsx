import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import {
  ChevronLeft,
  Clock3,
  MapPin,
  Shirt,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/features/auth/providers/auth-provider";
import { signOut } from "@/features/auth/services/auth.service";
import { useMyJoinRequests } from "@/features/clubs/hooks/use-my-join-requests";
import { cancelMyJoinRequest } from "@/features/clubs/services/club.service";
import { formatTeamDetails } from "@/features/clubs/utils/team-labels";
import {
  useActiveTeam,
  useAvailableTeams,
} from "@/features/teams/hooks/use-teams";

const GREEN = "#009E45";

type CancelInput = {
  clubId: string;
  membershipId?: string;
};

export default function ClubPendingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    session,
    isLoading: loadingSession,
  } = useSession();

  const activeTeamQuery = useActiveTeam();
  const availableTeamsQuery = useAvailableTeams();
  const requestsQuery = useMyJoinRequests();

  const requests = requestsQuery.data ?? [];

  const hasTeam = Boolean(
    activeTeamQuery.data ||
      availableTeamsQuery.data?.length
  );

  const [checking, setChecking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshError, setRefreshError] = useState("");

  const busyRef = useRef(false);
  const confirmationRef = useRef(false);

  const cancellation = useMutation({
    mutationFn: cancelMyJoinRequest,

    onSuccess: async () => {
      setRefreshError("");
      setMessage("Request cancelled.");

      await queryClient.invalidateQueries({
        queryKey: ["club"],
      });
    },

    onError: () => {
      Alert.alert(
        "Couldn't cancel request",
        "Refresh its status and try again. It may already have been processed."
      );
    },

    onSettled: () => {
      busyRef.current = false;
    },
  });

  const busy =
    checking ||
    loggingOut ||
    cancellation.isPending;

  const hasError =
    requestsQuery.isError ||
    activeTeamQuery.isError ||
    availableTeamsQuery.isError;

  function confirmCancellation(
    input: CancelInput,
    name: string
  ) {
    if (
      busyRef.current ||
      confirmationRef.current ||
      busy
    ) {
      return;
    }

    confirmationRef.current = true;

    Alert.alert(
      "Cancel request?",
      `Withdraw your request to join ${name}? You can request to join again later.`,
      [
        {
          text: "Keep request",
          style: "cancel",
          onPress: () => {
            confirmationRef.current = false;
          },
        },
        {
          text: "Cancel request",
          style: "destructive",
          onPress: () => {
            confirmationRef.current = false;

            if (busyRef.current) return;

            busyRef.current = true;
            setMessage("");
            setRefreshError("");
            cancellation.mutate(input);
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          confirmationRef.current = false;
        },
      }
    );
  }

  async function checkStatus() {
    if (busyRef.current) return;

    busyRef.current = true;
    setChecking(true);
    setMessage("");
    setRefreshError("");

    try {
      const [
        requestResult,
        activeResult,
        teamsResult,
      ] = await Promise.all([
        requestsQuery.refetch(),
        activeTeamQuery.refetch(),
        availableTeamsQuery.refetch(),
      ]);

      if (
        requestResult.isError ||
        activeResult.isError ||
        teamsResult.isError
      ) {
        throw new Error("Unable to refresh status");
      }

      await queryClient.invalidateQueries({
        queryKey: ["club"],
      });

      const remaining = requestResult.data ?? [];

      const canUseDashboard = Boolean(
        activeResult.data ||
          teamsResult.data?.length
      );

      if (!hasTeam && canUseDashboard) {
        router.replace("/dashboard");
        return;
      }

      setMessage(
        remaining.length === 0
          ? "Status checked. You have no pending requests."
          : remaining.length === 1
            ? "Your request is still awaiting approval."
            : "Your requests are still awaiting approval."
      );
    } catch {
      setRefreshError(
        "We couldn't refresh your requests. Please try again."
      );
    } finally {
      busyRef.current = false;
      setChecking(false);
    }
  }

  async function handleLogout() {
    if (busyRef.current) return;

    busyRef.current = true;
    setLoggingOut(true);

    try {
      const { error } = await signOut();

      if (error) throw error;

      router.replace("/login");
    } catch {
      Alert.alert(
        "Couldn't log out",
        "Please try again."
      );
    } finally {
      busyRef.current = false;
      setLoggingOut(false);
    }
  }

  if (
    loadingSession ||
    (session &&
      (activeTeamQuery.isLoading ||
        availableTeamsQuery.isLoading ||
        requestsQuery.isLoading))
  ) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="small"
          color={GREEN}
          accessibilityLabel="Loading your requests"
        />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const noRequests =
    !hasError && requests.length === 0;

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.topBar}>
            {hasTeam ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to dashboard"
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={() =>
                  router.replace("/dashboard")
                }
                style={styles.back}
                hitSlop={8}
              >
                <ChevronLeft
                  size={20}
                  color="#07192D"
                />
              </Pressable>
            ) : null}

            <Text style={styles.topTitle}>
              Request status
            </Text>
          </View>

          <View style={styles.introduction}>
            <Text
              accessibilityRole="header"
              style={styles.heading}
            >
              {hasError && requests.length === 0
                ? "Couldn't load your requests"
                : noRequests
                  ? "No pending requests"
                  : "Awaiting approval"}
            </Text>

            <Text style={styles.description}>
              {hasError && requests.length === 0
                ? "Check your connection and try again."
                : noRequests
                  ? hasTeam
                    ? "Your available teams are in the team switcher."
                    : "You can find a club and request to join."
                  : hasTeam
                    ? "Track your requests here while continuing to use your current team."
                    : "A club owner or admin will review your request to join."}
            </Text>
          </View>

          {requests.map((request) => {
            const location = [
              request.club.city,
              request.club.county,
              request.club.country,
            ]
              .filter(Boolean)
              .join(", ");

            const cancellingClub =
              cancellation.isPending &&
              cancellation.variables?.clubId ===
                request.clubId &&
              !cancellation.variables?.membershipId;

            return (
              <View
                key={request.clubId}
                style={styles.request}
              >
                <View style={styles.clubSection}>
                  <Avatar
                    uri={request.club.badge_url}
                    name={request.club.name}
                    size={72}
                  />

                  <Text style={styles.clubName}>
                    {request.club.name}
                  </Text>

                  {location ? (
                    <View style={styles.location}>
                      <MapPin
                        size={14}
                        color="#596B80"
                      />

                      <Text style={styles.locationText}>
                        {location}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.badge}>
                    <Clock3
                      size={14}
                      color="#B45309"
                    />

                    <Text style={styles.badgeText}>
                      Pending approval
                    </Text>
                  </View>
                </View>

                {request.teams.map((team) => {
                  const cancellingTeam =
                    cancellation.isPending &&
                    cancellation.variables?.membershipId ===
                      team.membershipId;

                  return (
                    <View
                      key={team.membershipId}
                      style={styles.teamCard}
                    >
                      <View style={styles.teamRow}>
                        <View style={styles.teamIcon}>
                          <Shirt
                            size={20}
                            color={GREEN}
                          />
                        </View>

                        <View style={styles.flex}>
                          <Text style={styles.teamName}>
                            {team.name}
                          </Text>

                          <Text style={styles.teamDetails}>
                            {formatTeamDetails(team)}
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Cancel request to join ${team.name} at ${request.club.name}`}
                        accessibilityState={{
                          disabled: busy,
                          busy: cancellingTeam,
                        }}
                        disabled={busy}
                        onPress={() =>
                          confirmCancellation(
                            {
                              clubId: request.clubId,
                              membershipId:
                                team.membershipId,
                            },
                            `${team.name} at ${request.club.name}`
                          )
                        }
                        style={[
                          styles.cancelButton,
                          busy && styles.dimmed,
                        ]}
                      >
                        {cancellingTeam ? (
                          <ActivityIndicator
                            size="small"
                            color="#B91C1C"
                          />
                        ) : null}

                        <Text style={styles.cancelText}>
                          {cancellingTeam
                            ? "Cancelling…"
                            : "Cancel request"}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}

                {request.teams.length === 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Cancel request to join ${request.club.name}`}
                    accessibilityState={{
                      disabled: busy,
                      busy: cancellingClub,
                    }}
                    disabled={busy}
                    onPress={() =>
                      confirmCancellation(
                        { clubId: request.clubId },
                        request.club.name
                      )
                    }
                    style={[
                      styles.clubCancelButton,
                      busy && styles.dimmed,
                    ]}
                  >
                    {cancellingClub ? (
                      <ActivityIndicator
                        size="small"
                        color="#B91C1C"
                      />
                    ) : null}

                    <Text style={styles.cancelText}>
                      {cancellingClub
                        ? "Cancelling…"
                        : "Cancel request"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}

          <View style={styles.footer}>
            {refreshError || hasError ? (
              <View
                accessibilityRole="alert"
                style={styles.errorBox}
              >
                <Text style={styles.errorText}>
                  {refreshError ||
                    "We couldn't refresh your requests. Please try again."}
                </Text>
              </View>
            ) : !noRequests && message ? (
              <View
                accessibilityLiveRegion="polite"
                style={styles.feedback}
              >
                <Text style={styles.feedbackText}>
                  {message}
                </Text>
              </View>
            ) : null}

            {noRequests ? (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={() =>
                  router.replace(
                    hasTeam ? "/dashboard" : "/clubs"
                  )
                }
                style={[
                  styles.button,
                  busy && styles.dimmed,
                ]}
              >
                <Text style={styles.buttonText}>
                  {hasTeam
                    ? "Back to dashboard"
                    : "Find a club"}
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: busy,
                    busy: checking,
                  }}
                  disabled={busy}
                  onPress={() => {
                    void checkStatus();
                  }}
                  style={[
                    styles.button,
                    busy && styles.dimmed,
                  ]}
                >
                  {checking ? (
                    <ActivityIndicator
                      size="small"
                      color="white"
                    />
                  ) : null}

                  <Text style={styles.buttonText}>
                    {checking
                      ? "Checking…"
                      : "Check status"}
                  </Text>
                </Pressable>

                <Text style={styles.footerText}>
                  {hasTeam
                    ? "Approved teams will appear in your team switcher."
                    : "Once approved, you can continue to your dashboard."}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  accessibilityState={{
                    disabled: busy,
                    busy: loggingOut,
                  }}
                  onPress={() => {
                    if (hasTeam) {
                      router.replace("/dashboard");
                    } else {
                      void handleLogout();
                    }
                  }}
                  style={styles.textButton}
                >
                  <Text style={styles.link}>
                    {hasTeam
                      ? "Back to dashboard"
                      : loggingOut
                        ? "Logging out…"
                        : "Log out"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  topBar: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  topTitle: {
    color: "#07192D",
    fontSize: 17,
    fontWeight: "700",
  },
  back: {
    position: "absolute",
    left: 0,
    height: 32,
    width: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  introduction: {
    marginTop: 24,
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1.7,
    textAlign: "center",
    color: "#07192D",
  },
  description: {
    marginTop: 8,
    maxWidth: 320,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#596B80",
  },
  request: {
    marginTop: 28,
  },
  clubSection: {
    alignItems: "center",
  },
  clubName: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#07192D",
    textAlign: "center",
  },
  location: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  locationText: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#596B80",
    textAlign: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 12,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#FFFBEB",
  },
  badgeText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "600",
  },
  teamCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "white",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  teamIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E4F5EB",
    justifyContent: "center",
    alignItems: "center",
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  teamName: {
    color: "#07192D",
    fontSize: 15,
    fontWeight: "700",
  },
  teamDetails: {
    color: "#596B80",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  cancelButton: {
    marginTop: 12,
    minHeight: 44,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  clubCancelButton: {
    marginTop: 12,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 40,
  },
  button: {
    minHeight: 50,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: GREEN,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dimmed: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  footerText: {
    marginTop: 10,
    color: "#596B80",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  textButton: {
    minHeight: 48,
    marginTop: 10,
    paddingHorizontal: 16,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  link: {
    color: "#596B80",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  feedback: {
    marginBottom: 16,
    backgroundColor: "#E4F5EB",
    padding: 14,
    borderRadius: 12,
  },
  feedbackText: {
    color: "#07192D",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
  },
  errorBox: {
    marginBottom: 16,
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
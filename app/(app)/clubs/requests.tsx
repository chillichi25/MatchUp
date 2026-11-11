import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Check,
  ChevronLeft,
  ClipboardList,
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

import {
  useCanManageClub,
  useMyClub,
  usePendingTeamJoinRequests,
} from "@/features/clubs/hooks/use-club-queries";
import {
  approveTeamJoinRequest,
  declineTeamJoinRequest,
} from "@/features/clubs/services/club.service";
import type { PendingTeamJoinRequest } from "@/features/clubs/types";

const GREEN = "#009E45";
const NAVY = "#07192D";

type RequestAction = "approve" | "decline";

type ProcessRequestInput = {
  action: RequestAction;
  membershipId: string;
};

function getCoachName(request: PendingTeamJoinRequest) {
  return (
    [request.first_name, request.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || "Coach"
  );
}

export default function ClubRequestsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const myClub = useMyClub();
  const clubId = myClub.data?.club_id ?? "";

  const permission = useCanManageClub(clubId);
  const canManage = permission.data === true;

  const requestsQuery = usePendingTeamJoinRequests(
    canManage ? clubId : ""
  );

  const requests = requestsQuery.data ?? [];

  const submittingRef = useRef(false);
  const confirmationRef = useRef(false);

  const [feedback, setFeedback] = useState("");

  const processRequest = useMutation({
    mutationFn: async ({
      action,
      membershipId,
    }: ProcessRequestInput) => {
      if (action === "approve") {
        return approveTeamJoinRequest(membershipId);
      }

      return declineTeamJoinRequest(membershipId);
    },

    onSuccess: async (_, input) => {
      setFeedback(
        input.action === "approve"
          ? "Request approved. The coach can now access the team."
          : "Request declined."
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["club", clubId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ]);
    },

    onError: (_, input) => {
      Alert.alert(
        input.action === "approve"
          ? "Couldn't approve request"
          : "Couldn't decline request",
        "Please refresh the list and try again."
      );
    },

    onSettled: () => {
      submittingRef.current = false;
    },
  });

  const busy = processRequest.isPending;

  function goBack() {
    if (submittingRef.current) return;

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/dashboard");
    }
  }

  function confirmAction(
    request: PendingTeamJoinRequest,
    action: RequestAction
  ) {
    if (
      submittingRef.current ||
      confirmationRef.current ||
      busy
    ) {
      return;
    }

    confirmationRef.current = true;

    const name = getCoachName(request);
    const approving = action === "approve";

    Alert.alert(
      approving ? "Approve request?" : "Decline request?",
      approving
        ? `Allow ${name} to join ${request.team_name}?`
        : `Decline ${name}'s request to join ${request.team_name}? They won't be added to this team.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            confirmationRef.current = false;
          },
        },
        {
          text: approving ? "Approve" : "Decline",
          style: approving ? "default" : "destructive",
          onPress: () => {
            confirmationRef.current = false;

            if (submittingRef.current) return;

            submittingRef.current = true;
            setFeedback("");

            processRequest.mutate({
              action,
              membershipId: request.membership_id,
            });
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

  const checkingAccess =
    myClub.isLoading ||
    (Boolean(clubId) && permission.isLoading);

  const accessError =
    myClub.isError || permission.isError;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={styles.screen}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={goBack}
            hitSlop={8}
            style={styles.back}
          >
            <ChevronLeft size={20} color={NAVY} />
          </Pressable>

          <Text style={styles.topTitle}>
            Join requests
          </Text>
        </View>

        <View style={styles.introduction}>
          <Text
            accessibilityRole="header"
            style={styles.heading}
          >
            Team join requests
          </Text>

          <Text style={styles.description}>
            {myClub.data?.club.name
              ? `Review coaches requesting to join teams at ${myClub.data.club.name}.`
              : "Review requests to join your club's teams."}
          </Text>
        </View>

        {checkingAccess ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="small"
              color={GREEN}
              accessibilityLabel="Checking club access"
            />
          </View>
        ) : accessError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              We couldn't check your club-management access.
            </Text>

            <Pressable
              accessibilityRole="button"
              style={styles.textButton}
              onPress={() => {
                if (myClub.isError) {
                  void myClub.refetch();
                } else {
                  void permission.refetch();
                }
              }}
            >
              <Text style={styles.greenText}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : !canManage ? (
          <View style={styles.accessCard}>
            <Text style={styles.emptyTitle}>
              Club-management access required
            </Text>

            <Text style={styles.emptyDescription}>
              Only an approved owner or admin of the current
              club can review these requests.
            </Text>

            <Text style={styles.emptyDescription}>
              If you manage another club, select one of its
              teams from the dashboard first.
            </Text>
          </View>
        ) : (
          <>
            {feedback ? (
              <View
                accessibilityLiveRegion="polite"
                style={styles.feedback}
              >
                <Check size={18} color={GREEN} />

                <Text style={styles.feedbackText}>
                  {feedback}
                </Text>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Awaiting approval
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh join requests"
                accessibilityState={{
                  disabled: requestsQuery.isFetching || busy,
                  busy: requestsQuery.isFetching,
                }}
                disabled={requestsQuery.isFetching || busy}
                onPress={() => {
                  setFeedback("");
                  void requestsQuery.refetch();
                }}
                style={styles.textButton}
              >
                {requestsQuery.isFetching ? (
                  <ActivityIndicator
                    size="small"
                    color={GREEN}
                  />
                ) : (
                  <Text style={styles.greenText}>
                    Refresh
                  </Text>
                )}
              </Pressable>
            </View>

            {requestsQuery.isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator
                  size="small"
                  color={GREEN}
                  accessibilityLabel="Loading join requests"
                />
              </View>
            ) : null}

            {requestsQuery.isError ? (
              <View
                accessibilityRole="alert"
                style={styles.errorBox}
              >
                <Text style={styles.errorText}>
                  We couldn't refresh the requests. Tap
                  Refresh to try again.
                </Text>
              </View>
            ) : null}

            {!requestsQuery.isLoading &&
            !requestsQuery.isError &&
            requests.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <ClipboardList
                    size={23}
                    color={GREEN}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  You're all caught up
                </Text>

                <Text style={styles.emptyDescription}>
                  New requests to join your teams will appear
                  here.
                </Text>
              </View>
            ) : null}

            <View style={styles.requests}>
              {requests.map((request) => {
                const name = getCoachName(request);

                const details = [
                  request.age_group,
                  request.gender,
                  request.match_format,
                ]
                  .filter(Boolean)
                  .join(" · ");

                const processingThis =
                  busy &&
                  processRequest.variables?.membershipId ===
                    request.membership_id;

                const approvingThis =
                  processingThis &&
                  processRequest.variables?.action ===
                    "approve";

                const decliningThis =
                  processingThis &&
                  processRequest.variables?.action ===
                    "decline";

                return (
                  <View
                    key={request.membership_id}
                    style={styles.requestCard}
                  >
                    <Text style={styles.coachName}>
                      {name}
                    </Text>

                    <Text style={styles.requestLabel}>
                      Requested to join
                    </Text>

                    <View style={styles.teamRow}>
                      <View style={styles.teamIcon}>
                        <Shirt
                          size={19}
                          color={GREEN}
                        />
                      </View>

                      <View style={styles.flex}>
                        <Text style={styles.teamName}>
                          {request.team_name}
                        </Text>

                        {details ? (
                          <Text style={styles.teamDetails}>
                            {details}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.actions}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Decline ${name}'s request to join ${request.team_name}`}
                        accessibilityState={{
                          disabled: busy,
                          busy: decliningThis,
                        }}
                        disabled={busy}
                        onPress={() =>
                          confirmAction(request, "decline")
                        }
                        style={[
                          styles.actionButton,
                          styles.declineButton,
                          busy && styles.disabled,
                        ]}
                      >
                        {decliningThis ? (
                          <ActivityIndicator
                            size="small"
                            color="#B91C1C"
                          />
                        ) : null}

                        <Text style={styles.declineText}>
                          {decliningThis
                            ? "Declining…"
                            : "Decline"}
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Approve ${name} to join ${request.team_name}`}
                        accessibilityState={{
                          disabled: busy,
                          busy: approvingThis,
                        }}
                        disabled={busy}
                        onPress={() =>
                          confirmAction(request, "approve")
                        }
                        style={[
                          styles.actionButton,
                          styles.approveButton,
                          busy && styles.disabled,
                        ]}
                      >
                        {approvingThis ? (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                          />
                        ) : null}

                        <Text style={styles.approveText}>
                          {approvingThis
                            ? "Approving…"
                            : "Approve"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  topBar: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    position: "absolute",
    left: 0,
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  topTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: NAVY,
  },
  introduction: {
    marginTop: 24,
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1.7,
    color: NAVY,
    textAlign: "center",
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#596B80",
    textAlign: "center",
  },
  loading: {
    paddingVertical: 40,
    alignItems: "center",
  },
  sectionHeader: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  textButton: {
    minHeight: 48,
    minWidth: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  greenText: {
    fontSize: 14,
    fontWeight: "600",
    color: GREEN,
  },
  feedback: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#E4F5EB",
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    color: NAVY,
  },
  errorBox: {
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: "#B91C1C",
  },
  accessCard: {
    marginTop: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  emptyCard: {
    marginTop: 12,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  emptyIcon: {
    height: 48,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#E4F5EB",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
    textAlign: "center",
  },
  emptyDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#596B80",
    textAlign: "center",
  },
  requests: {
    marginTop: 12,
    gap: 12,
  },
  requestCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  coachName: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  requestLabel: {
    marginTop: 4,
    fontSize: 13,
    color: "#596B80",
  },
  teamRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
  },
  teamIcon: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#E4F5EB",
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  teamName: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  teamDetails: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#596B80",
  },
  actions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  approveButton: {
    backgroundColor: GREEN,
  },
  declineButton: {
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFFFFF",
  },
  approveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  declineText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#B91C1C",
  },
  disabled: {
    opacity: 0.6,
  },
});
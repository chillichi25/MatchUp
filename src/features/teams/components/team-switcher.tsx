import { useRouter } from "expo-router";
import {
  Check,
  ChevronsUpDown,
  ChevronRight,
  Clock3,
  Plus,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/ui/avatar";
import { useMyJoinRequests } from "@/features/clubs/hooks/use-my-join-requests";

import {
  useActiveTeam,
  useAvailableTeams,
  useSetActiveTeam,
} from "../hooks/use-teams";

const GREEN = "#009E45";

export function TeamSwitcher() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [open, setOpen] = useState(false);
  const [switchingId, setSwitchingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  const switchingRef = useRef(false);

  const activeQuery = useActiveTeam();
  const teamsQuery = useAvailableTeams();
  const requestsQuery = useMyJoinRequests();
  const setActiveTeam = useSetActiveTeam();

  const activeTeam = activeQuery.data;
  const teams = teamsQuery.data ?? [];

  const pendingCount = (
    requestsQuery.data ?? []
  ).reduce(
    (count, request) =>
      count + Math.max(request.teams.length, 1),
    0
  );

  const busy =
    switchingId !== null || setActiveTeam.isPending;

  function close() {
    if (switchingRef.current) return;

    setOpen(false);
    setError("");
  }

  async function selectTeam(teamId: string) {
    if (switchingRef.current) return;

    if (teamId === activeTeam?.id) {
      close();
      return;
    }

    switchingRef.current = true;
    setSwitchingId(teamId);
    setError("");

    try {
      await setActiveTeam.mutateAsync(teamId);

      setOpen(false);
      router.replace("/dashboard");
    } catch {
      setError(
        "We couldn't switch teams. Please try again."
      );
    } finally {
      switchingRef.current = false;
      setSwitchingId(null);
    }
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Switch team"
        accessibilityState={{ expanded: open }}
        onPress={() => {
          setOpen(true);
          void teamsQuery.refetch();
          void requestsQuery.refetch();
        }}
        style={styles.trigger}
      >
        {activeQuery.isLoading ? (
          <ActivityIndicator color={GREEN} />
        ) : (
          <Avatar
            uri={
              activeTeam?.clubs?.badge_url ?? null
            }
            name={
              activeTeam?.clubs?.name ??
              activeTeam?.name ??
              "Team"
            }
            size={44}
          />
        )}

        <View style={styles.flex}>
          <Text style={styles.teamName}>
            {activeTeam?.name ?? "Select a team"}
          </Text>

          <Text style={styles.subtitle}>
            {activeTeam?.clubs?.name ??
              "View your teams and requests"}
          </Text>
        </View>

        <ChevronsUpDown
          size={18}
          color="#7B8798"
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <View style={styles.modal}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close team selection"
            onPress={close}
            disabled={busy}
            style={styles.backdrop}
          />

          <View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(
                  insets.bottom,
                  16
                ),
              },
            ]}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text
                accessibilityRole="header"
                style={styles.title}
              >
                Your teams
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={close}
                disabled={busy}
                style={styles.close}
                accessibilityState={{
                  disabled: busy,
                }}
              >
                <Text style={styles.greenText}>
                  Close
                </Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >
              {teamsQuery.isLoading ? (
                <ActivityIndicator color={GREEN} />
              ) : null}

              {teamsQuery.isError ? (
                <View style={styles.notice}>
                  <Text style={styles.errorText}>
                    We couldn't refresh your teams.
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    style={styles.close}
                    onPress={() => {
                      void teamsQuery.refetch();
                    }}
                  >
                    <Text style={styles.greenText}>
                      Try again
                    </Text>
                  </Pressable>
                </View>
              ) : !teamsQuery.isLoading &&
                teams.length === 0 ? (
                <Text style={styles.empty}>
                  No approved teams yet.
                </Text>
              ) : null}

              {teams.map((team) => {
                const selected =
                  team.id === activeTeam?.id;

                return (
                  <Pressable
                    key={team.id}
                    accessibilityRole="radio"
                    accessibilityState={{
                      checked: selected,
                      disabled: busy,
                      busy: switchingId === team.id,
                    }}
                    disabled={busy}
                    onPress={() => {
                      void selectTeam(team.id);
                    }}
                    style={[
                      styles.row,
                      selected && styles.selected,
                    ]}
                  >
                    <Avatar
                      uri={
                        team.clubs?.badge_url ??
                        null
                      }
                      name={
                        team.clubs?.name ??
                        team.name
                      }
                      size={44}
                    />

                    <View style={styles.flex}>
                      <Text style={styles.teamName}>
                        {team.name}
                      </Text>

                      <Text style={styles.subtitle}>
                        {team.clubs?.name}
                      </Text>
                    </View>

                    {switchingId === team.id ? (
                      <ActivityIndicator
                        color={GREEN}
                      />
                    ) : selected ? (
                      <View style={styles.check}>
                        <Check
                          size={15}
                          color="white"
                          strokeWidth={2.5}
                        />
                      </View>
                    ) : (
                      <View style={styles.radio} />
                    )}
                  </Pressable>
                );
              })}

              {error ? (
                <Text
                  accessibilityRole="alert"
                  style={styles.errorText}
                >
                  {error}
                </Text>
              ) : null}

              <View style={styles.separator} />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`View pending requests${
                  pendingCount
                    ? `, ${pendingCount} pending`
                    : ""
                }`}
                disabled={busy}
                onPress={() => {
                  close();
                  router.push("/clubs/pending");
                }}
                style={styles.row}
              >
                <View
                  style={[
                    styles.icon,
                    styles.amber,
                  ]}
                >
                  <Clock3
                    size={21}
                    color="#B45309"
                  />
                </View>

                <View style={styles.flex}>
                  <Text style={styles.teamName}>
                    Pending requests
                  </Text>

                  <Text style={styles.subtitle}>
                    {requestsQuery.isError
                      ? "Open to check your requests"
                      : requestsQuery.isLoading
                        ? "Loading requests…"
                        : pendingCount
                          ? `${pendingCount} awaiting approval`
                          : "View your request status"}
                  </Text>
                </View>

                <ChevronRight
                  size={18}
                  color="#7B8798"
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  close();

                  router.push({
                    pathname: "/clubs",
                    params: { mode: "add" },
                  });
                }}
                style={styles.row}
              >
                <View style={styles.icon}>
                  <Plus
                    size={21}
                    color={GREEN}
                  />
                </View>

                <Text
                  style={[
                    styles.greenText,
                    styles.flex,
                  ]}
                >
                  Join or create a club
                </Text>

                <ChevronRight
                  size={18}
                  color="#7B8798"
                />
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
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
  subtitle: {
    marginTop: 4,
    color: "#596B80",
    fontSize: 13,
    lineHeight: 18,
  },
  modal: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(7,25,45,0.36)",
  },
  sheet: {
    maxHeight: "75%",
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginTop: 8,
  },
  title: {
    color: "#07192D",
    fontSize: 18,
    fontWeight: "700",
  },
  close: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  greenText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  row: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
  },
  selected: {
    backgroundColor: "#EDF8F1",
  },
  check: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  radio: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
    marginVertical: 12,
  },
  icon: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "#E4F5EB",
    alignItems: "center",
    justifyContent: "center",
  },
  amber: {
    backgroundColor: "#FFFBEB",
  },
  notice: {
    padding: 12,
    alignItems: "center",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    padding: 8,
  },
  empty: {
    color: "#596B80",
    fontSize: 14,
    padding: 16,
  },
});
import { Image } from "expo-image";
import {
  Redirect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldPlus,
} from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { signOut } from "@/features/auth/services/auth.service";
import {
  useMyApprovedClubMembership,
  usePendingClubRequest,
} from "@/features/clubs/hooks/use-club-queries";
import { useActiveTeam } from "@/features/teams/hooks/use-teams";

export default function ClubsLandingScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{
    mode?: string | string[];
  }>();

  const isAddingClub = Array.isArray(mode)
    ? mode.includes("add")
    : mode === "add";

  const loggingOut = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const {
    data: activeTeam,
    isLoading: loadingActiveTeam,
  } = useActiveTeam();

  const {
    data: approved,
    isLoading: loadingApproved,
  } = useMyApprovedClubMembership();

  const {
    data: pending,
    isLoading: loadingPending,
  } = usePendingClubRequest();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/dashboard");
    }
  }

  async function handleLogout() {
    if (loggingOut.current) return;

    loggingOut.current = true;
    setIsLoggingOut(true);

    try {
      const { error } = await signOut();

      if (error) throw error;

      router.replace("/login");
    } catch {
      Alert.alert(
        "Couldn't log out",
        "Please check your connection and try again."
      );
    } finally {
      loggingOut.current = false;
      setIsLoggingOut(false);
    }
  }

  if (
    !isAddingClub &&
    (loadingActiveTeam || loadingApproved || loadingPending)
  ) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F8FAFC",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator
          size="small"
          color="#009E45"
          accessibilityLabel="Loading your club"
        />
      </View>
    );
  }

  if (!isAddingClub) {
    if (activeTeam) return <Redirect href="/dashboard" />;
    if (approved) return <Redirect href="/dashboard" />;
    if (pending) return <Redirect href="/clubs/pending" />;
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
            paddingTop: isAddingClub ? 16 : 40,
            paddingBottom: 24,
          }}
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
            {isAddingClub ? (
              <View
                style={{
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "#07192D",
                    fontSize: 17,
                    fontWeight: "700",
                  }}
                >
                  Club options
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back to dashboard"
                  onPress={handleBack}
                  style={{
                    position: "absolute",
                    left: -8,
                    top: 0,
                    width: 48,
                    height: 48,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      backgroundColor: "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ChevronLeft
                      size={20}
                      color="#07192D"
                      strokeWidth={2}
                    />
                  </View>
                </Pressable>
              </View>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Image
                  source={require("@/assets/images/matchup-logo.png")}
                  style={{ width: 155, height: 100 }}
                  contentFit="contain"
                  accessibilityLabel="MatchUp"
                />
              </View>
            )}

            <View
              style={{
                marginTop: isAddingClub ? 24 : 32,
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
                Find your club
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  color: "#596B80",
                  fontSize: 15,
                  lineHeight: 22,
                  textAlign: "center",
                }}
              >
                Join your club or add it to MatchUp.
              </Text>
            </View>

            <View style={{ marginTop: 32, gap: 12 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Join a club"
                accessibilityHint="Find your club and request to join"
                accessibilityState={{ disabled: isLoggingOut }}
                disabled={isLoggingOut}
                onPress={() => router.push("/clubs/join")}
                className="flex-row items-center rounded-2xl border border-[#CBD5E1] bg-white p-4 active:bg-[#EFF8F2]"
              >
                <View
                  className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E4F5EB]"
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Search
                    size={22}
                    color="#009E45"
                    strokeWidth={1.8}
                  />
                </View>

                <View className="ml-4 min-w-0 flex-1">
                  <Text className="text-[16px] font-bold text-[#07192D]">
                    Join a club
                  </Text>

                  <Text className="mt-1 text-[14px] leading-5 text-[#596B80]">
                    Find your club and request to join.
                  </Text>
                </View>

                <ChevronRight
                  size={20}
                  color="#7B8798"
                  strokeWidth={1.8}
                  style={{ marginLeft: 8 }}
                />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add your club"
                accessibilityHint="Set up a club you manage"
                accessibilityState={{ disabled: isLoggingOut }}
                disabled={isLoggingOut}
                onPress={() => router.push("/clubs/create")}
                className="flex-row items-center rounded-2xl border border-[#CBD5E1] bg-white p-4 active:bg-[#EFF8F2]"
              >
                <View
                  className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E4F5EB]"
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <ShieldPlus
                    size={22}
                    color="#009E45"
                    strokeWidth={1.8}
                  />
                </View>

                <View className="ml-4 min-w-0 flex-1">
                  <Text className="text-[16px] font-bold text-[#07192D]">
                    Add your club
                  </Text>

                  <Text className="mt-1 text-[14px] leading-5 text-[#596B80]">
                    Set up a club you manage.
                  </Text>
                </View>

                <ChevronRight
                  size={20}
                  color="#7B8798"
                  strokeWidth={1.8}
                  style={{ marginLeft: 8 }}
                />
              </Pressable>
            </View>

            {!isAddingClub ? (
              <View
                style={{
                  marginTop: "auto",
                  paddingTop: 40,
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={() => {
                    void handleLogout();
                  }}
                  disabled={isLoggingOut}
                  accessibilityRole="button"
                  accessibilityLabel="Log out"
                  accessibilityState={{
                    disabled: isLoggingOut,
                    busy: isLoggingOut,
                  }}
                  className="min-h-[48px] flex-row items-center justify-center px-6 active:opacity-70"
                >
                  {isLoggingOut ? (
                    <ActivityIndicator
                      size="small"
                      color="#596B80"
                      style={{ marginRight: 8 }}
                    />
                  ) : null}

                  <Text className="text-[14px] font-semibold text-[#596B80] underline">
                    {isLoggingOut ? "Logging out…" : "Log out"}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
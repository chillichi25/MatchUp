import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NAVY = "#07192D";
const GREEN = "#009E45";
const MUTED = "#596B80";

export default function ClubSetupCompleteScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.topBar}>
              <Text style={styles.topBarTitle}>
                Setup complete
              </Text>
            </View>

            <View style={styles.successSection}>
              <View
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={styles.checkOuter}
              >
                <View style={styles.checkInner}>
                  <Check
                    size={30}
                    color={GREEN}
                    strokeWidth={2.5}
                  />
                </View>
              </View>

              <Text
                accessibilityRole="header"
                style={styles.heading}
              >
                Your club is ready!
              </Text>

              <Text style={styles.description}>
                Your club and team are set up.{"\n"}
                Time to find your next match.
              </Text>
            </View>

            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace("/dashboard")}
                className="min-h-[50px] w-full items-center justify-center rounded-full bg-[#009E45] px-6 py-3 active:opacity-80"
              >
                <Text style={styles.buttonText}>
                  Go to dashboard
                </Text>
              </Pressable>
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
    backgroundColor: "#F8FAFC",
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
  successSection: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  checkOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E4F5EB",
  },
  checkInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#BFE8CF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    marginTop: 28,
    color: NAVY,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1.7,
    textAlign: "center",
  },
  description: {
    maxWidth: 310,
    marginTop: 8,
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  footer: {
    paddingTop: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
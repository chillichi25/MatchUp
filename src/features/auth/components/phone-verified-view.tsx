import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Prototype success screen only.
 * No phone number has actually been verified.
 * TODO: show this screen only after successful SMS verification.
 */
export function PhoneVerifiedView() {
  const router = useRouter();

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
            <View className="h-12 items-center justify-center">
              <Text className="text-[17px] font-bold text-[#07192D]">
                Verify phone
              </Text>
            </View>

            <View
              style={{
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 48,
              }}
            >
              <View
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 44,
                  backgroundColor: "#E4F5EB",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "#FFFFFF",
                    borderWidth: 1,
                    borderColor: "#C8EBD6",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check
                    size={32}
                    color="#009E45"
                    strokeWidth={2.5}
                  />
                </View>
              </View>

              <Text
                accessibilityRole="header"
                style={{
                  marginTop: 24,
                  color: "#07192D",
                  fontSize: 28,
                  fontWeight: "800",
                  letterSpacing: -1.7,
                  textAlign: "center",
                }}
              >
                Phone verified
              </Text>

              <Text
                style={{
                  marginTop: 6,
                  maxWidth: 300,
                  color: "#596B80",
                  fontSize: 15,
                  lineHeight: 22,
                  textAlign: "center",
                }}
              >
                You&apos;re all set. Let&apos;s find your club.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue"
              onPress={() => router.replace("/onboarding")}
              className="min-h-[50px] w-full items-center justify-center rounded-full bg-[#009E45] px-6 py-3 active:opacity-80"
            >
              <Text className="text-[16px] font-bold text-white">
                Continue
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
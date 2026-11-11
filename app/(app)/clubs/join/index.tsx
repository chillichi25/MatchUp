import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ClubSearchForm } from "@/features/clubs/components/club-search-form";

export default function JoinClubSearchScreen() {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/clubs");
    }
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
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 440,
              alignSelf: "center",
            }}
          >
            <View className="h-12 flex-row items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to club options"
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

              <Text
                className="flex-1 text-center text-[17px] font-bold text-[#07192D]"
              >
                Join a club
              </Text>

              <View style={{ width: 48 }} />
            </View>

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
                Find your club and send a request to join.
              </Text>
            </View>

            <ClubSearchForm />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
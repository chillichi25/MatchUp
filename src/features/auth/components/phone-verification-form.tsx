import { useRouter } from "expo-router";
import { Smartphone } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthTopBar } from "./auth-top-bar";

/**
 * Prototype only.
 * TODO: connect SMS sending and verification before enabling this flow.
 * The number is not saved and no verification code is sent.
 */
export function PhoneVerificationForm() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top", "bottom"]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
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
              <AuthTopBar
                title="Verify phone"
                backHref="/register"
              />

              <View
                style={{
                  marginTop: 40,
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
                  Verify your phone
                </Text>

                <Text
                  style={{
                    marginTop: 6,
                    color: "#596B80",
                    fontSize: 15,
                    lineHeight: 20,
                    textAlign: "center",
                  }}
                >
                  We&apos;ll text you a 6-digit code.
                </Text>
              </View>

              <View className="mt-9">
                <Text className="mb-1 text-[14px] font-semibold text-[#07192D]">
                  Mobile number
                </Text>

                <View
                  style={{
                    minHeight: 56,
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: focused
                      ? "#009E45"
                      : "#CBD5E1",
                    backgroundColor: "#FFFFFF",
                    paddingHorizontal: 16,
                  }}
                >
                  <Smartphone
                    size={20}
                    color="#7B8798"
                    strokeWidth={1.8}
                  />

                  <View
                    style={{
                      marginLeft: 12,
                      paddingRight: 12,
                      borderRightWidth: 1,
                      borderRightColor: "#E2E8F0",
                    }}
                  >
                    <Text
                      style={{
                        color: "#07192D",
                        fontSize: 16,
                      }}
                    >
                      +44
                    </Text>
                  </View>

                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    accessibilityLabel="UK mobile number"
                    keyboardType="phone-pad"
                    autoComplete="tel-national"
                    placeholder="Mobile number"
                    placeholderTextColor="#7B8798"
                    selectionColor="#009E45"
                    underlineColorAndroid="transparent"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      minHeight: 54,
                      marginLeft: 12,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: "#07192D",
                    }}
                  />
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.push("/register/phone/verify")
                  }
                  className="mt-5 min-h-[50px] w-full items-center justify-center rounded-full bg-[#009E45] px-6 py-3 active:opacity-80"
                >
                  <Text className="text-[16px] font-bold text-white">
                    Send code
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
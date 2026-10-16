import { useRouter } from "expo-router";
import { Smartphone } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthTopBar } from "./auth-top-bar";

/**
 * Phone verification is static UI for the MVP: the PRD keeps phone
 * verification out of scope, so the number is not submitted. The Send code
 * action only advances the flow.
 */
export function PhoneVerificationForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <View className="mx-auto w-full max-w-md flex-1 px-7 pb-6 pt-5">
            <AuthTopBar title="Verify phone" backHref="/register" />

            <View className="mt-5 items-center">
              <Text className="text-[28px] font-bold tracking-tight text-slate-900">
                Verify your phone
              </Text>

              <Text className="mt-2 text-[15px] text-slate-400">
                We&apos;ll send you a 6-digit verification code.
              </Text>
            </View>

            <View className="mt-8">
              <Text className="mb-2 text-sm font-medium text-slate-800">
                Mobile number
              </Text>

              <View className="h-14 flex-row items-center rounded-xl border border-gray-200 bg-white px-4">
                <Smartphone size={19} color="#94A3B8" strokeWidth={1.8} />

                <View className="ml-4 shrink-0 items-center border-r border-gray-200 pr-3">
                  <Text className="text-sm font-medium text-slate-700">
                    +44
                  </Text>
                </View>

                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  placeholder="Mobile number"
                  placeholderTextColor="#94A3B8"
                  className="ml-3 h-full min-w-0 flex-1 text-sm text-slate-900"
                />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/register/phone/verify")}
                className="mt-5 h-12 w-full items-center justify-center rounded-full bg-[#00B83F]"
              >
                <Text className="text-sm font-semibold text-white">
                  Send code
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

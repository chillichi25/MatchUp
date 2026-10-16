import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthTopBar } from "@/features/auth/components/auth-top-bar";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { DecorativeWaves } from "@/features/auth/components/decorative-waves";

export default function ForgotPasswordScreen() {
  return (
    <View className="flex-1 overflow-hidden bg-[#F8FAFC]">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <ScrollView
          contentContainerClassName="flex-grow px-7 pb-10 pt-3"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthTopBar title="Reset password" backHref="/login" />

          <View className="mt-6 items-center">
            <Text className="text-[26px] font-bold tracking-tight text-slate-900">
              Forgot password?
            </Text>
          </View>

          <View className="mt-6">
            <ForgotPasswordForm />
          </View>
        </ScrollView>
      </SafeAreaView>

      <DecorativeWaves />
    </View>
  );
}

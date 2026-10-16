import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthTopBar } from "@/features/auth/components/auth-top-bar";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <ScrollView
          contentContainerClassName="flex-grow px-7 pb-10 pt-3"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthTopBar title="New password" backHref="/login" />

          <View className="mt-6 items-center">
            <Text className="text-[26px] font-bold tracking-tight text-slate-900">
              Set a new password
            </Text>
            <Text className="mt-2 max-w-[300px] text-center text-[14px] leading-5 text-slate-400">
              Choose a new password for your account.
            </Text>
          </View>

          <View className="mt-6">
            <ResetPasswordForm
              onSuccess={() => router.replace("/onboarding")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

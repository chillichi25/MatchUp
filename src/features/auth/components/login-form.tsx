import { useRouter } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { signIn } from "../services/auth.service";
import { AuthField, PasswordField } from "./auth-field";
import { AuthTopBar } from "./auth-top-bar";
import { DecorativeWaves } from "./decorative-waves";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin() {
    setErrorMessage("");
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    router.replace("/onboarding");
    setIsLoading(false);
  }

  return (
    <View className="flex-1 overflow-hidden bg-[#F8FAFC]">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="flex-grow px-7 pb-8 pt-5"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AuthTopBar title="Log in" backHref="/" />

            <View className="mt-3 items-center">
              <Text className="text-[28px] font-bold tracking-tight text-slate-900">
                Welcome back
              </Text>
              <Text className="mt-2 text-[15px] text-slate-400">
                Log in to continue to MatchUp
              </Text>
            </View>

            <View className="mt-7">
              <AuthField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                icon={<Mail size={19} color="#94A3B8" strokeWidth={1.8} />}
              />

              <PasswordField
                label="Password"
                containerClassName="mt-5"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                autoCapitalize="none"
                autoComplete="current-password"
                icon={
                  <LockKeyhole size={19} color="#94A3B8" strokeWidth={1.8} />
                }
              />

              {errorMessage ? (
                <View
                  accessibilityRole="alert"
                  className="mt-4 rounded-xl bg-red-50 px-4 py-3"
                >
                  <Text className="text-sm text-red-600">{errorMessage}</Text>
                </View>
              ) : null}

              <Button className="mt-6" loading={isLoading} onPress={handleLogin}>
                {isLoading ? "Logging in..." : "Log in"}
              </Button>

              <Pressable
                onPress={() => router.push("/forgot-password")}
                className="mt-5 items-center"
              >
                <Text className="text-sm font-semibold text-[#00B83F]">
                  Forgot password?
                </Text>
              </Pressable>

              <View className="mt-7 flex-row items-center gap-4">
                <View className="h-px flex-1 bg-gray-200" />
                <Text className="text-xs text-slate-400">or</Text>
                <View className="h-px flex-1 bg-gray-200" />
              </View>
            </View>

            <Text className="mt-6 text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Text
                onPress={() => router.push("/register")}
                className="font-semibold text-[#00B83F]"
              >
                Register
              </Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <DecorativeWaves />
    </View>
  );
}

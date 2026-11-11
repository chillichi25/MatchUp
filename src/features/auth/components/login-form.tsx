import { useRouter } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signIn } from "../services/auth.service";
import { AuthField, PasswordField } from "./auth-field";
import { AuthTopBar } from "./auth-top-bar";

export function LoginForm() {
  const router = useRouter();
  const submitting = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin() {
    if (submitting.current) return;

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    Keyboard.dismiss();
    submitting.current = true;
    setIsLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        setErrorMessage(
          error.message
            .toLowerCase()
            .includes("invalid login credentials")
            ? "Your email or password is incorrect. Please try again."
            : error.message
        );
        return;
      }

      router.replace("/onboarding");
    } catch {
      setErrorMessage(
        "We couldn't log you in. Please check your connection and try again."
      );
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 overflow-hidden bg-[#F8FAFC]">
      {/* Blue-to-white background */}
      <SafeAreaView
        style={{ flex: 1, zIndex: 1 }}
        edges={["top", "bottom"]}
        pointerEvents={isLoading ? "none" : "auto"}
        accessibilityElementsHidden={isLoading}
        importantForAccessibility={
          isLoading ? "no-hide-descendants" : "auto"
        }
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
              <AuthTopBar title="Log in" backHref="/" />

  <View style={{ marginTop: 24, alignItems: "center" }}>
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
    Ready to play?
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
  Let’s get the ball rolling.
</Text>
</View>

              <View className="mt-9">
                <AuthField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  icon={
  <Mail
    size={20}
    color="#7B8798"
    strokeWidth={1.8}
  />
}
                />

                <PasswordField
                  label="Password"
                  containerClassName="mt-3"
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  autoComplete="current-password"
                  returnKeyType="go"
                  onSubmitEditing={() => {
                    void handleLogin();
                  }}
                  icon={
  <LockKeyhole
    size={20}
    color="#7B8798"
    strokeWidth={1.8}
  />
}
                />

                <Pressable
                  onPress={() => router.push("/forgot-password")}
                  accessibilityRole="link"
                  className="-mt-2 min-h-[48px] self-end items-center justify-center px-1 active:opacity-70"
                >
                  <Text className="text-[14px] font-semibold text-[#007A35]">
                    Forgot password?
                  </Text>
                </Pressable>

                {errorMessage ? (
                  <View
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                    className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <Text className="text-[14px] leading-5 text-red-700">
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={() => {
                    void handleLogin();
                  }}
                  disabled={isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Log in"
                  accessibilityState={{
                    disabled: isLoading,
                    busy: isLoading,
                  }}
                  style={{
  width: "100%",
  alignSelf: "center",
}}
                  className="mt-5 min-h-[50px] items-center justify-center rounded-full bg-[#009E45] px-6 py-3 active:opacity-80"
                >
                  <Text className="text-[16px] font-bold text-white">
                    Log in
                  </Text>
                </Pressable>

                <View className="mt-5 flex-row flex-wrap items-center justify-center">
  <Text className="text-[13px] text-[#596B80]">
    Don&apos;t have an account?{" "}
  </Text>

  <Pressable
    onPress={() => router.push("/register")}
    accessibilityRole="link"
    className="min-h-[48px] items-center justify-center px-0.5 active:opacity-70"
  >
    <Text className="text-[13px] font-semibold text-[#008638] underline">
      Register
    </Text>
  </Pressable>
</View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Full-screen loading overlay */}
{isLoading ? (
  <View
    accessibilityViewIsModal
    accessible
    accessibilityRole="progressbar"
    accessibilityLabel="Logging in. Please wait."
    accessibilityState={{ busy: true }}
    accessibilityLiveRegion="polite"
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <ActivityIndicator
      size="large"
      color="#009E45"
    />

    <Text
      style={{
        marginTop: 20,
        fontSize: 17,
        fontWeight: "600",
        color: "#07192D",
        textAlign: "center",
      }}
    >
      Logging in…
    </Text>

    <Text
      style={{
        marginTop: 6,
        fontSize: 14,
        color: "#596B80",
        textAlign: "center",
      }}
    >
      Please wait
    </Text>
  </View>
) : null}
    </View>
  );
}
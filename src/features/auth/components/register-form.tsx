import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  registerSchema,
  type RegisterSchema,
} from "../schemas/register.schema";
import { signUp } from "../services/auth.service";
import { AuthField, PasswordField } from "./auth-field";
import { AuthTopBar } from "./auth-top-bar";

export function RegisterForm() {
  const router = useRouter();
  const submitting = useRef(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: RegisterSchema) {
    if (submitting.current) return;

    submitting.current = true;
    setLoading(true);
    setErrorMessage("");
    Keyboard.dismiss();

    try {
      const { error } = await signUp(
        data.firstName.trim(),
        data.lastName.trim(),
        data.email.trim(),
        data.password
      );

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push("/register/phone");
    } catch {
      setErrorMessage(
        "We couldn't create your account. Please check your connection and try again."
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  function submitForm() {
    if (submitting.current) return;

    setErrorMessage("");
    void handleSubmit(onSubmit)();
  }

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
              <AuthTopBar title="Register" backHref="/" />

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
                  Join MatchUp
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
                  Your next match starts here.
                </Text>
              </View>

              <View className="mt-6">
                <Controller
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <AuthField
                      ref={field.ref}
                      label="First name"
                      placeholder="First name"
                      placeholderTextColor="#7B8798"
                      autoComplete="given-name"
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!loading}
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.firstName?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <AuthField
                      ref={field.ref}
                      containerClassName="mt-3"
                      label="Last name"
                      placeholder="Last name"
                      placeholderTextColor="#7B8798"
                      autoComplete="family-name"
                      autoCapitalize="words"
                      autoCorrect={false}
                      editable={!loading}
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.lastName?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <AuthField
                      ref={field.ref}
                      containerClassName="mt-3"
                      label="Email"
                      placeholder="name@example.com"
                      placeholderTextColor="#7B8798"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      editable={!loading}
                      icon={
                        <Mail
                          size={20}
                          color="#7B8798"
                          strokeWidth={1.8}
                        />
                      }
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.email?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <PasswordField
                      containerClassName="mt-3"
                      label="Password"
                      placeholder="Create a password"
                      placeholderTextColor="#7B8798"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      returnKeyType="done"
                      onSubmitEditing={submitForm}
                      editable={!loading}
                      icon={
                        <LockKeyhole
                          size={20}
                          color="#7B8798"
                          strokeWidth={1.8}
                        />
                      }
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.password?.message}
                    />
                  )}
                />

                {!errors.password ? (
                  <Text className="mt-2 text-[12px] leading-[18px] text-[#596B80]">
                    Use at least 8 characters.
                  </Text>
                ) : null}

                {errorMessage ? (
                  <View
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <Text className="text-[14px] leading-5 text-red-700">
                      {errorMessage}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={submitForm}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Next"
                  accessibilityState={{
                    disabled: loading,
                    busy: loading,
                  }}
                  className="mt-5 min-h-[50px] flex-row items-center justify-center rounded-full bg-[#009E45] px-6 py-3 active:opacity-80"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                      style={{ marginRight: 10 }}
                    />
                  ) : null}

                  <Text className="text-[16px] font-bold text-white">
                    {loading ? "Creating account…" : "Next"}
                  </Text>
                </Pressable>
              </View>

              <View className="mt-3 flex-row flex-wrap items-center justify-center">
                <Text className="text-[13px] text-[#596B80]">
                  Already have an account?{" "}
                </Text>

                <Pressable
                  onPress={() => router.push("/login")}
                  disabled={loading}
                  accessibilityRole="link"
                  className="min-h-[48px] items-center justify-center px-0.5 active:opacity-70"
                >
                  <Text className="text-[13px] font-semibold text-[#008638] underline">
                    Log in
                  </Text>
                </Pressable>
              </View>

{/* TODO before launch: replace policy alerts with actual policy links. */}
              <Text className="mx-auto mt-1 max-w-xs text-center text-[12px] leading-[18px] text-[#596B80]">
  By creating an account, you agree to MatchUp&apos;s{" "}
  <Text
    accessibilityRole="link"
    onPress={() =>
      Alert.alert(
        "Terms and Conditions",
        "This page is coming soon."
      )
    }
    className="font-semibold text-[#008638] underline"
  >
    Terms and Conditions
  </Text>
  {" "}and{" "}
  <Text
    accessibilityRole="link"
    onPress={() =>
      Alert.alert(
        "Privacy Policy",
        "This page is coming soon."
      )
    }
    className="font-semibold text-[#008638] underline"
  >
    Privacy Policy
  </Text>
  .
</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
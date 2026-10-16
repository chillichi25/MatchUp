import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  registerSchema,
  type RegisterSchema,
} from "../schemas/register.schema";
import { signUp } from "../services/auth.service";
import { AuthField, PasswordField } from "./auth-field";
import { AuthTopBar } from "./auth-top-bar";

export function RegisterForm() {
  const router = useRouter();

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
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterSchema) {
    try {
      setLoading(true);
      setErrorMessage("");

      const { error } = await signUp(
        data.firstName,
        data.lastName,
        data.email,
        data.password
      );

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push("/register/phone");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="px-7 pb-6 pt-3"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AuthTopBar title="Register" backHref="/" />

            <View className="mt-3 items-center">
              <Text className="text-[26px] font-bold tracking-tight text-slate-900">
                Create your account
              </Text>
              <Text className="mt-1 text-[14px] text-slate-400">
                Get started and find your next match.
              </Text>
            </View>

            <View className="mt-4">
              <Controller
                control={control}
                name="firstName"
                render={({ field }) => (
                  <Input
                    label="First name"
                    placeholder="First name"
                    autoComplete="given-name"
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
                  <Input
                    containerClassName="mt-3"
                    label="Last name"
                    placeholder="Last name"
                    autoComplete="family-name"
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
                    containerClassName="mt-3"
                    label="Email"
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    icon={<Mail size={18} color="#94A3B8" strokeWidth={1.8} />}
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
                    autoCapitalize="none"
                    autoComplete="new-password"
                    icon={
                      <LockKeyhole
                        size={18}
                        color="#94A3B8"
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

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <PasswordField
                    containerClassName="mt-3"
                    label="Confirm password"
                    placeholder="Repeat your password"
                    autoCapitalize="none"
                    autoComplete="new-password"
                    icon={
                      <LockKeyhole
                        size={18}
                        color="#94A3B8"
                        strokeWidth={1.8}
                      />
                    }
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              {errorMessage ? (
                <View
                  accessibilityRole="alert"
                  className="mt-3 rounded-xl bg-red-50 px-4 py-2"
                >
                  <Text className="text-sm text-red-600">{errorMessage}</Text>
                </View>
              ) : null}

              <Button
                className="mt-4"
                loading={loading}
                onPress={() => {
                  void handleSubmit(onSubmit)();
                }}
              >
                {loading ? "Please wait..." : "Next"}
              </Button>
            </View>

            <Text className="mt-3 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Text
                onPress={() => router.push("/login")}
                className="font-semibold text-[#00B83F]"
              >
                Log in
              </Text>
            </Text>

            <Text className="mx-auto mt-2 max-w-xs text-center text-[11px] leading-[15px] text-slate-500">
              By creating an account, you agree to MatchUp&apos;s Terms and
              Privacy Policy.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

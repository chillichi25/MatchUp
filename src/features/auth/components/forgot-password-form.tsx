import { Mail } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "../services/auth.service";
import { AuthField } from "./auth-field";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    setErrorMessage("");
    setLoading(true);

    try {
      const { error } = await requestPasswordReset(email);

      if (error) {
        setErrorMessage(
          "We couldn't send the reset link. Please try again."
        );
        return;
      }

      // Always report success for known-shaped input so the screen does not
      // disclose whether an account exists for the address.
      setSent(true);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <View className="w-full items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <Mail size={30} color="#00B83F" strokeWidth={2} />
        </View>

        <Text className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Check your email
        </Text>

        <Text className="mt-3 max-w-[310px] text-center text-sm leading-6 text-slate-500">
          If an account exists for that address, we&apos;ve sent a link to reset
          your password.
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      <Text className="text-center text-sm leading-6 text-slate-500">
        Enter the email address linked to your account and we&apos;ll send you a
        link to reset your password.
      </Text>

      <View className="mt-6">
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

        {errorMessage ? (
          <View
            accessibilityRole="alert"
            className="mt-4 rounded-xl bg-red-50 px-4 py-3"
          >
            <Text className="text-sm text-red-600">{errorMessage}</Text>
          </View>
        ) : null}

        <Button className="mt-6" loading={loading} onPress={handleSubmit}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </View>
    </View>
  );
}

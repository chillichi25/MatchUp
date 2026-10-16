import { Mail } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "../services/auth.service";
import { AuthField } from "./auth-field";

export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await resendVerificationEmail(email);

      if (error) {
        if (error.message.toLowerCase().includes("rate limit")) {
          setErrorMessage(
            "Too many verification emails have been requested. Please wait a little while and try again."
          );
        } else {
          setErrorMessage(
            "We couldn't send the verification email. Please try again."
          );
        }

        return;
      }

      setMessage("Verification email sent. Please check your inbox.");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="mt-6 w-full">
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="coach@email.com"
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

      {message ? (
        <View
          accessibilityRole="status"
          className="mt-4 rounded-xl bg-green-50 px-4 py-3"
        >
          <Text className="text-sm text-green-700">{message}</Text>
        </View>
      ) : null}

      <Button className="mt-5" loading={loading} onPress={handleSubmit}>
        {loading ? "Sending..." : "Resend verification email"}
      </Button>
    </View>
  );
}

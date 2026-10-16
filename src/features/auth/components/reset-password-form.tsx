import { useState } from "react";
import { View, Text } from "react-native";

import { PasswordField } from "./auth-field";
import { Button } from "@/components/ui/button";
import { updatePassword } from "../services/auth.service";
import { resetPasswordSchema } from "../schemas/reset-password.schema";

type ResetFormProps = {
  onSuccess: () => void;
};

/**
 * Rendered after a password recovery link has established a session. The
 * update is rejected unless the recovery session is present, so this screen
 * must only be reached through the callback route.
 */
export function ResetPasswordForm({ onSuccess }: ResetFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit() {
    setErrorMessage("");
    setFieldErrors({});

    const parsed = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await updatePassword(parsed.data.password);

      if (error) {
        setErrorMessage(
          "We couldn't update your password. The reset link may have expired."
        );
        return;
      }

      onSuccess();
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="w-full">
      <PasswordField
        label="New password"
        placeholder="Create a new password"
        autoCapitalize="none"
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
        error={fieldErrors.password}
      />

      <PasswordField
        containerClassName="mt-5"
        label="Confirm new password"
        placeholder="Repeat your new password"
        autoCapitalize="none"
        autoComplete="new-password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={fieldErrors.confirmPassword}
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
        {loading ? "Updating..." : "Update password"}
      </Button>
    </View>
  );
}

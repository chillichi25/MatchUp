import { useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSendTournamentUpdate } from "../hooks/use-tournament-organiser";

type TournamentUpdateFormProps = {
  tournamentId: string;
  onSent: () => void;
};

export function TournamentUpdateForm({
  tournamentId,
  onSent,
}: TournamentUpdateFormProps) {
  const sendUpdate = useSendTournamentUpdate();

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit() {
    setErrorMessage("");

    if (!message.trim()) {
      setErrorMessage("Please enter a message.");
      return;
    }

    try {
      const result = await sendUpdate.mutateAsync({
        tournamentId,
        message: message.trim(),
      });

      toast.success(
        `Sent to ${result.recipients} ${
          result.recipients === 1 ? "team" : "teams"
        }`
      );
      setMessage("");
      onSent();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your update."
      );
    }
  }

  return (
    <View className="gap-4">
      <View>
        <Label>Message to participating teams</Label>
        <Input
          placeholder="Share a schedule change or important information"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
          maxLength={500}
          className="h-auto min-h-[128px] py-3"
          textAlignVertical="top"
        />
        <Text className="mt-1 text-right text-[11px] text-slate-400">
          {message.length}/500
        </Text>
      </View>

      {errorMessage ? (
        <View className="rounded-2xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-600">{errorMessage}</Text>
        </View>
      ) : null}

      <Button onPress={handleSubmit} loading={sendUpdate.isPending}>
        {sendUpdate.isPending ? "Sending..." : "Send Update"}
      </Button>
    </View>
  );
}

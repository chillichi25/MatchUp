import { Send } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useSendFriendlyRequest } from "../hooks/use-friendly-requests";

type FriendlyRequestFormProps = {
  friendlyId: string;
  requestingTeamId: string;
  onSent: () => void;
};

export function FriendlyRequestForm({
  friendlyId,
  requestingTeamId,
  onSent,
}: FriendlyRequestFormProps) {
  const sendRequest = useSendFriendlyRequest();
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    try {
      await sendRequest.mutateAsync({
        friendlyId,
        requestingTeamId,
        message,
      });

      onSent();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The match request could not be sent."
      );
    }
  }

  return (
    <View className="mt-6">
      <Label>Message (optional)</Label>

      <Input
        placeholder="Hi, we'd be interested in playing this match."
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
        className="h-auto min-h-[104px] py-3"
        textAlignVertical="top"
      />

      <View className="mt-6">
        <Button onPress={handleSubmit} loading={sendRequest.isPending}>
          <View className="flex-row items-center gap-2">
            <Send size={19} color="#FFFFFF" />
            <Text className="text-[15px] font-semibold text-white">
              {sendRequest.isPending ? "Sending Request..." : "Send Request"}
            </Text>
          </View>
        </Button>
      </View>

      <Text className="mt-3 text-center text-xs leading-5 text-slate-400">
        The other coach can accept or decline your request.
      </Text>
    </View>
  );
}

import { useRouter } from "expo-router";
import { CheckCircle2, Send } from "lucide-react-native";
import { useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { toast } from "sonner-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  useOutgoingRequests,
  useSendFriendlyRequest,
} from "../hooks/use-friendly-requests";

type FriendlyRequestFormProps = {
  friendlyId: string;
  requestingTeamId: string;
  onSent: () => void;
};

const GREEN = "#009E45";

export function FriendlyRequestForm({
  friendlyId,
  requestingTeamId,
  onSent,
}: FriendlyRequestFormProps) {
  const router = useRouter();
  const outgoingRequests = useOutgoingRequests();
  const sendRequest = useSendFriendlyRequest();
  const submittingRef = useRef(false);
  const [message, setMessage] = useState("");

  const existingRequest = outgoingRequests.data?.find(
    (request) =>
      request.friendlyId === friendlyId &&
      request.requester.teamId === requestingTeamId &&
      request.status === "pending"
  );

  async function handleSubmit() {
    if (submittingRef.current || outgoingRequests.isPending) return;

    if (existingRequest) {
      router.push(`/friendlies/requests/${existingRequest.id}` as never);
      return;
    }

    submittingRef.current = true;

    try {
      await sendRequest.mutateAsync({
        friendlyId,
        requestingTeamId,
        message: message.trim(),
      });

      onSent();
    } catch (error) {
      // Refresh in case a request was sent from another screen or device.
      const refreshed = await outgoingRequests.refetch();
      const pendingRequest = refreshed.data?.find(
        (request) =>
          request.friendlyId === friendlyId &&
          request.requester.teamId === requestingTeamId &&
          request.status === "pending"
      );

      if (pendingRequest) {
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "The match request could not be sent."
      );
    } finally {
      submittingRef.current = false;
    }
  }

  if (outgoingRequests.isPending) {
    return (
      <View className="mt-6 items-center py-5">
        <ActivityIndicator size="small" color={GREEN} />
        <Text className="mt-2 text-[13px] text-[#596B80]">
          Checking your request…
        </Text>
      </View>
    );
  }

  if (existingRequest) {
    return (
      <View className="mt-5">
        <View className="rounded-2xl border border-green-100 bg-green-50 p-4">
          <View className="flex-row items-center gap-2">
            <CheckCircle2 size={20} color={GREEN} strokeWidth={1.9} />

            <Text className="text-[15px] font-bold text-[#07192D]">
              Request sent
            </Text>
          </View>

          <Text className="mt-2 text-[14px] leading-5 text-[#596B80]">
            Your team has already requested this match. You’re waiting for
            the other coach to respond.
          </Text>
        </View>

        <Button
          className="mt-5 min-h-[50px] w-full rounded-full"
          style={{ backgroundColor: GREEN }}
          onPress={() =>
            router.push(
              `/friendlies/requests/${existingRequest.id}` as never
            )
          }
        >
          View request
        </Button>
      </View>
    );
  }

  return (
    <View className="mt-5">
      <Label>Message (optional)</Label>

      <Input
        accessibilityLabel="Message to the other coach, optional"
        placeholder="Introduce your team or ask the other coach a question…"
        value={message}
        onChangeText={setMessage}
        editable={!sendRequest.isPending}
        multiline
        numberOfLines={4}
        className="rounded-2xl border-[#CBD5E1] bg-white py-3"
        style={{
          height: 120,
          textAlignVertical: "top",
        }}
        textAlignVertical="top"
      />

      <Button
        accessibilityLabel="Send request"
        className="mt-5 min-h-[50px] w-full rounded-full"
        style={{ backgroundColor: GREEN }}
        onPress={handleSubmit}
        loading={sendRequest.isPending}
        disabled={sendRequest.isPending}
      >
        <View className="flex-row items-center justify-center gap-2">
          {!sendRequest.isPending ? (
            <Send size={18} color="#FFFFFF" strokeWidth={1.9} />
          ) : null}

          <Text className="text-[15px] font-semibold text-white">
            {sendRequest.isPending ? "Sending request…" : "Send request"}
          </Text>
        </View>
      </Button>

      <Text className="mt-3 text-center text-[12px] leading-[18px] text-[#596B80]">
        The other coach will review your request.
      </Text>
    </View>
  );
}
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { useFriendlyDetail } from "@/features/friendlies/hooks/use-friendlies";

export default function RequestSentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useFriendlyDetail(id);
  const opponentClub = detail.data?.clubName ?? "the other club";

  return (
    <Screen>
      <View className="flex-1 items-center justify-center px-5">
        <View className="w-full -translate-y-8 items-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <Check size={38} color="#00B83F" strokeWidth={2.5} />
          </View>

          <Text className="mt-7 text-3xl font-bold tracking-tight text-slate-900">
            Request sent!
          </Text>

          <Text className="mt-3 max-w-xs text-center text-sm leading-6 text-slate-500">
            Your match request has been sent to{" "}
            <Text className="font-semibold text-slate-700">{opponentClub}</Text>
            . We&apos;ll let you know when they respond.
          </Text>

          <View className="mt-9 w-full gap-3">
            <Button onPress={() => router.replace("/matches" as never)}>
              Back to Matches
            </Button>

            <Button
              variant="outline"
              onPress={() => router.replace("/dashboard" as never)}
            >
              Go to Home
            </Button>
          </View>
        </View>
      </View>
    </Screen>
  );
}

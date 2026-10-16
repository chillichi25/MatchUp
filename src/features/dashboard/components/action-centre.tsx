import { useRouter } from "expo-router";
import { ChevronRight, Clock3, Mail } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

function CountBadge({ value }: { value: number }) {
  if (value <= 0) {
    return null;
  }

  return (
    <View className="absolute -right-1 -top-1 h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-500 px-1">
      <Text className="text-[10px] font-bold leading-none text-white">
        {value > 9 ? "9+" : value}
      </Text>
    </View>
  );
}

function ActionRow({
  onPress,
  iconBackground,
  icon,
  title,
  description,
  count,
}: {
  onPress: () => void;
  iconBackground: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm"
    >
      <View
        className={`relative h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBackground}`}
      >
        {icon}
        <CountBadge value={count} />
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-bold leading-tight text-slate-950">
          {title}
        </Text>

        <Text className="mt-1 text-[11px] leading-[15px] text-slate-500">
          {description}
        </Text>
      </View>

      <ChevronRight size={18} color="#64748B" strokeWidth={2} />
    </Pressable>
  );
}

export function ActionCentre({
  pendingRequests,
  awaitingResponses,
}: {
  pendingRequests: number;
  awaitingResponses: number;
}) {
  const router = useRouter();

  if (pendingRequests === 0 && awaitingResponses === 0) {
    return null;
  }

  return (
    <View className="mt-8">
      <Text className="text-[18px] font-bold tracking-tight text-slate-950">
        Requests &amp; Updates
      </Text>

      <View className="mt-3 gap-3">
        <ActionRow
          onPress={() => router.push("/matches")}
          iconBackground="bg-green-50"
          icon={<Mail size={24} strokeWidth={2.2} color="#00B83F" />}
          title="Match Requests"
          description="Teams interested in playing"
          count={pendingRequests}
        />

        <ActionRow
          onPress={() => router.push("/matches")}
          iconBackground="bg-amber-50"
          icon={<Clock3 size={25} strokeWidth={2.2} color="#F59E0B" />}
          title="Awaiting Response"
          description="Requests you've sent"
          count={awaitingResponses}
        />
      </View>
    </View>
  );
}

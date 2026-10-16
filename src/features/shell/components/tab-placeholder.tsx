import { Text, View } from "react-native";

import { Screen } from "@/components/ui/screen";

export function TabPlaceholder({
  title,
  subtitle,
  phase,
}: {
  title: string;
  subtitle: string;
  phase: string;
}) {
  return (
    <Screen className="px-5 pt-4">
      <Text className="text-[22px] font-bold tracking-tight text-slate-900">
        {title}
      </Text>
      <Text className="mt-1 text-[13px] text-slate-500">{subtitle}</Text>

      <View className="mt-6 items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-14">
        <Text className="text-[14px] font-semibold text-slate-700">
          Screen converted in {phase}
        </Text>
        <Text className="mt-1 max-w-[260px] text-center text-[12px] leading-5 text-slate-500">
          Foundation shell is running. Full MatchUp behaviour lands in the
          following phase.
        </Text>
      </View>
    </Screen>
  );
}

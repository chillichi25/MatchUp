import { Text, View } from "react-native";

import { Screen } from "@/components/ui/screen";

export function AuthPlaceholderScreen({
  title,
  phase,
}: {
  title: string;
  phase: string;
}) {
  return (
    <Screen className="items-center justify-center px-6">
      <View className="items-center gap-2">
        <Text className="text-[22px] font-bold text-slate-900">{title}</Text>
        <Text className="text-[13px] text-slate-500">Converted in {phase}.</Text>
      </View>
    </Screen>
  );
}

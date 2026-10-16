import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View className="flex-1 items-center justify-center gap-4 bg-white px-6">
        <Text className="text-[18px] font-bold text-slate-900">
          This screen does not exist.
        </Text>
        <Link href="/" className="text-[15px] font-semibold text-[#00B83F]">
          Go to home
        </Link>
      </View>
    </>
  );
}

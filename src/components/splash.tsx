import { ActivityIndicator, View } from "react-native";

export function Splash() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="small" color="#009E45" />
    </View>
  );
}
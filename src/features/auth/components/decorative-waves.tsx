import { View } from "react-native";

export function DecorativeWaves() {
  return (
    <View
      pointerEvents="none"
      className="absolute bottom-0 left-0 h-[85px] w-full overflow-hidden"
    >
      <View className="absolute -bottom-[75px] -left-[80px] h-[145px] w-[330px] rotate-[7deg] rounded-[50%] bg-[#EAFBF0]" />
      <View className="absolute -bottom-[68px] -right-[90px] h-[145px] w-[340px] -rotate-[7deg] rounded-[50%] bg-[#E4F9EB]/80" />
    </View>
  );
}

import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type AuthTopBarProps = {
  title: string;
  backHref?: string;
  showBack?: boolean;
};

export function AuthTopBar({
  title,
  backHref = "/",
  showBack = true,
}: AuthTopBarProps) {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(backHref as never);
  }

  return (
    <View className="relative h-12 flex-row items-center justify-center">
      {showBack ? (
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          className="absolute left-0 h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white"
        >
          <ChevronLeft size={20} color="#07192D" strokeWidth={2} />
        </Pressable>
      ) : null}

      <Text className="text-[17px] font-bold text-[#07192D]">{title}</Text>
    </View>
  );
}

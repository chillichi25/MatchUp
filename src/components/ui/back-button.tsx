import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, Text } from "react-native";

import { cn } from "@/lib/utils";

type BackButtonProps = {
  label?: string;
  fallbackHref?: string;
  className?: string;
};

export function BackButton({
  label = "Back",
  fallbackHref,
  className,
}: BackButtonProps) {
  const router = useRouter();

  function handlePress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.replace(fallbackHref as never);
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      className={cn("flex-row items-center gap-1 py-2 pr-3", className)}
    >
      <ChevronLeft size={22} color="#0F172A" />
      <Text className="text-[15px] font-medium text-slate-900">{label}</Text>
    </Pressable>
  );
}

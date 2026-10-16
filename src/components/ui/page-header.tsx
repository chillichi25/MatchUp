import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type PageHeaderProps = {
  title: string;
  fallbackHref?: string;
  right?: React.ReactNode;
};

export function PageHeader({ title, fallbackHref, right }: PageHeaderProps) {
  const router = useRouter();

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.replace(fallbackHref as never);
    }
  }

  return (
    <View className="flex-row items-center px-4 pt-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={handleBack}
        className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
      >
        <ArrowLeft size={19} color="#334155" />
      </Pressable>

      <Text className="flex-1 text-center text-[17px] font-bold text-slate-950">
        {title}
      </Text>

      <View className="h-11 w-11 items-center justify-center">{right}</View>
    </View>
  );
}

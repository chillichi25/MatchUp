import { ActivityIndicator, Text, View } from "react-native";

import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <View
      className={cn("flex-1 items-center justify-center gap-3 py-16", className)}
    >
      <ActivityIndicator color="#00B83F" />
      <Text className="text-[13px] text-slate-500">{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={cn(
        "items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-12",
        className
      )}
    >
      {icon ? <View className="mb-3">{icon}</View> : null}
      <Text className="text-[15px] font-bold text-slate-900">{title}</Text>
      {description ? (
        <Text className="mt-1.5 max-w-[280px] text-center text-[13px] leading-5 text-slate-500">
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <View
      className={cn(
        "items-center justify-center rounded-3xl border border-red-100 bg-red-50 px-6 py-12",
        className
      )}
    >
      <Text className="text-[15px] font-bold text-red-700">{title}</Text>
      {description ? (
        <Text className="mt-1.5 max-w-[280px] text-center text-[13px] leading-5 text-red-600">
          {description}
        </Text>
      ) : null}
      {onRetry ? (
        <Text
          onPress={onRetry}
          accessibilityRole="button"
          className="mt-4 text-[13px] font-semibold text-red-700 underline"
        >
          Try again
        </Text>
      ) : null}
    </View>
  );
}

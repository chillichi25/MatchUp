import type { ReactNode } from "react";
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

type ScreenProps = ViewProps & {
  children: ReactNode;
  className?: string;
  edges?: ("top" | "right" | "bottom" | "left")[];
};

/**
 * Standard screen shell: page background, safe-area insets and the max-width
 * "phone column" used across the MatchUp layouts.
 */
export function Screen({
  children,
  className,
  edges = ["top", "bottom"],
  ...props
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-[#F8FAFC]">
      <View className={cn("flex-1", className)} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}

type ScreenScrollProps = ScrollViewProps & {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function ScreenScroll({
  children,
  className,
  contentClassName,
  ...props
}: ScreenScrollProps) {
  return (
    <ScrollView
      className={cn("flex-1 bg-[#F8FAFC]", className)}
      contentContainerClassName={cn("pb-24", contentClassName)}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

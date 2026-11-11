import type { ReactNode } from "react";
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

type ScreenEdge = "top" | "right" | "bottom" | "left";

type ScreenProps = ViewProps & {
  children: ReactNode;
  className?: string;
  edges?: ScreenEdge[];
};

export function Screen({
  children,
  className,
  edges = ["top", "bottom"],
  ...props
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
      <View
        className={cn("flex-1", className)}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

type ScreenScrollProps = ScrollViewProps & {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  edges?: ScreenEdge[];
};

export function ScreenScroll({
  children,
  className,
  contentClassName,
  edges = [],
  ...props
}: ScreenScrollProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
      <ScrollView
        className={cn(
          "flex-1 bg-[#F8FAFC]",
          className
        )}
        contentContainerClassName={cn(
          "pb-24",
          contentClassName
        )}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { cn } from "@/lib/utils";

type LabelProps = {
  children: ReactNode;
  className?: string;
  required?: boolean;
};

export function Label({ children, className, required }: LabelProps) {
  return (
    <View className="mb-1.5 flex-row items-center gap-0.5">
      <Text className={cn("text-[13px] font-medium text-slate-700", className)}>
        {children}
      </Text>
      {required ? <Text className="text-[13px] text-red-500">*</Text> : null}
    </View>
  );
}

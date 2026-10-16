import { forwardRef, type ComponentRef } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { cn } from "@/lib/utils";

type InputProps = TextInputProps & {
  className?: string;
  error?: string;
  label?: string;
  containerClassName?: string;
};

export const Input = forwardRef<ComponentRef<typeof TextInput>, InputProps>(function Input(
  { className, error, label, containerClassName, ...props },
  ref
) {
  return (
    <View className={cn("w-full", containerClassName)}>
      {label ? (
        <Text className="mb-1.5 text-[13px] font-medium text-slate-700">
          {label}
        </Text>
      ) : null}

      <TextInput
        ref={ref}
        placeholderTextColor="#94A3B8"
        className={cn(
          "h-12 w-full rounded-2xl border bg-white px-4 text-[15px] text-slate-900",
          error ? "border-red-400" : "border-slate-200",
          className
        )}
        {...props}
      />

      {error ? (
        <Text className="mt-1.5 text-[12px] text-red-600">{error}</Text>
      ) : null}
    </View>
  );
});

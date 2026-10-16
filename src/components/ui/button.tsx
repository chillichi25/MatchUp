import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

type ButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  textClassName?: string;
  loading?: boolean;
  fullWidth?: boolean;
};

const containerVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand border border-brand",
  secondary: "bg-[#F1F5F9] border border-[#F1F5F9]",
  outline: "bg-white border border-[#CBD5E1]",
  ghost: "bg-transparent border border-transparent",
  danger: "bg-red-600 border border-red-600",
};

const textVariants: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-slate-900",
  outline: "text-slate-900",
  ghost: "text-brand",
  danger: "text-white",
};

export function Button({
  children,
  variant = "primary",
  className,
  textClassName,
  loading = false,
  fullWidth = true,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5",
        fullWidth ? "w-full" : "self-start",
        containerVariants[variant],
        isDisabled && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#FFFFFF" : "#00B83F"}
        />
      ) : typeof children === "string" ? (
        <Text
          className={cn(
            "text-[15px] font-semibold",
            textVariants[variant],
            textClassName
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

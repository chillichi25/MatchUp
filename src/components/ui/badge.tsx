import type { ReactNode } from "react";
import { Text, View, type ViewProps } from "react-native";

import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

const toneStyles: Record<BadgeTone, { container: string; text: string }> = {
  neutral: { container: "bg-slate-100", text: "text-slate-600" },
  brand: { container: "bg-[#E4F9EB]", text: "text-[#009F37]" },
  success: { container: "bg-green-100", text: "text-green-700" },
  warning: { container: "bg-amber-100", text: "text-amber-700" },
  danger: { container: "bg-red-100", text: "text-red-700" },
  info: { container: "bg-blue-100", text: "text-blue-700" },
};

type BadgeProps = ViewProps & {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({
  children,
  tone = "neutral",
  className,
  ...props
}: BadgeProps) {
  const styles = toneStyles[tone];

  return (
    <View
      className={cn(
        "self-start rounded-full px-2.5 py-1",
        styles.container,
        className
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn("text-[11px] font-semibold", styles.text)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

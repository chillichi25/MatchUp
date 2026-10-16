import { forwardRef, useState, type ComponentRef, type ReactNode } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { cn } from "@/lib/utils";

type AuthFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightAccessory?: ReactNode;
  containerClassName?: string;
};

export const AuthField = forwardRef<
  ComponentRef<typeof TextInput>,
  AuthFieldProps
>(function AuthField(
  {
    label,
    error,
    icon,
    rightAccessory,
    containerClassName,
    className,
    ...props
  },
  ref
) {
  return (
    <View className={cn("w-full", containerClassName)}>
      {label ? (
        <Text className="mb-2 text-sm font-medium text-slate-800">{label}</Text>
      ) : null}

      <View
        className={cn(
          "h-14 flex-row items-center rounded-xl border bg-white px-4",
          error ? "border-red-400" : "border-gray-200"
        )}
      >
        {icon ? <View className="shrink-0">{icon}</View> : null}

        <TextInput
          ref={ref}
          placeholderTextColor="#94A3B8"
          className={cn("ml-4 h-full flex-1 text-sm text-slate-900", className)}
          {...props}
        />

        {rightAccessory}
      </View>

      {error ? (
        <Text className="mt-1.5 text-xs text-red-500">{error}</Text>
      ) : null}
    </View>
  );
});

type PasswordFieldProps = AuthFieldProps;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      {...props}
      secureTextEntry={!visible}
      rightAccessory={
        <Pressable
          onPress={() => setVisible((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          hitSlop={8}
          className="ml-3 h-9 w-9 shrink-0 items-center justify-center"
        >
          {visible ? (
            <EyeOff size={20} color="#94A3B8" strokeWidth={1.8} />
          ) : (
            <Eye size={20} color="#94A3B8" strokeWidth={1.8} />
          )}
        </Pressable>
      }
    />
  );
}

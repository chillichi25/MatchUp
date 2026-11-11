import {
  forwardRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from "react";
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
    style,
    onFocus,
    onBlur,
    editable = true,
    accessibilityLabel,
    placeholderTextColor = "#64748B",
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn("w-full", containerClassName)}>
      {label ? (
        <Text className="mb-1 text-[14px] font-semibold text-[#07192D]">
          {label}
        </Text>
      ) : null}

      <View
        className={cn(
          "min-h-[56px] flex-row items-center rounded-xl border bg-white pl-4 pr-1",
          error
            ? "border-red-500"
            : focused
              ? "border-[#009E45]"
              : "border-[#CBD5E1]"
        )}
        style={{ opacity: editable ? 1 : 0.6 }}
      >
        {icon ? (
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            className="shrink-0"
          >
            {icon}
          </View>
        ) : null}

        <TextInput
          {...props}
          ref={ref}
          editable={editable}
          accessibilityLabel={accessibilityLabel ?? label}
          placeholderTextColor="#7B8798"
          selectionColor="#009E45"
          underlineColorAndroid="transparent"
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={cn(
            "min-h-[54px] flex-1 py-3 text-[16px] text-[#07192D]",
            icon ? "ml-3" : "",
            className
          )}
          style={[
  {
    paddingRight: 12,   
  },
  style,
]}
        />

        {rightAccessory}
      </View>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-2 text-[13px] leading-5 text-red-700"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
});

type PasswordFieldProps = AuthFieldProps;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const editable = props.editable !== false;

  return (
    <AuthField
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={!visible}
      rightAccessory={
        <Pressable
          onPress={() => setVisible((current) => !current)}
          disabled={!editable}
          accessibilityRole="button"
          accessibilityLabel={
            visible ? "Hide password" : "Show password"
          }
          accessibilityState={{ disabled: !editable }}
          className="h-12 w-12 shrink-0 items-center justify-center rounded-lg active:bg-slate-100"
        >
          {visible ? (
  <EyeOff
    size={20}
    color="#7B8798"
    strokeWidth={1.8}
  />
) : (
  <Eye
    size={20}
    color="#7B8798"
    strokeWidth={1.8}
  />
)}
        </Pressable>
      }
    />
  );
}
import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  label?: string;
  value: string | null;
  placeholder: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  containerClassName?: string;
};

export function SelectField({
  label,
  value,
  placeholder,
  options,
  onChange,
  error,
  helperText,
  disabled = false,
  containerClassName,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className={cn("w-full", containerClassName)}>
      {label ? (
        <Text className="mb-1.5 text-[13px] font-medium text-slate-700">
          {label}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityLabel={label ?? placeholder}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={cn(
          "h-12 w-full flex-row items-center justify-between rounded-2xl border bg-white px-4",
          error ? "border-red-400" : "border-slate-200",
          disabled && "opacity-50"
        )}
      >
        <Text
          className={cn(
            "text-[15px]",
            selected ? "text-slate-900" : "text-slate-400"
          )}
        >
          {selected?.label ?? placeholder}
        </Text>

        <ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
      </Pressable>

      {error ? (
        <Text className="mt-1.5 text-[12px] text-red-600">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1.5 text-[12px] text-slate-400">{helperText}</Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          <Pressable className="max-h-[70%] rounded-t-3xl bg-white pb-8 pt-3">
            <View className="mb-2 items-center">
              <View className="h-1 w-10 rounded-full bg-slate-200" />
            </View>

            {label ? (
              <Text className="px-5 pb-3 text-[15px] font-semibold text-slate-900">
                {label}
              </Text>
            ) : null}

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between px-5 py-3.5"
                  >
                    <Text
                      className={cn(
                        "text-[15px]",
                        isSelected
                          ? "font-semibold text-[#00B83F]"
                          : "text-slate-800"
                      )}
                    >
                      {item.label}
                    </Text>

                    {isSelected ? (
                      <Check size={18} color="#00B83F" strokeWidth={2.4} />
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

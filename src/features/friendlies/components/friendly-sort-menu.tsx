import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";

import type { FriendlyFilters } from "../types";

const SORT_OPTIONS: { value: FriendlyFilters["sort"]; label: string }[] = [
  { value: "soonest", label: "Soonest" },
  { value: "nearest", label: "Nearest" },
  { value: "newest", label: "Newest" },
];

type FriendlySortMenuProps = {
  value: FriendlyFilters["sort"];
  onChange: (value: FriendlyFilters["sort"]) => void;
};

export function FriendlySortMenu({ value, onChange }: FriendlySortMenuProps) {
  const [open, setOpen] = useState(false);

  const current =
    SORT_OPTIONS.find((option) => option.value === value)?.label ?? "Soonest";

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sort friendlies"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        className="h-8 flex-row items-center gap-1 rounded-lg px-1.5"
      >
        <Text className="text-[12px] font-semibold text-[#00A638]">
          {current}
        </Text>
        <ChevronDown size={14} color="#00A638" strokeWidth={2.2} />
      </Pressable>

      <BottomSheet visible={open} title="Sort by" onClose={() => setOpen(false)}>
        <View className="overflow-hidden rounded-2xl border border-slate-200">
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.value === value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex-row items-center justify-between border-b border-slate-100 px-4 py-3.5 last:border-b-0"
              >
                <Text
                  className={
                    isSelected
                      ? "text-[14px] font-semibold text-[#00A638]"
                      : "text-[14px] font-medium text-slate-700"
                  }
                >
                  {option.label}
                </Text>

                {isSelected ? (
                  <Check size={16} color="#00B83F" strokeWidth={2.4} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}

"use client";

import { Select } from "radix-ui";
import {
  Check,
  ChevronDown,
} from "lucide-react";

type SelectOption = {
  value: string;
  label: string;
};

type MatchUpSelectProps = {
  name: string;
  placeholder: string;
  options: SelectOption[];
  defaultValue?: string;
  error?: boolean;
  onValueChange?: (
    value: string
  ) => void;
  ariaLabel?: string;
};

export function MatchUpSelect({
  name,
  placeholder,
  options,
  defaultValue = "",
  error = false,
  onValueChange,
  ariaLabel,
}: MatchUpSelectProps) {
  return (
    <Select.Root
      name={name}
      defaultValue={
        defaultValue || undefined
      }
      onValueChange={
        onValueChange
      }
    >
      <Select.Trigger
        aria-label={
          ariaLabel ?? placeholder
        }
        aria-invalid={error}
        className={`flex h-14 w-full items-center justify-between rounded-xl border bg-white px-4 text-[15px] outline-none transition ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-gray-200 hover:border-gray-300 focus:border-[#00B83F] focus:ring-2 focus:ring-green-100"
        }`}
      >
        <Select.Value
          placeholder={
            <span className="text-slate-400">
              {placeholder}
            </span>
          }
        />

        <Select.Icon asChild>
          <ChevronDown
            size={18}
            className="shrink-0 text-slate-400"
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
  <Select.Content
  position="popper"
  side="bottom"
  align="start"
  sideOffset={6}
  className="z-[100] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
>
  <Select.Viewport className="max-h-[200px] overflow-y-auto p-1.5">
    {options.map((option) => (
      <Select.Item
        key={option.value}
        value={option.value}
        className="relative flex h-11 cursor-pointer select-none items-center rounded-lg py-2 pl-4 pr-10 text-[15px] text-slate-600 outline-none transition data-[highlighted]:bg-green-50 data-[highlighted]:text-slate-900 data-[state=checked]:font-semibold data-[state=checked]:text-[#00B83F]"
      >
        <Select.ItemText>
          {option.label}
        </Select.ItemText>

        <Select.ItemIndicator className="absolute right-3 flex items-center justify-center text-[#00B83F]">
          <Check
            size={17}
            strokeWidth={2.5}
          />
        </Select.ItemIndicator>
      </Select.Item>
    ))}
  </Select.Viewport>
</Select.Content>
</Select.Portal>
    </Select.Root>
  );
}
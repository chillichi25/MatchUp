import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

type CalendarPickerProps = {
  value: string;
  onChange: (date: string) => void;
  onClear?: () => void;
};

/** Monday-first month grid that only allows today or later. */
export function CalendarPicker({
  value,
  onChange,
  onClear,
}: CalendarPickerProps) {
  const today = useMemo(() => new Date(), []);

  const selected = value ? parseDateOnly(value) : null;

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthLastDay = new Date(year, month, 0).getDate();

  const todayString = toDateString(today);

  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - startOffset + 1;

    if (dayNumber < 1) {
      return { day: previousMonthLastDay + dayNumber, offset: -1 };
    }

    if (dayNumber > daysInMonth) {
      return { day: dayNumber - daysInMonth, offset: 1 };
    }

    return { day: dayNumber, offset: 0 };
  });

  function selectDate(day: number, offset: number) {
    const date = new Date(year, month + offset, day);

    if (toDateString(date) < todayString) {
      return;
    }

    onChange(toDateString(date));
  }

  function goToToday() {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onChange(todayString);
  }

  return (
    <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <View className="flex-row items-center justify-between px-4 pb-3 pt-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => setVisibleMonth(new Date(year, month - 1, 1))}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <ChevronLeft size={19} color="#475569" />
        </Pressable>

        <Text className="text-[14px] font-bold text-slate-950">
          {`${MONTHS[month]} ${year}`}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => setVisibleMonth(new Date(year, month + 1, 1))}
          className="h-9 w-9 items-center justify-center rounded-full"
        >
          <ChevronRight size={19} color="#475569" />
        </Pressable>
      </View>

      <View className="flex-row px-3">
        {WEEKDAY_LABELS.map((day) => (
          <View key={day} className="h-8 flex-1 items-center justify-center">
            <Text className="text-[10px] font-semibold text-slate-400">
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap px-3 pb-3">
        {cells.map((cell, index) => {
          const cellDate = new Date(year, month + cell.offset, cell.day);
          const dateString = toDateString(cellDate);

          const isSelected = value === dateString;
          const isToday = todayString === dateString;
          const isPast = dateString < todayString;
          const isOutside = cell.offset !== 0;

          let cellTextClass = "font-medium text-slate-700";

          if (isSelected) {
            cellTextClass = "font-bold text-white";
          } else if (isPast || isOutside) {
            cellTextClass = "text-slate-300";
          } else if (isToday) {
            cellTextClass = "font-bold text-[#00A638]";
          }

          return (
            <Pressable
              key={`${dateString}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={dateString}
              accessibilityState={{ selected: isSelected, disabled: isPast }}
              disabled={isPast}
              onPress={() => selectDate(cell.day, cell.offset)}
              className="h-10 items-center justify-center"
              style={{ width: `${100 / 7}%` }}
            >
              <View
                className={
                  isSelected
                    ? "h-8 w-8 items-center justify-center rounded-full bg-brand"
                    : isToday
                      ? "h-8 w-8 items-center justify-center rounded-full border border-green-200 bg-green-50"
                      : "h-8 w-8 items-center justify-center rounded-full"
                }
              >
                <Text className={`text-[12px] ${cellTextClass}`}>
                  {cell.day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center justify-between border-t border-slate-100 px-4 py-3">
        {onClear ? (
          <Pressable accessibilityRole="button" onPress={onClear}>
            <Text className="text-[12px] font-semibold text-slate-500">
              Clear
            </Text>
          </Pressable>
        ) : (
          <View />
        )}

        <Pressable accessibilityRole="button" onPress={goToToday}>
          <Text className="text-[12px] font-bold text-[#00A638]">Today</Text>
        </Pressable>
      </View>
    </View>
  );
}

const HOURS = Array.from({ length: 24 }, (_, index) => pad(index));
const MINUTES = Array.from({ length: 12 }, (_, index) => pad(index * 5));

type TimePickerProps = {
  value: string;
  onChange: (time: string) => void;
};

/** 24-hour hour/minute selector returning `HH:mm`. */
export function TimePicker({ value, onChange }: TimePickerProps) {
  const [initialHour, initialMinute] =
    value && value.includes(":") ? value.split(":") : ["", ""];

  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);

  function chooseHour(next: string) {
    setHour(next);
    if (minute) {
      onChange(`${next}:${minute}`);
    }
  }

  function chooseMinute(next: string) {
    setMinute(next);
    if (hour) {
      onChange(`${hour}:${next}`);
    }
  }

  return (
    <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <View className="border-b border-slate-100 px-4 py-3">
        <Text className="text-center text-[13px] font-bold text-slate-950">
          Select kick-off time
        </Text>
      </View>

      <View className="flex-row">
        <View className="flex-1 border-r border-slate-100">
          <Text className="px-4 pb-2 pt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Hour
          </Text>

          <View className="flex-row flex-wrap px-2 pb-2">
            {HOURS.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: hour === option }}
                onPress={() => chooseHour(option)}
                className="w-1/3 items-center justify-center py-1"
              >
                <View
                  className={
                    hour === option
                      ? "w-full items-center rounded-xl bg-green-50 py-2"
                      : "w-full items-center rounded-xl py-2"
                  }
                >
                  <Text
                    className={
                      hour === option
                        ? "text-[13px] font-semibold text-[#00A638]"
                        : "text-[13px] font-medium text-slate-700"
                    }
                  >
                    {option}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="flex-1">
          <Text className="px-4 pb-2 pt-3 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Minute
          </Text>

          <View className="flex-row flex-wrap px-2 pb-2">
            {MINUTES.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: minute === option }}
                onPress={() => chooseMinute(option)}
                className="w-1/2 items-center justify-center py-1"
              >
                <View
                  className={
                    minute === option
                      ? "w-full items-center rounded-xl bg-green-50 py-2"
                      : "w-full items-center rounded-xl py-2"
                  }
                >
                  <Text
                    className={
                      minute === option
                        ? "text-[13px] font-semibold text-[#00A638]"
                        : "text-[13px] font-medium text-slate-700"
                    }
                  >
                    {option}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

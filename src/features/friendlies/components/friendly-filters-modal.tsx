import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  MapPin,
  Search,
  X,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Input } from "@/components/ui/input";
import { CalendarPicker } from "@/features/matches/components/calendar-picker";

import {
  AGE_GROUPS,
  DISTANCES,
  GENDERS,
  LEVELS,
  MATCH_FORMATS,
  VENUE_OPTIONS,
} from "../constants";
import type { FriendlyFilters } from "../types";
import { formatDateWithYear } from "../utils/format";

type Screen =
  | "main"
  | "age"
  | "date"
  | "location"
  | "distance"
  | "level"
  | "gender"
  | "format"
  | "venue";

type Option = { label: string; value: string };

type FriendlyFiltersModalProps = {
  filters: FriendlyFilters;
  defaultLocation: string;
  onClose: () => void;
  onApply: (filters: FriendlyFilters) => void;
};

const SCREEN_TITLES: Record<Exclude<Screen, "main">, string> = {
  age: "Age group",
  date: "Date",
  location: "Location",
  distance: "Distance",
  level: "Level",
  gender: "Gender",
  format: "Match format",
  venue: "Venue",
};

const SCREEN_INTROS: Record<
  Exclude<Screen, "main">,
  { title: string; description: string }
> = {
  age: {
    title: "Which age group?",
    description: "Choose the age group you want to play.",
  },
  date: {
    title: "When do you want to play?",
    description: "Choose a date for your match.",
  },
  location: {
    title: "Where are you looking?",
    description: "Use your club location or search from another town or city.",
  },
  distance: {
    title: "How far can you travel?",
    description: "Choose your search radius.",
  },
  level: {
    title: "What level are you looking for?",
    description: "Choose the level that suits your team.",
  },
  gender: {
    title: "Which teams are you looking for?",
    description: "Choose a team category.",
  },
  format: {
    title: "What format are you looking for?",
    description: "Choose the match format for your team.",
  },
  venue: {
    title: "Where do you want to play?",
    description: "Choose the preferred venue.",
  },
};

const OPTIONS: Record<
  "age" | "distance" | "level" | "gender" | "format" | "venue",
  Option[]
> = {
  age: [
    { label: "Any age group", value: "" },
    ...AGE_GROUPS.map((value) => ({ label: value, value })),
  ],
  distance: [
    { label: "Any distance", value: "" },
    ...DISTANCES.map((value) => ({ label: `${value} miles`, value })),
  ],
  level: [
    { label: "Any level", value: "" },
    ...LEVELS.map((value) => ({ label: value, value })),
  ],
  gender: [
    { label: "Any", value: "" },
    ...GENDERS.map((value) => ({ label: value, value })),
  ],
  format: [
    { label: "Any format", value: "" },
    ...MATCH_FORMATS.map((value) => ({ label: value, value })),
  ],
  venue: [
    { label: "Any venue", value: "" },
    ...VENUE_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  ],
};

export function FriendlyFiltersModal({
  filters,
  defaultLocation,
  onClose,
  onApply,
}: FriendlyFiltersModalProps) {
  const [screen, setScreen] = useState<Screen>("main");

  const [age, setAge] = useState(filters.age);
  const [level, setLevel] = useState(filters.level);
  const [gender, setGender] = useState(filters.gender);
  const [format, setFormat] = useState(filters.format);
  const [date, setDate] = useState(filters.date);
  const [distance, setDistance] = useState(filters.distance);
  const [venue, setVenue] = useState(filters.venue);

  const [location, setLocation] = useState(filters.location);
  const [useCustomLocation, setUseCustomLocation] = useState(
    Boolean(filters.location)
  );

  const customLocation = useCustomLocation ? location.trim() : "";

  const activeCount = [
    age,
    level,
    gender,
    format,
    date,
    distance,
    venue,
    customLocation,
  ].filter(Boolean).length;

  function apply() {
    onApply({
      ...filters,
      age,
      level,
      gender,
      format,
      date,
      distance,
      venue,
      location: customLocation,
    });
  }

  function reset() {
    setAge("");
    setLevel("");
    setGender("");
    setFormat("");
    setDate("");
    setDistance("");
    setVenue("");
    setLocation("");
    setUseCustomLocation(false);
    setScreen("main");
  }

  function selectOption(value: string) {
    if (screen === "age") setAge(value);
    else if (screen === "distance") setDistance(value);
    else if (screen === "level") setLevel(value);
    else if (screen === "gender") setGender(value);
    else if (screen === "format") setFormat(value);
    else if (screen === "venue") setVenue(value);

    setScreen("main");
  }

  function currentOptionValue(): string {
    if (screen === "age") return age;
    if (screen === "distance") return distance;
    if (screen === "level") return level;
    if (screen === "gender") return gender;
    if (screen === "format") return format;
    if (screen === "venue") return venue;
    return "";
  }

  const isMain = screen === "main";
  const isOptionScreen = screen in OPTIONS;

  return (
    <Modal visible transparent={false} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-[#F8FAFC]">
        <Header
          title={isMain ? "Filters" : SCREEN_TITLES[screen as Exclude<Screen, "main">]}
          leading={
            <CircleButton
              label={isMain ? "Close filters" : "Back to filters"}
              onPress={isMain ? onClose : () => setScreen("main")}
            >
              {isMain ? (
                <X size={19} color="#0F172A" />
              ) : (
                <ArrowLeft size={19} color="#0F172A" />
              )}
            </CircleButton>
          }
        />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-6">
            <Text className="text-[24px] font-bold tracking-tight text-slate-950">
              {isMain ? "Find the right match" : SCREEN_INTROS[screen as Exclude<Screen, "main">].title}
            </Text>
            <Text className="mt-1 text-[13px] leading-[18px] text-slate-500">
              {isMain
                ? "Choose what matters for your team."
                : SCREEN_INTROS[screen as Exclude<Screen, "main">].description}
            </Text>
          </View>

          {isMain ? (
            <>
              <View className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                <FilterRow
                  label="Age group"
                  value={age || "Any age group"}
                  onPress={() => setScreen("age")}
                />
                <Divider />

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setScreen("date")}
                  className="min-h-[58px] flex-row items-center"
                >
                  <View className="min-w-0 flex-1 py-3">
                    <Text className="text-[12px] font-semibold text-slate-950">
                      Date
                    </Text>
                    <Text
                      className={
                        date
                          ? "mt-0.5 text-[10px] font-medium text-brand"
                          : "mt-0.5 text-[10px] text-slate-500"
                      }
                    >
                      {date ? formatDateWithYear(date) : "Any date"}
                    </Text>
                  </View>
                  <CalendarDays size={17} color="#64748B" />
                </Pressable>

                <Divider />

                <FilterRow
                  label="Location"
                  value={customLocation || "Any location"}
                  onPress={() => setScreen("location")}
                />
                <Divider />

                <FilterRow
                  label="Distance"
                  value={distance ? `${distance} miles` : "Any distance"}
                  onPress={() => setScreen("distance")}
                />
                <Divider />

                <FilterRow
                  label="Level"
                  value={level || "Any level"}
                  onPress={() => setScreen("level")}
                />
                <Divider />

                <FilterRow
                  label="Gender"
                  value={gender || "Any"}
                  onPress={() => setScreen("gender")}
                />
                <Divider />

                <FilterRow
                  label="Match format"
                  value={format || "Any format"}
                  onPress={() => setScreen("format")}
                />
                <Divider />

                <FilterRow
                  label="Venue"
                  value={
                    venue
                      ? `${venue.charAt(0).toUpperCase()}${venue.slice(1)}`
                      : "Any venue"
                  }
                  onPress={() => setScreen("venue")}
                />
              </View>

              <View className="mt-7 flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  onPress={reset}
                  className="h-12 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <Text className="text-[13px] font-semibold text-slate-700">
                    Reset all
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={apply}
                  className="h-12 flex-1 items-center justify-center rounded-2xl bg-brand shadow-sm"
                >
                  <Text className="text-[13px] font-bold text-white">
                    Show matches{activeCount ? ` (${activeCount})` : ""}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : screen === "date" ? (
            <View className="mt-6">
              <CalendarPicker
                value={date}
                onChange={(next) => {
                  setDate(next);
                  setScreen("main");
                }}
                onClear={() => {
                  setDate("");
                  setScreen("main");
                }}
              />
            </View>
          ) : screen === "location" ? (
            <View className="mt-6">
              <LocationOption
                title="Club location"
                subtitle={defaultLocation || "No club location available"}
                selected={!useCustomLocation}
                onPress={() => {
                  setUseCustomLocation(false);
                  setLocation("");
                }}
              />

              <LocationOption
                title="Another location"
                subtitle="Search from a different town or city"
                selected={useCustomLocation}
                onPress={() => setUseCustomLocation(true)}
                className="mt-3"
              />

              {useCustomLocation ? (
                <View className="mt-4">
                  <Input
                    placeholder="e.g. Manchester"
                    value={location}
                    onChangeText={setLocation}
                    autoFocus
                  />
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={useCustomLocation && !location.trim()}
                onPress={() => setScreen("main")}
                className={
                  useCustomLocation && !location.trim()
                    ? "mt-4 h-12 items-center justify-center rounded-full bg-slate-200"
                    : "mt-4 h-12 items-center justify-center rounded-full bg-brand shadow-sm"
                }
              >
                <Text
                  className={
                    useCustomLocation && !location.trim()
                      ? "text-[13px] font-bold text-slate-400"
                      : "text-[13px] font-bold text-white"
                  }
                >
                  Done
                </Text>
              </Pressable>
            </View>
          ) : isOptionScreen ? (
            <View className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
              {OPTIONS[screen as keyof typeof OPTIONS].map((option) => (
                <OptionRow
                  key={option.value || "any"}
                  label={option.label}
                  selected={option.value === currentOptionValue()}
                  onPress={() => selectOption(option.value)}
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Header({
  title,
  leading,
}: {
  title: string;
  leading: ReactNode;
}) {
  return (
    <View className="flex-row items-center px-4 pt-2">
      {leading}
      <Text className="flex-1 text-center text-[17px] font-bold text-slate-950">
        {title}
      </Text>
      <View className="h-11 w-11" />
    </View>
  );
}

function CircleButton({
  children,
  label,
  onPress,
}: {
  children: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
    >
      {children}
    </Pressable>
  );
}

function FilterRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const isActive = !value.startsWith("Any") && value !== "Any";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-[58px] flex-row items-center"
    >
      <View className="min-w-0 flex-1 py-3">
        <Text className="text-[12px] font-semibold text-slate-950">{label}</Text>
        <Text
          numberOfLines={1}
          className={
            isActive
              ? "mt-0.5 text-[10px] font-medium text-[#00A638]"
              : "mt-0.5 text-[10px] text-slate-500"
          }
        >
          {value}
        </Text>
      </View>
      <ChevronRight size={17} color="#94A3B8" />
    </Pressable>
  );
}

function OptionRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="min-h-[52px] flex-row items-center justify-between border-b border-slate-100 py-3 last:border-b-0"
    >
      <Text
        className={
          selected
            ? "text-[13px] font-semibold text-slate-950"
            : "text-[13px] font-medium text-slate-700"
        }
      >
        {label}
      </Text>

      {selected ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-green-50">
          <Check size={15} color="#00B83F" strokeWidth={2.5} />
        </View>
      ) : null}
    </Pressable>
  );
}

function LocationOption({
  title,
  subtitle,
  selected,
  onPress,
  className,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={
        selected
          ? `flex-row items-center gap-3 rounded-2xl border border-green-200 bg-[#F4FCF6] px-4 py-4 shadow-sm ${className ?? ""}`
          : `flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm ${className ?? ""}`
      }
    >
      <View
        className={
          selected
            ? "h-10 w-10 items-center justify-center rounded-xl bg-green-100"
            : "h-10 w-10 items-center justify-center rounded-xl bg-slate-50"
        }
      >
        {title === "Club location" ? (
          <MapPin size={18} color={selected ? "#00B83F" : "#94A3B8"} />
        ) : (
          <Search size={18} color={selected ? "#00B83F" : "#94A3B8"} />
        )}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[13px] font-semibold text-slate-950">{title}</Text>
        <Text numberOfLines={1} className="mt-0.5 text-[11px] text-slate-500">
          {subtitle}
        </Text>
      </View>

      {selected ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-brand">
          <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      ) : null}
    </Pressable>
  );
}

function Divider() {
  return <View className="border-t border-slate-100" />;
}

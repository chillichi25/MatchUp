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
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Input } from "@/components/ui/input";
import { CalendarPicker } from "@/features/matches/components/calendar-picker";
import { LocationPicker } from "@/features/clubs/components/location-picker";

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


const GREEN = "#009E45";
const NAVY = "#07192D";
const MUTED = "#596B80";
const BORDER = "#CBD5E1";

type FilterScreen =
  | "main"
  | "age"
  | "date"
  | "location"
  | "distance"
  | "level"
  | "gender"
  | "format"
  | "venue";

type DetailScreen = Exclude<FilterScreen, "main">;

type OptionScreen =
  | "age"
  | "distance"
  | "level"
  | "gender"
  | "format"
  | "venue";

type Option = {
  label: string;
  value: string;
};

type FriendlyFiltersModalProps = {
  filters: FriendlyFilters;
  defaultLocation: string;
  onClose: () => void;
  onApply: (filters: FriendlyFilters) => void;
};

const SCREEN_TITLES: Record<DetailScreen, string> = {
  age: "Age group",
  date: "Date",
  location: "Location",
  distance: "Distance",
  level: "Level",
  gender: "Team category",
  format: "Match format",
  venue: "Venue",
};

const SCREEN_INTROS: Record<
  DetailScreen,
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
    description:
      "Use your club location or search from another town or city.",
  },
  distance: {
    title: "How far can you travel?",
    description:
      "Choose how far from your search location to look.",
  },
  level: {
    title: "Find the right level",
    description: "Choose the level that suits your team.",
  },
  gender: {
    title: "Which teams?",
    description: "Choose a team category.",
  },
  format: {
    title: "Choose a match format",
    description: "Find matches with the right team size.",
  },
  venue: {
    title: "Home or away?",
    description: "Choose your preferred match venue.",
  },
};

const OPTIONS: Record<OptionScreen, Option[]> = {
  age: [
    { label: "Any age group", value: "" },
    ...AGE_GROUPS.map((value) => ({
      label: value,
      value,
    })),
  ],
  distance: [
    { label: "Any distance", value: "" },
    ...DISTANCES.map((value) => ({
      label: `Within ${value} miles`,
      value,
    })),
  ],
  level: [
    { label: "Any level", value: "" },
    ...LEVELS.map((value) => ({
      label: value,
      value,
    })),
  ],
  gender: [
    { label: "Any", value: "" },
    ...GENDERS.map((value) => ({
      label: value,
      value,
    })),
  ],
  format: [
    { label: "Any format", value: "" },
    ...MATCH_FORMATS.map((value) => ({
      label: value,
      value,
    })),
  ],
  venue: [
    { label: "Any venue", value: "" },
    ...VENUE_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  ],
};

function isOptionScreen(
  screen: FilterScreen
): screen is OptionScreen {
  return Object.prototype.hasOwnProperty.call(OPTIONS, screen);
}

export function FriendlyFiltersModal({
  filters,
  defaultLocation,
  onClose,
  onApply,
}: FriendlyFiltersModalProps) {
  const [screen, setScreen] = useState<FilterScreen>("main");

  const [age, setAge] = useState(filters.age);
  const [level, setLevel] = useState(filters.level);
  const [gender, setGender] = useState(filters.gender);
  const [format, setFormat] = useState(filters.format);
  const [date, setDate] = useState(filters.date);
  const [quick, setQuick] = useState(filters.quick);
  const [distance, setDistance] = useState(filters.distance);
  const [venue, setVenue] = useState(filters.venue);
  const [location, setLocation] = useState(filters.location);

  const [useCustomLocation, setUseCustomLocation] = useState(
    Boolean(filters.location)
  );

  const isMain = screen === "main";
  const customLocation = useCustomLocation
    ? location.trim()
    : "";

  const activeCount = [
    age,
    level,
    gender,
    format,
    date || quick,
    distance,
    venue,
    customLocation,
  ].filter(Boolean).length;

  const intro = isMain ? null : SCREEN_INTROS[screen];

  const venueLabel =
    VENUE_OPTIONS.find((option) => option.value === venue)
      ?.label || "Any venue";

  const locationIncomplete =
    useCustomLocation && !location.trim();

  function handleBack() {
    if (isMain) {
      onClose();
    } else {
      setScreen("main");
    }
  }

  function apply() {
    if (locationIncomplete) {
      setScreen("location");
      return;
    }

    onApply({
      ...filters,
      age,
      level,
      gender,
      format,
      date,
      quick,
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
    setQuick("");
    setDistance("");
    setVenue("");
    setLocation("");
    setUseCustomLocation(false);
    setScreen("main");
  }

  function selectOption(value: string) {
    switch (screen) {
      case "age":
        setAge(value);
        break;
      case "distance":
        setDistance(value);
        break;
      case "level":
        setLevel(value);
        break;
      case "gender":
        setGender(value);
        break;
      case "format":
        setFormat(value);
        break;
      case "venue":
        setVenue(value);
        break;
    }

    setScreen("main");
  }

  function currentOptionValue(): string {
    switch (screen) {
      case "age":
        return age;
      case "distance":
        return distance;
      case "level":
        return level;
      case "gender":
        return gender;
      case "format":
        return format;
      case "venue":
        return venue;
      default:
        return "";
    }
  }

  return (
    <Modal
      visible
      transparent={false}
      animationType="slide"
      onRequestClose={handleBack}
    >
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: "#F4F9FA" }}
      >
        <Header
          title={isMain ? "Filters" : SCREEN_TITLES[screen]}
          leading={
            <CircleButton
              label={isMain ? "Close filters" : "Back to filters"}
              onPress={handleBack}
            >
              {isMain ? (
                <X size={19} color="#334155" />
              ) : (
                <ArrowLeft size={19} color="#334155" />
              )}
            </CircleButton>
          }
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            key={screen}
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 28,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Text
              accessibilityRole="header"
              className="text-[26px] font-bold tracking-tight text-[#07192D]"
            >
              {isMain ? "Find the right match" : intro?.title}
            </Text>

            <Text className="mt-1 text-[13px] leading-5 text-[#596B80]">
              {isMain
                ? "Choose what matters for your team."
                : intro?.description}
            </Text>

            {isMain ? (
              <>
                <FilterGroup title="Team preferences">
                  <FilterRow
                    label="Age group"
                    value={age || "Any age group"}
                    active={Boolean(age)}
                    onPress={() => setScreen("age")}
                  />
                  <Divider />

                  <FilterRow
                    label="Level"
                    value={level || "Any level"}
                    active={Boolean(level)}
                    onPress={() => setScreen("level")}
                  />
                  <Divider />

                  <FilterRow
                    label="Team category"
                    value={gender || "Any"}
                    active={Boolean(gender)}
                    onPress={() => setScreen("gender")}
                  />
                  <Divider />

                  <FilterRow
                    label="Match format"
                    value={format || "Any format"}
                    active={Boolean(format)}
                    onPress={() => setScreen("format")}
                  />
                </FilterGroup>

                <FilterGroup title="When and where">
                  <FilterRow
                    label="Date"
                    value={
                      date
                        ? formatDateWithYear(date)
                        : quick === "this-week"
                          ? "This week"
                          : "Any date"
                    }
                    active={Boolean(date || quick)}
                    onPress={() => setScreen("date")}
                    trailing={
                      <CalendarDays
                        size={18}
                        color={MUTED}
                        strokeWidth={1.8}
                      />
                    }
                  />
                  <Divider />

                  <FilterRow
                    label="Location"
                    value={
                      customLocation ||
                      (distance
                        ? defaultLocation || "Club location"
                        : "Any location")
                    }
                    active={Boolean(customLocation)}
                    onPress={() => setScreen("location")}
                  />
                  <Divider />

                  <FilterRow
                    label="Distance"
                    value={
                      distance
                        ? `Within ${distance} miles`
                        : "Any distance"
                    }
                    active={Boolean(distance)}
                    onPress={() => setScreen("distance")}
                  />
                  <Divider />

                  <FilterRow
                    label="Venue"
                    value={venueLabel}
                    active={Boolean(venue)}
                    onPress={() => setScreen("venue")}
                  />
                </FilterGroup>

                <View className="mt-3 flex-row items-start gap-2 px-1">
                  <MapPin
                    size={15}
                    color={MUTED}
                    strokeWidth={1.8}
                    style={{ marginTop: 2 }}
                  />

                  <Text className="min-w-0 flex-1 text-[12px] leading-[18px] text-[#596B80]">
                    {customLocation
                      ? `When a distance is selected, it is measured from ${customLocation}.`
                      : defaultLocation
                        ? `Distance is measured from your club location in ${defaultLocation}.`
                        : "Choose a location when using a distance filter."}
                  </Text>
                </View>
              </>
            ) : screen === "date" ? (
              <View className="mt-6">
                <CalendarPicker
                  value={date}
                  onChange={(next) => {
                    setDate(next);
                    setQuick("");
                    setScreen("main");
                  }}
                  onClear={() => {
                    setDate("");
                    setQuick("");
                    setScreen("main");
                  }}
                />
              </View>
            ) : screen === "location" ? (
              <View className="mt-6">
                <LocationOption
                  title="Club location"
                  subtitle={
                    defaultLocation || "No club location available"
                  }
                  selected={!useCustomLocation}
                  icon={<MapPin size={18} color={GREEN} />}
                  onPress={() => {
                    setUseCustomLocation(false);
                    setLocation("");
                  }}
                />

                <View className="mt-3">
                  <LocationOption
                    title="Another location"
                    subtitle="Choose a different town or city"
                    selected={useCustomLocation}
                    icon={<Search size={18} color={GREEN} />}
                    onPress={() => setUseCustomLocation(true)}
                  />
                </View>

                {useCustomLocation ? (
                  <View className="mt-5">
                    <Text className="mb-2 text-[13px] font-semibold text-[#07192D]">
                      Town or city
                    </Text>

                    <LocationPicker
  value={location || null}
  placeholder="Search town or city"
  onChange={(selected) => {
    setLocation(selected?.formatted ?? "");
  }}
/>

                    <Text className="mt-2 text-[12px] leading-[18px] text-[#596B80]">
                      Choose a distance to search around this location.
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: locationIncomplete,
                  }}
                  disabled={locationIncomplete}
                  onPress={() => {
  Keyboard.dismiss();
  setScreen("main");
}}
                  className="mt-6 min-h-[50px] items-center justify-center rounded-full px-5"
                  style={{
                    backgroundColor: locationIncomplete
                      ? "#E2E8F0"
                      : GREEN,
                  }}
                >
                  <Text
                    className="text-[14px] font-semibold"
                    style={{
                      color: locationIncomplete
                        ? "#64748B"
                        : "#FFFFFF",
                    }}
                  >
                    Done
                  </Text>
                </Pressable>
              </View>
            ) : isOptionScreen(screen) ? (
              <View className="mt-6 overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white px-4">
                {OPTIONS[screen].map((option, index) => (
                  <View key={option.value || "any"}>
                    {index > 0 ? <Divider /> : null}

                    <OptionRow
                      label={option.label}
                      selected={
                        option.value === currentOptionValue()
                      }
                      onPress={() => selectOption(option.value)}
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>

          {isMain ? (
            <View className="border-t border-slate-200 bg-white px-5 pb-3 pt-3">
              {activeCount > 0 ? (
                <Text className="mb-3 text-center text-[12px] text-[#596B80]">
                  {activeCount}{" "}
                  {activeCount === 1
                    ? "filter selected"
                    : "filters selected"}
                </Text>
              ) : null}

              <View className="flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  onPress={reset}
                  className="min-h-[50px] flex-1 items-center justify-center rounded-full border border-[#CBD5E1] bg-white px-4"
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.65 : 1,
                  })}
                >
                  <Text className="text-[14px] font-semibold text-[#07192D]">
                    Reset all
                  </Text>
                </Pressable>

                <Pressable
  accessibilityRole="button"
  onPress={apply}
  className="min-h-[50px] flex-1 items-center justify-center rounded-full bg-[#009E45] px-4 active:opacity-80"
>
  <Text className="text-[14px] font-semibold text-white">
    Show matches
  </Text>
</Pressable>
              </View>
            </View>
          ) : null}
        </KeyboardAvoidingView>
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

      <Text className="flex-1 text-center text-[17px] font-bold text-[#07192D]">
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
      className="h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white"
      style={({ pressed }) => ({
        opacity: pressed ? 0.65 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-6">
      <Text
        accessibilityRole="header"
        className="text-[15px] font-bold text-[#07192D]"
      >
        {title}
      </Text>

      <View className="mt-3 overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white px-4">
        {children}
      </View>
    </View>
  );
}

function FilterRow({
  label,
  value,
  active,
  onPress,
  trailing,
}: {
  label: string;
  value: string;
  active: boolean;
  onPress: () => void;
  trailing?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      onPress={onPress}
      className="min-h-[68px] flex-row items-center gap-3 py-3"
      style={({ pressed }) => ({
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-semibold text-[#07192D]">
          {label}
        </Text>

        <Text
          numberOfLines={2}
          className="mt-1 text-[12px] leading-[18px]"
          style={{
            color: active ? GREEN : MUTED,
            fontWeight: active ? "600" : "400",
          }}
        >
          {value}
        </Text>
      </View>

      {trailing ?? (
        <ChevronRight
          size={18}
          color={MUTED}
          strokeWidth={1.8}
        />
      )}
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
      className="min-h-[58px] flex-row items-center justify-between gap-3 py-3"
      style={({ pressed }) => ({
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <Text
        className="min-w-0 flex-1 text-[14px] leading-5"
        style={{
          color: selected ? GREEN : NAVY,
          fontWeight: selected ? "600" : "400",
        }}
      >
        {label}
      </Text>

      <View
        className="h-6 w-6 items-center justify-center rounded-full border"
        style={{
          backgroundColor: selected ? GREEN : "#FFFFFF",
          borderColor: selected ? GREEN : BORDER,
        }}
      >
        {selected ? (
          <Check
            size={15}
            color="#FFFFFF"
            strokeWidth={2.5}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

function LocationOption({
  title,
  subtitle,
  selected,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border px-4 py-4"
      style={({ pressed }) => ({
        backgroundColor: selected ? "#EFFAF3" : "#FFFFFF",
        borderColor: selected ? "#A7DDBA" : BORDER,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-50">
        {icon}
      </View>

      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-semibold text-[#07192D]">
          {title}
        </Text>

        <Text className="mt-1 text-[12px] leading-[18px] text-[#596B80]">
          {subtitle}
        </Text>
      </View>

      <View
        className="h-6 w-6 items-center justify-center rounded-full border"
        style={{
          backgroundColor: selected ? GREEN : "#FFFFFF",
          borderColor: selected ? GREEN : BORDER,
        }}
      >
        {selected ? (
          <Check
            size={14}
            color="#FFFFFF"
            strokeWidth={2.5}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

function Divider() {
  return <View className="border-t border-slate-100" />;
}
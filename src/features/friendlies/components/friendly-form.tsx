import { CalendarDays, Check, ChevronDown, Clock } from "lucide-react-native";
import { useRef, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { toast } from "sonner-native";

import { Avatar } from "@/components/ui/avatar";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationPicker } from "@/features/clubs/components/location-picker";
import {
  CalendarPicker,
  TimePicker,
} from "@/features/matches/components/calendar-picker";

import {
  MATCH_FORMATS,
  VENUE_DESCRIPTIONS,
  VENUE_OPTIONS,
  resolveMatchFormat,
} from "../constants";
import { useCreateFriendly, useUpdateFriendly } from "../hooks/use-friendlies";
import type { MatchFormat, VenueType } from "../types";
import { formatDateWithYear } from "../utils/format";

const GREEN = "#009E45";
const FIELD_CLASS =
  "min-h-[56px] rounded-2xl border border-[#CBD5E1] bg-white";

export type FriendlyFormInitialValues = {
  matchDate: string;
  kickOffTime: string;
  venueType: VenueType;
  matchFormat: MatchFormat;
  location: string;
  notes: string;
};

type FriendlyFormProps = {
  teamId: string;
  clubName: string;
  teamName: string;
  clubBadgeUrl?: string | null;
  teamMatchFormat?: string | null;
  mode?: "create" | "edit";
  friendlyId?: string;
  initialValues?: FriendlyFormInitialValues;
  onSaved: (id: string) => void;
};

type PickerFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  description?: string;
  icon?: ReactNode;
  expanded: boolean;
  onPress: () => void;
};

function PickerField({
  label,
  value,
  placeholder,
  description,
  icon,
  expanded,
  onPress,
}: PickerFieldProps) {
  return (
    <View>
      <Label>{label}</Label>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[label, value || placeholder, description]
          .filter(Boolean)
          .join(", ")}
        accessibilityState={{ expanded }}
        onPress={onPress}
        className={`${FIELD_CLASS} flex-row items-center gap-3 px-4 py-2.5`}
      >
        {icon}

        <View className="min-w-0 flex-1">
          <Text
            className="text-[15px]"
            style={{ color: value ? "#07192D" : "#64748B" }}
          >
            {value || placeholder}
          </Text>

          {description ? (
            <Text className="mt-0.5 text-[12px] leading-4 text-[#596B80]">
              {description}
            </Text>
          ) : null}
        </View>

        <ChevronDown size={17} color="#64748B" />
      </Pressable>
    </View>
  );
}

export function FriendlyForm({
  teamId,
  clubName,
  teamName,
  clubBadgeUrl,
  teamMatchFormat,
  mode = "create",
  friendlyId,
  initialValues,
  onSaved,
}: FriendlyFormProps) {
  const isEditing = mode === "edit";
  const createFriendly = useCreateFriendly();
  const updateFriendly = useUpdateFriendly();
  const submittingRef = useRef(false);

  const [matchDate, setMatchDate] = useState(initialValues?.matchDate ?? "");
  const [kickOffTime, setKickOffTime] = useState(
    initialValues?.kickOffTime ?? ""
  );
  const [venueType, setVenueType] = useState<VenueType>(
    initialValues?.venueType ?? "home"
  );
  const [matchFormat, setMatchFormat] = useState<MatchFormat>(
    initialValues?.matchFormat ?? resolveMatchFormat(teamMatchFormat)
  );
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [errorMessage, setErrorMessage] = useState("");

  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [draftKickOffTime, setDraftKickOffTime] = useState("");
  const [venueOpen, setVenueOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);

  const hasCompleteTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(draftKickOffTime);
  const needsLocation = venueType !== "away";
  const loading = createFriendly.isPending || updateFriendly.isPending;

  const selectedVenue =
    VENUE_OPTIONS.find((option) => option.value === venueType) ??
    VENUE_OPTIONS[0];

  function openTimePicker() {
    // Stored times may include seconds. The picker uses HH:mm.
    setDraftKickOffTime(kickOffTime.slice(0, 5));
    setTimeOpen(true);
  }

  function confirmTime() {
    if (!hasCompleteTime) return;

    setKickOffTime(draftKickOffTime);
    setTimeOpen(false);
  }

  async function handleSubmit() {
    if (submittingRef.current) return;

    setErrorMessage("");

    if (!matchDate || !kickOffTime) {
      setErrorMessage("Please select the date and kick-off time.");
      return;
    }

    if (needsLocation && !location.trim()) {
      setErrorMessage("Please select a town or city from the suggestions.");
      return;
    }

    if (isEditing && !friendlyId) {
      setErrorMessage("The friendly could not be updated.");
      return;
    }

    const values = {
      teamId,
      matchDate,
      kickOffTime,
      venueType,
      matchFormat,
      location: needsLocation ? location.trim() : "",
      notes,
    };

    submittingRef.current = true;

    try {
      if (isEditing && friendlyId) {
        await updateFriendly.mutateAsync({ friendlyId, ...values });
        toast.success("Changes saved");
        onSaved(friendlyId);
        return;
      }

      const result = await createFriendly.mutateAsync(values);
      toast.success("Match published");
      onSaved(result.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditing
            ? "We couldn't save your changes. Please try again."
            : "We couldn't publish your match. Please try again."
      );
    } finally {
      submittingRef.current = false;
    }
  }

  const submitLabel = isEditing ? "Save changes" : "Publish match";
  const loadingLabel = isEditing ? "Saving…" : "Publishing…";

  return (
    <View className="mt-6 gap-4">
      <View className="rounded-2xl border border-[#CBD5E1] bg-white p-4">
        <Text className="text-[12px] font-medium text-[#596B80]">
          {isEditing ? "Match posted as" : "Posting as"}
        </Text>

        <View className="mt-2 flex-row items-center gap-3">
          <Avatar
            uri={clubBadgeUrl ?? null}
            name={clubName || teamName}
            size={44}
          />

          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-bold text-[#07192D]">
              {teamName}
            </Text>

            {clubName ? (
              <Text className="mt-0.5 text-[13px] text-[#596B80]">
                {clubName}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <PickerField
        label="Match date"
        value={matchDate ? formatDateWithYear(matchDate) : ""}
        placeholder="Select a date"
        icon={<CalendarDays size={19} color="#64748B" />}
        expanded={dateOpen}
        onPress={() => setDateOpen(true)}
      />

      <PickerField
        label="Kick-off time"
        value={kickOffTime.slice(0, 5)}
        placeholder="Select a time"
        icon={<Clock size={19} color="#64748B" />}
        expanded={timeOpen}
        onPress={openTimePicker}
      />

      <PickerField
        label="Home or away"
        value={selectedVenue.label}
        description={VENUE_DESCRIPTIONS[venueType]}
        expanded={venueOpen}
        onPress={() => setVenueOpen(true)}
      />

      <PickerField
        label="Match format"
        value={matchFormat}
        expanded={formatOpen}
        onPress={() => setFormatOpen(true)}
      />

      {needsLocation ? (
        <View>
          <Label>Town or city</Label>

          <LocationPicker
            value={location || null}
            onChange={(selectedLocation) =>
              setLocation(selectedLocation?.formatted ?? "")
            }
            placeholder="e.g. Leeds"
          />
        </View>
      ) : null}

      <View>
        <Label>Notes (optional)</Label>
        <Input
          accessibilityLabel="Notes, optional"
          placeholder="Anything the other coach should know?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          className="h-auto min-h-[104px] rounded-2xl border-[#CBD5E1] bg-white py-3"
          textAlignVertical="top"
        />
      </View>

      {errorMessage ? (
        <View
          accessibilityLiveRegion="polite"
          className="rounded-2xl bg-red-50 px-4 py-3"
        >
          <Text accessibilityRole="alert" className="text-sm text-red-700">
            {errorMessage}
          </Text>
        </View>
      ) : null}

      <Button
        className="min-h-[50px] w-full rounded-full"
        style={{ backgroundColor: GREEN }}
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
      >
        {loading ? loadingLabel : submitLabel}
      </Button>

      <BottomSheet
        visible={dateOpen}
        title="Match date"
        onClose={() => setDateOpen(false)}
      >
        <CalendarPicker
          value={matchDate}
          onChange={(next) => {
            setMatchDate(next);
            setDateOpen(false);
          }}
        />
      </BottomSheet>

      <BottomSheet
        visible={timeOpen}
        title="Kick-off time"
        onClose={() => setTimeOpen(false)}
      >
        {timeOpen ? (
          <TimePicker
            value={draftKickOffTime}
            onChange={setDraftKickOffTime}
          />
        ) : null}

        <Button
          className="mt-4 min-h-[50px] rounded-full"
          style={{ backgroundColor: hasCompleteTime ? GREEN : "#64748B" }}
          disabled={!hasCompleteTime}
          onPress={confirmTime}
        >
          Done
        </Button>
      </BottomSheet>

      <BottomSheet
        visible={venueOpen}
        title="Home or away"
        onClose={() => setVenueOpen(false)}
      >
        <View className="overflow-hidden rounded-2xl border border-[#CBD5E1]">
          {VENUE_OPTIONS.map((option, index) => {
            const isSelected = venueType === option.value;
            const hasDivider = index < VENUE_OPTIONS.length - 1;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setVenueType(option.value);
                  setVenueOpen(false);
                }}
                className={`min-h-[56px] flex-row items-center gap-3 px-4 py-3 ${
                  hasDivider ? "border-b border-slate-100" : ""
                }`}
              >
                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold text-[#07192D]">
                    {option.label}
                  </Text>
                  <Text className="mt-0.5 text-[13px] leading-[18px] text-[#596B80]">
                    {VENUE_DESCRIPTIONS[option.value]}
                  </Text>
                </View>

                {isSelected ? (
                  <Check size={18} color={GREEN} strokeWidth={2.4} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={formatOpen}
        title="Match format"
        onClose={() => setFormatOpen(false)}
      >
        <View className="overflow-hidden rounded-2xl border border-[#CBD5E1]">
          {MATCH_FORMATS.map((option, index) => {
            const isSelected = matchFormat === option;
            const hasDivider = index < MATCH_FORMATS.length - 1;

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setMatchFormat(option);
                  setFormatOpen(false);
                }}
                className={`min-h-[56px] flex-row items-center justify-between px-4 py-3 ${
                  hasDivider ? "border-b border-slate-100" : ""
                }`}
              >
                <Text className="text-[15px] font-medium text-[#07192D]">
                  {option}
                </Text>

                {isSelected ? (
                  <Check size={18} color={GREEN} strokeWidth={2.4} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}
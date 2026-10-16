import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  MapPin,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { toast } from "sonner-native";

import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarPicker, TimePicker } from "@/features/matches/components/calendar-picker";

import {
  MATCH_FORMATS,
  VENUE_DESCRIPTIONS,
  VENUE_OPTIONS,
  resolveMatchFormat,
} from "../constants";
import { useCreateFriendly, useUpdateFriendly } from "../hooks/use-friendlies";
import type { MatchFormat, VenueType } from "../types";
import { formatDateWithYear } from "../utils/format";

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
  teamMatchFormat?: string | null;
  mode?: "create" | "edit";
  friendlyId?: string;
  initialValues?: FriendlyFormInitialValues;
  onSaved: (id: string) => void;
};

export function FriendlyForm({
  teamId,
  clubName,
  teamName,
  teamMatchFormat,
  mode = "create",
  friendlyId,
  initialValues,
  onSaved,
}: FriendlyFormProps) {
  const isEditing = mode === "edit";

  const createFriendly = useCreateFriendly();
  const updateFriendly = useUpdateFriendly();

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
  const [venueOpen, setVenueOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);

  const needsLocation = venueType !== "away";
  const loading = createFriendly.isPending || updateFriendly.isPending;

  const selectedVenue =
    VENUE_OPTIONS.find((option) => option.value === venueType) ??
    VENUE_OPTIONS[0];

  async function handleSubmit() {
    setErrorMessage("");

    if (!matchDate || !kickOffTime) {
      setErrorMessage("Please enter the date and kick-off time.");
      return;
    }

    if (needsLocation && !location.trim()) {
      setErrorMessage("Please enter the match location.");
      return;
    }

    try {
      if (isEditing) {
        if (!friendlyId) {
          setErrorMessage("The friendly could not be updated.");
          return;
        }

        await updateFriendly.mutateAsync({
          friendlyId,
          teamId,
          matchDate,
          kickOffTime,
          venueType,
          matchFormat,
          location: needsLocation ? location.trim() : "",
          notes,
        });

        toast.success("Changes saved");
        onSaved(friendlyId);
        return;
      }

      const result = await createFriendly.mutateAsync({
        teamId,
        matchDate,
        kickOffTime,
        venueType,
        matchFormat,
        location: needsLocation ? location.trim() : "",
        notes,
      });

      toast.success("Match created");
      onSaved(result.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Something went wrong while updating your friendly."
            : "Something went wrong while creating your friendly."
      );
    }
  }

  return (
    <View className="mt-4 gap-5">
      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-[11px] font-medium text-slate-400">
          {isEditing ? "Match posted as" : "Posting as"}
        </Text>
        <Text className="mt-1 font-bold text-slate-900">{clubName}</Text>
        <Text className="mt-1 text-sm text-slate-500">{teamName}</Text>
      </View>

      {/* DATE */}
      <View>
        <Label>Match date</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Match date"
          accessibilityState={{ expanded: dateOpen }}
          onPress={() => setDateOpen(true)}
          className="h-[52px] flex-row items-center rounded-2xl border border-slate-200 bg-white px-4"
        >
          <CalendarDays size={19} color="#94A3B8" />
          <Text
            className={
              matchDate
                ? "ml-4 flex-1 text-[15px] text-slate-900"
                : "ml-4 flex-1 text-[15px] text-slate-400"
            }
          >
            {matchDate ? formatDateWithYear(matchDate) : "dd/mm/yyyy"}
          </Text>
          <ChevronDown size={17} color="#64748B" />
        </Pressable>
      </View>

      {/* KICK-OFF */}
      <View>
        <Label>Kick-off time</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kick-off time"
          accessibilityState={{ expanded: timeOpen }}
          onPress={() => setTimeOpen(true)}
          className="h-[52px] flex-row items-center rounded-2xl border border-slate-200 bg-white px-4"
        >
          <Clock size={19} color="#94A3B8" />
          <Text
            className={
              kickOffTime
                ? "ml-4 flex-1 text-[15px] text-slate-900"
                : "ml-4 flex-1 text-[15px] text-slate-400"
            }
          >
            {kickOffTime || "--:--"}
          </Text>
          <ChevronDown size={17} color="#64748B" />
        </Pressable>
      </View>

      {/* VENUE */}
      <View>
        <Label>Venue</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Venue"
          accessibilityState={{ expanded: venueOpen }}
          onPress={() => setVenueOpen(true)}
          className="h-[52px] flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4"
        >
          <View className="min-w-0 flex-1 flex-row items-center gap-2">
            <Text className="text-[15px] font-medium text-slate-900">
              {selectedVenue.label}
            </Text>
            <View className="h-px w-3 shrink-0 bg-slate-300" />
            <Text numberOfLines={1} className="flex-1 text-[15px] text-slate-500">
              {VENUE_DESCRIPTIONS[venueType]}
            </Text>
          </View>
          <ChevronDown size={17} color="#64748B" />
        </Pressable>
      </View>

      {/* FORMAT */}
      <View>
        <Label>Match format</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Match format"
          accessibilityState={{ expanded: formatOpen }}
          onPress={() => setFormatOpen(true)}
          className="h-[52px] flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4"
        >
          <Text className="text-[15px] text-slate-900">{matchFormat}</Text>
          <ChevronDown size={17} color="#64748B" />
        </Pressable>
      </View>

      {/* LOCATION */}
      {needsLocation ? (
        <View>
          <Label>Location</Label>
          <View className="flex-row items-center">
            <MapPin
              size={19}
              color="#94A3B8"
              style={{ position: "absolute", left: 16, zIndex: 1 }}
            />
            <Input
              containerClassName="flex-1"
              className="pl-12"
              placeholder="e.g. Leeds"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>
      ) : null}

      {/* NOTES */}
      <View>
        <Label>Notes (optional)</Label>
        <Input
          placeholder="Anything the other coach should know?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          className="h-auto min-h-[104px] py-3"
          textAlignVertical="top"
        />
      </View>

      {errorMessage ? (
        <View className="rounded-2xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-600">{errorMessage}</Text>
        </View>
      ) : null}

      <Button onPress={handleSubmit} loading={loading}>
        {loading
          ? isEditing
            ? "Saving..."
            : "Publishing..."
          : isEditing
            ? "Save Changes"
            : "Publish a Match"}
      </Button>

      {/* DATE SHEET */}
      <BottomSheet visible={dateOpen} title="Match date" onClose={() => setDateOpen(false)}>
        <CalendarPicker
          value={matchDate}
          onChange={(next) => {
            setMatchDate(next);
            setDateOpen(false);
          }}
        />
      </BottomSheet>

      {/* TIME SHEET */}
      <BottomSheet
        visible={timeOpen}
        title="Kick-off time"
        onClose={() => setTimeOpen(false)}
      >
        <TimePicker
          value={kickOffTime}
          onChange={(next) => setKickOffTime(next)}
        />
        <Button className="mt-4" onPress={() => setTimeOpen(false)}>
          Done
        </Button>
      </BottomSheet>

      {/* VENUE SHEET */}
      <BottomSheet visible={venueOpen} title="Venue" onClose={() => setVenueOpen(false)}>
        <View className="overflow-hidden rounded-2xl border border-slate-200">
          {VENUE_OPTIONS.map((option) => {
            const isSelected = venueType === option.value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setVenueType(option.value);
                  setVenueOpen(false);
                }}
                className="flex-row items-center justify-between border-b border-slate-100 px-4 py-3.5 last:border-b-0"
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <Text className="text-[14px] font-medium text-slate-900">
                    {option.label}
                  </Text>
                  <View className="h-px w-3 shrink-0 bg-slate-300" />
                  <Text numberOfLines={1} className="flex-1 text-[14px] text-slate-500">
                    {VENUE_DESCRIPTIONS[option.value]}
                  </Text>
                </View>

                {isSelected ? (
                  <Check size={16} color="#00B83F" strokeWidth={2.4} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      {/* FORMAT SHEET */}
      <BottomSheet
        visible={formatOpen}
        title="Match format"
        onClose={() => setFormatOpen(false)}
      >
        <View className="overflow-hidden rounded-2xl border border-slate-200">
          {MATCH_FORMATS.map((option) => {
            const isSelected = matchFormat === option;

            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setMatchFormat(option);
                  setFormatOpen(false);
                }}
                className="flex-row items-center justify-between border-b border-slate-100 px-4 py-3.5 last:border-b-0"
              >
                <Text className="text-[14px] font-medium text-slate-900">
                  {option}
                </Text>

                {isSelected ? (
                  <Check size={16} color="#00B83F" strokeWidth={2.4} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

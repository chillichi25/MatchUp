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
  TOURNAMENT_AGE_GROUPS,
  TOURNAMENT_CREATE_FORMATS,
  TOURNAMENT_CREATE_LEVELS,
  TOURNAMENT_GENDERS,
} from "../constants";
import {
  useCreateTournament,
  useUpdateTournament,
} from "../hooks/use-tournament-organiser";
import type { CreateTournamentInput } from "../types";
import { formatDateWithYear } from "@/features/friendlies/utils/format";

export type TournamentFormValues = CreateTournamentInput;

type TournamentFormProps = {
  clubName: string;
  teamName: string;
  mode?: "create" | "edit";
  tournamentId?: string;
  initialValues?: TournamentFormValues;
  onSaved: (id: string) => void;
};

export function TournamentForm({
  clubName,
  teamName,
  mode = "create",
  tournamentId,
  initialValues,
  onSaved,
}: TournamentFormProps) {
  const isEditing = mode === "edit";

  const createTournament = useCreateTournament();
  const updateTournament = useUpdateTournament();

  const [name, setName] = useState(initialValues?.name ?? "");
  const [ageGroup, setAgeGroup] = useState(initialValues?.ageGroup ?? "");
  const [gender, setGender] = useState(initialValues?.gender ?? "");
  const [level, setLevel] = useState(initialValues?.level ?? "");
  const [matchFormat, setMatchFormat] = useState(
    initialValues?.matchFormat ?? ""
  );
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [entryFee, setEntryFee] = useState(initialValues?.entryFee ?? "0");
  const [maxTeams, setMaxTeams] = useState(initialValues?.maxTeams ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? ""
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [sheet, setSheet] = useState<
    "age" | "gender" | "level" | "format" | "date" | "endDate" | "startTime" | "endTime" | null
  >(null);

  const loading = createTournament.isPending || updateTournament.isPending;

  async function handleSubmit() {
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter a tournament name.");
      return;
    }

    if (!ageGroup || !gender || !level || !matchFormat) {
      setErrorMessage("Please choose the age group, gender, level and format.");
      return;
    }

    if (!startDate || !startTime || !endTime) {
      setErrorMessage("Please choose the start date and times.");
      return;
    }

    if (!location.trim()) {
      setErrorMessage("Please enter the tournament location.");
      return;
    }

    try {
      const payload: CreateTournamentInput = {
        name: name.trim(),
        ageGroup,
        gender,
        level,
        matchFormat,
        startDate,
        startTime,
        endDate,
        endTime,
        location: location.trim(),
        entryFee,
        maxTeams,
        description,
      };

      if (isEditing) {
        if (!tournamentId) {
          setErrorMessage("The tournament could not be updated.");
          return;
        }

        await updateTournament.mutateAsync({
          ...payload,
          tournamentId,
        });

        toast.success("Changes saved");
        onSaved(tournamentId);
        return;
      }

      const result = await createTournament.mutateAsync(payload);

      toast.success("Tournament published");
      onSaved(result.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Something went wrong while updating your tournament."
            : "Something went wrong while creating your tournament."
      );
    }
  }

  return (
    <View className="mt-4 gap-5">
      <View className="rounded-2xl border border-slate-200 bg-white p-4">
        <Text className="text-[11px] font-medium text-slate-400">
          {isEditing ? "Tournament hosted by" : "Hosting as"}
        </Text>
        <Text className="mt-1 font-bold text-slate-900">{clubName}</Text>
        <Text className="mt-1 text-sm text-slate-500">{teamName}</Text>
      </View>

      <View>
        <Label>Tournament name</Label>
        <Input
          placeholder="e.g. Spring Cup 2026"
          value={name}
          onChangeText={setName}
        />
      </View>

      <SelectField
        label="Age group"
        value={ageGroup}
        placeholder="Select age group"
        expanded={sheet === "age"}
        onPress={() => setSheet("age")}
      />

      <SelectField
        label="Gender"
        value={gender}
        placeholder="Select gender"
        expanded={sheet === "gender"}
        onPress={() => setSheet("gender")}
      />

      <SelectField
        label="Level"
        value={level}
        placeholder="Select level"
        expanded={sheet === "level"}
        onPress={() => setSheet("level")}
      />

      <SelectField
        label="Match format"
        value={matchFormat}
        placeholder="Select format"
        expanded={sheet === "format"}
        onPress={() => setSheet("format")}
      />

      <View>
        <Label>Start date</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start date"
          accessibilityState={{ expanded: sheet === "date" }}
          onPress={() => setSheet("date")}
          className="h-[52px] flex-row items-center rounded-2xl border border-slate-200 bg-white px-4"
        >
          <CalendarDays size={19} color="#94A3B8" />
          <Text
            className={
              startDate
                ? "ml-4 flex-1 text-[15px] text-slate-900"
                : "ml-4 flex-1 text-[15px] text-slate-400"
            }
          >
            {startDate ? formatDateWithYear(startDate) : "dd/mm/yyyy"}
          </Text>
          <ChevronDown size={17} color="#64748B" />
        </Pressable>
      </View>

      <View>
        <Label>Start time</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start time"
          accessibilityState={{ expanded: sheet === "startTime" }}
          onPress={() => setSheet("startTime")}
          className="h-[52px] flex-row items-center rounded-2xl border border-slate-200 bg-white px-4"
        >
          <Clock size={19} color="#94A3B8" />
          <Text
            className={
              startTime
                ? "ml-4 flex-1 text-[15px] text-slate-900"
                : "ml-4 flex-1 text-[15px] text-slate-400"
            }
          >
            {startTime || "--:--"}
          </Text>
          <ChevronDown size={17} color="#64748B" />
        </Pressable>
      </View>

      <View>
        <Label>End date (optional)</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End date"
          accessibilityState={{ expanded: sheet === "endDate" }}
          onPress={() => setSheet("endDate")}
          className="h-[52px] flex-row items-center rounded-2xl border border-slate-200 bg-white px-4"
        >
          <CalendarDays size={19} color="#94A3B8" />
          <Text
            className={
              endDate
                ? "ml-4 flex-1 text-[15px] text-slate-900"
                : "ml-4 flex-1 text-[15px] text-slate-400"
            }
          >
            {endDate ? formatDateWithYear(endDate) : "Same day"}
          </Text>
          <ChevronDown size={17} color="#64748B" />
        </Pressable>
      </View>

      <View>
        <Label>End time</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End time"
          accessibilityState={{ expanded: sheet === "endTime" }}
          onPress={() => setSheet("endTime")}
          className="h-[52px] flex-row items-center rounded-2xl border border-slate-200 bg-white px-4"
        >
          <Clock size={19} color="#94A3B8" />
          <Text
            className={
              endTime
                ? "ml-4 flex-1 text-[15px] text-slate-900"
                : "ml-4 flex-1 text-[15px] text-slate-400"
            }
          >
            {endTime || "--:--"}
          </Text>
          <ChevronDown size={17} color="#64748B" />
        </Pressable>
      </View>

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

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Label>Entry fee (£)</Label>
          <Input
            keyboardType="numeric"
            placeholder="0"
            value={entryFee}
            onChangeText={setEntryFee}
          />
        </View>

        <View className="flex-1">
          <Label>Max teams</Label>
          <Input
            keyboardType="number-pad"
            placeholder="e.g. 16"
            value={maxTeams}
            onChangeText={setMaxTeams}
          />
        </View>
      </View>

      <View>
        <Label>Description (optional)</Label>
        <Input
          placeholder="Tell teams about your tournament"
          value={description}
          onChangeText={setDescription}
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
            : "Publish Tournament"}
      </Button>

      <OptionSheet
        visible={sheet === "age"}
        title="Age group"
        options={TOURNAMENT_AGE_GROUPS}
        value={ageGroup}
        onSelect={setAgeGroup}
        onClose={() => setSheet(null)}
      />

      <OptionSheet
        visible={sheet === "gender"}
        title="Gender"
        options={TOURNAMENT_GENDERS}
        value={gender}
        onSelect={setGender}
        onClose={() => setSheet(null)}
      />

      <OptionSheet
        visible={sheet === "level"}
        title="Level"
        options={TOURNAMENT_CREATE_LEVELS}
        value={level}
        onSelect={setLevel}
        onClose={() => setSheet(null)}
      />

      <OptionSheet
        visible={sheet === "format"}
        title="Match format"
        options={TOURNAMENT_CREATE_FORMATS}
        value={matchFormat}
        onSelect={setMatchFormat}
        onClose={() => setSheet(null)}
      />

      <BottomSheet
        visible={sheet === "date"}
        title="Start date"
        onClose={() => setSheet(null)}
      >
        <CalendarPicker
          value={startDate}
          onChange={(next) => {
            setStartDate(next);
            setSheet(null);
          }}
        />
      </BottomSheet>

      <BottomSheet
        visible={sheet === "endDate"}
        title="End date"
        onClose={() => setSheet(null)}
      >
        <CalendarPicker
          value={endDate || startDate}
          onChange={(next) => {
            setEndDate(next);
            setSheet(null);
          }}
          onClear={() => {
            setEndDate("");
            setSheet(null);
          }}
        />
      </BottomSheet>

      <BottomSheet
        visible={sheet === "startTime"}
        title="Start time"
        onClose={() => setSheet(null)}
      >
        <TimePicker value={startTime} onChange={setStartTime} />
        <Button className="mt-4" onPress={() => setSheet(null)}>
          Done
        </Button>
      </BottomSheet>

      <BottomSheet
        visible={sheet === "endTime"}
        title="End time"
        onClose={() => setSheet(null)}
      >
        <TimePicker value={endTime} onChange={setEndTime} />
        <Button className="mt-4" onPress={() => setSheet(null)}>
          Done
        </Button>
      </BottomSheet>
    </View>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  expanded,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  expanded: boolean;
  onPress: () => void;
}) {
  return (
    <View>
      <Label>{label}</Label>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded }}
        onPress={onPress}
        className="h-[52px] flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-4"
      >
        <Text
          className={
            value ? "text-[15px] text-slate-900" : "text-[15px] text-slate-400"
          }
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={17} color="#64748B" />
      </Pressable>
    </View>
  );
}

function OptionSheet({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: readonly string[];
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      <View className="overflow-hidden rounded-2xl border border-slate-200">
        {options.map((option) => {
          const isSelected = value === option;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                onSelect(option);
                onClose();
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
  );
}

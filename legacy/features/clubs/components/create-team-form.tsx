"use client";

import {
  FormEvent,
  useState,
} from "react";

import { MatchUpSelect } from "@/components/ui/matchup-select";

type CreateTeamFormProps = {
  action: (
    formData: FormData
  ) => void | Promise<void>;

  clubName: string;
  country: string;
  county: string;
  city: string;
  lat: string;
  lng: string;

  initialTeamName?: string;
  initialAgeGroup?: string;
  initialMatchFormat?: string;
  initialGender?: string;
  initialLevel?: string;
submitLabel?: string;
};

type FieldName =
  | "teamName"
  | "ageGroup"
  | "matchFormat"
  | "gender"
  | "level";

type Errors = Partial<
  Record<FieldName, boolean>
>;

const ageGroupOptions = [
  { value: "U7", label: "U7" },
  { value: "U8", label: "U8" },
  { value: "U9", label: "U9" },
  { value: "U10", label: "U10" },
  { value: "U11", label: "U11" },
  { value: "U12", label: "U12" },
  { value: "U13", label: "U13" },
  { value: "U14", label: "U14" },
  { value: "U15", label: "U15" },
  { value: "U16", label: "U16" },
  { value: "U17", label: "U17" },
  { value: "U18", label: "U18" },
  {
    value: "Adult",
    label: "Adult",
  },
];

const matchFormatOptions = [
  {
    value: "5v5",
    label: "5v5",
  },
  {
    value: "7v7",
    label: "7v7",
  },
  {
    value: "9v9",
    label: "9v9",
  },
  {
    value: "11v11",
    label: "11v11",
  },
];

const categoryOptions = [
  {
    value: "Boys",
    label: "Boys",
  },
  {
    value: "Girls",
    label: "Girls",
  },
  {
    value: "Mixed",
    label: "Mixed",
  },
  {
    value: "Men",
    label: "Men",
  },
  {
    value: "Women",
    label: "Women",
  },
];

const levelOptions = [
  {
    value: "Beginner",
    label: "Beginner",
  },
  {
    value: "Development",
    label: "Development",
  },
  {
    value: "Intermediate",
    label: "Intermediate",
  },
  {
    value: "Competitive",
    label: "Competitive",
  },
  {
    value: "Elite",
    label: "Elite",
  },
];

export function CreateTeamForm({
  action,
  clubName,
  country,
  county,
  city,
  lat,
  lng,
  initialTeamName = "",
  initialAgeGroup = "",
  initialMatchFormat = "",
  initialGender = "",
initialLevel = "",
submitLabel = "Continue",
}: CreateTeamFormProps) {
  const [errors, setErrors] =
    useState<Errors>({});

  function clearError(
    field: FieldName
  ) {
    setErrors((current) => ({
      ...current,
      [field]: false,
    }));
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    const formData =
      new FormData(event.currentTarget);

    const teamName =
      formData
        .get("teamName")
        ?.toString()
        .trim() ?? "";

    const ageGroup =
      formData
        .get("ageGroup")
        ?.toString()
        .trim() ?? "";

    const matchFormat =
      formData
        .get("matchFormat")
        ?.toString()
        .trim() ?? "";

    const gender =
      formData
        .get("gender")
        ?.toString()
        .trim() ?? "";

    const level =
      formData
        .get("level")
        ?.toString()
        .trim() ?? "";

    const nextErrors: Errors = {
      teamName: !teamName,
      ageGroup: !ageGroup,
      matchFormat:
        !matchFormat,
      gender: !gender,
      level: !level,
    };

    setErrors(nextErrors);

    const hasErrors =
      Object.values(
        nextErrors
      ).some(Boolean);

    if (hasErrors) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      noValidate
      className="mt-7 space-y-5"
    >
      {/* Club data */}
      <input
        type="hidden"
        name="clubName"
        value={clubName}
      />

      <input
        type="hidden"
        name="country"
        value={country}
      />

      <input
        type="hidden"
        name="county"
        value={county}
      />

      <input
        type="hidden"
        name="city"
        value={city}
      />

      <input
        type="hidden"
        name="lat"
        value={lat}
      />

      <input
        type="hidden"
        name="lng"
        value={lng}
      />

      {/* Team name */}
      <div>
        <label
          htmlFor="teamName"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Team name
        </label>

        <input
          id="teamName"
          name="teamName"
          type="text"
          defaultValue={
            initialTeamName
          }
          placeholder="e.g. U12 Reds"
          autoComplete="off"
          aria-invalid={
            Boolean(
              errors.teamName
            )
          }
          onChange={(
            event
          ) => {
            if (
              event.target.value
                .trim()
                .length > 0
            ) {
              clearError(
                "teamName"
              );
            }
          }}
          className={`h-14 w-full rounded-xl border bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 ${
            errors.teamName
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-200 hover:border-gray-300 focus:border-[#00B83F] focus:ring-2 focus:ring-green-100"
          }`}
        />

        {errors.teamName && (
          <p
            role="alert"
            className="mt-2 text-sm text-red-500"
          >
            Please enter your
            team name.
          </p>
        )}
      </div>

      {/* Age group */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Age group
        </label>

        <MatchUpSelect
          name="ageGroup"
          placeholder="Select age group"
          options={
            ageGroupOptions
          }
          defaultValue={
            initialAgeGroup
          }
          error={Boolean(
            errors.ageGroup
          )}
          onValueChange={() =>
            clearError(
              "ageGroup"
            )
          }
          ariaLabel="Age group"
        />

        {errors.ageGroup && (
          <p
            role="alert"
            className="mt-2 text-sm text-red-500"
          >
            Please select an age
            group.
          </p>
        )}
      </div>

      {/* Match format */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Match format
        </label>

        <MatchUpSelect
          name="matchFormat"
          placeholder="Select match format"
          options={
            matchFormatOptions
          }
          defaultValue={
            initialMatchFormat
          }
          error={Boolean(
            errors.matchFormat
          )}
          onValueChange={() =>
            clearError(
              "matchFormat"
            )
          }
          ariaLabel="Match format"
        />

        {errors.matchFormat && (
          <p
            role="alert"
            className="mt-2 text-sm text-red-500"
          >
            Please select a match
            format.
          </p>
        )}
      </div>

      {/* Team category */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Team category
        </label>

        <MatchUpSelect
          name="gender"
          placeholder="Select team category"
          options={
            categoryOptions
          }
          defaultValue={
            initialGender
          }
          error={Boolean(
            errors.gender
          )}
          onValueChange={() =>
            clearError(
              "gender"
            )
          }
          ariaLabel="Team category"
        />

        {errors.gender && (
          <p
            role="alert"
            className="mt-2 text-sm text-red-500"
          >
            Please select a team
            category.
          </p>
        )}
      </div>

      {/* Team level */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Team level
        </label>

        <MatchUpSelect
          name="level"
          placeholder="Select team level"
          options={
            levelOptions
          }
          defaultValue={
            initialLevel
          }
          error={Boolean(
            errors.level
          )}
          onValueChange={() =>
            clearError("level")
          }
          ariaLabel="Team level"
        />

        {errors.level ? (
          <p
            role="alert"
            className="mt-2 text-sm text-red-500"
          >
            Please select a team
            level.
          </p>
        ) : (
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Choose the level that
            best reflects your
            team.
          </p>
        )}
      </div>

      {/* Continue */}
      <button
        type="submit"
        className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white shadow-sm transition hover:bg-[#009F37] active:scale-[0.98]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
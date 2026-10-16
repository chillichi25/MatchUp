"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  CreateClubLocationFields,
} from "@/features/clubs/components/create-club-location-fields";

import type {
  LocationValue,
} from "@/features/clubs/components/location-picker";

type CreateClubFormProps = {
  action: (
    formData: FormData
  ) => void | Promise<void>;

  initialName?: string;

  initialLocation?: LocationValue | null;

  submitLabel?: string;
};

export function CreateClubForm({
  action,
  initialName = "",
  initialLocation = null,
  submitLabel = "Continue",
}: CreateClubFormProps) {
  const [nameError, setNameError] =
    useState(false);

  const [
    locationValid,
    setLocationValid,
  ] = useState(
    Boolean(initialLocation)
  );

  const [
    locationError,
    setLocationError,
  ] = useState(false);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    const formData =
      new FormData(event.currentTarget);

    const name =
      formData
        .get("name")
        ?.toString()
        .trim() ?? "";

    const hasName =
      name.length > 0;

    setNameError(!hasName);

    setLocationError(
      !locationValid
    );

    if (
      !hasName ||
      !locationValid
    ) {
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
      {/* Club name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Club name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialName}
          placeholder="e.g. Leeds Juniors FC"
          autoComplete="organization"
          aria-invalid={nameError}
          aria-describedby={
            nameError
              ? "club-name-error"
              : undefined
          }
          onChange={(event) => {
            if (
              event.target.value
                .trim()
                .length > 0
            ) {
              setNameError(false);
            }
          }}
          className={`h-14 w-full rounded-xl border bg-white px-4 text-slate-900 outline-none transition placeholder:text-slate-400 ${
            nameError
              ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-gray-200 focus:border-[#00B83F] focus:ring-2 focus:ring-green-100"
          }`}
        />

        {nameError && (
          <p
            id="club-name-error"
            role="alert"
            className="mt-2 text-sm text-red-500"
          >
            Please enter your club name.
          </p>
        )}
      </div>

      {/* Club location */}
      <CreateClubLocationFields
        initialLocation={
          initialLocation
        }
        hasError={
          locationError
        }
        onValidityChange={(
          valid
        ) => {
          setLocationValid(
            valid
          );

          if (valid) {
            setLocationError(
              false
            );
          }
        }}
        onEditing={() => {
          setLocationError(false);

          setLocationValid(false);
        }}
      />

      {/* Primary action */}
      <button
        type="submit"
        className="mt-3 flex h-14 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white transition hover:bg-[#009F37] active:scale-[0.98]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
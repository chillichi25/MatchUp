"use client";

import { useState } from "react";

import {
  LocationPicker,
  type LocationValue,
} from "@/features/clubs/components/location-picker";

type CreateClubLocationFieldsProps = {
  initialLocation?: LocationValue | null;

  hasError: boolean;

  onValidityChange: (
    valid: boolean
  ) => void;

  onEditing?: () => void;
};

export function CreateClubLocationFields({
  initialLocation = null,
  hasError,
  onValidityChange,
  onEditing,
}: CreateClubLocationFieldsProps) {
  const [location, setLocation] =
    useState<LocationValue | null>(
      initialLocation
    );

  function handleLocationChange(
    value: LocationValue | null
  ) {
    setLocation(value);

    // Only a location selected from
    // the suggestions counts as valid.
    onValidityChange(
      Boolean(value)
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        Club location
      </label>

      <p className="mb-3 text-sm text-slate-500">
        Search for your club&apos;s town or city.
      </p>

      <LocationPicker
        value={location}
        onChange={
          handleLocationChange
        }
        placeholder="Start typing a town or city"
        error={hasError}
        onInputChange={
          onEditing
        }
      />

      {hasError && (
        <p
          id="club-location-error"
          role="alert"
          className="mt-2 text-sm text-red-500"
        >
          Please select your club&apos;s location.
        </p>
      )}

      {/* Location data submitted to server */}
      <input
        type="hidden"
        name="city"
        value={
          location?.city ?? ""
        }
      />

      <input
        type="hidden"
        name="county"
        value={
          location?.county ?? ""
        }
      />

      <input
        type="hidden"
        name="country"
        value={
          location?.country ?? ""
        }
      />

      <input
        type="hidden"
        name="lat"
        value={
          location?.lat ?? ""
        }
      />

      <input
        type="hidden"
        name="lng"
        value={
          location?.lng ?? ""
        }
      />
    </div>
  );
}
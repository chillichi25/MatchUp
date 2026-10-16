"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateClub } from "@/features/clubs/services/club.service";
import {
  LocationPicker,
  type LocationValue,
} from "@/features/clubs/components/location-picker";

type EditClubFormProps = {
  clubId: string;
  initialName: string;
  initialCity: string;
  initialCounty: string;
  initialCountry: string;
  initialLat: number | null;
  initialLng: number | null;
};

export function EditClubForm({
  clubId,
  initialName,
  initialCity,
  initialCounty,
  initialCountry,
  initialLat,
  initialLng,
}: EditClubFormProps) {
    const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [name, setName] =
    useState(initialName);

  const [location, setLocation] =
  useState<LocationValue | null>({
    city: initialCity,
    county: initialCounty,
    country: initialCountry,
    lat: initialLat ?? 0,
lng: initialLng ?? 0,
    formatted: [
      initialCity,
      initialCounty,
      initialCountry,
    ]
      .filter(Boolean)
      .join(", "),
  });

  const [error, setError] =
    useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Club name is required.");
      return;
    }

    if (!location) {
  setError(
    "Please select a valid location from the suggestions."
  );
  return;
}

    startTransition(async () => {
  try {
    await updateClub({
  clubId,
  name: name.trim(),
  city: location.city,
  county: location.county,
  country: location.country,
  lat: location.lat,
  lng: location.lng,
});

toast.success("Changes saved");

router.replace("/profile");
  } catch (err) {
    console.error(
      "UPDATE CLUB ERROR:",
      err
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to update club."
    );
  }
});
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-gray-200 bg-white p-5"
    >
      {/* Club name */}
      <div>
        <label
          htmlFor="club-name"
          className="text-sm font-bold text-slate-900"
        >
          Club name
        </label>

        <input
          id="club-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          className="mt-3 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-[#00B83F]"
        />
      </div>

      {/* Location */}
<div className="mt-6">
  <label className="text-sm font-bold text-slate-900">
    Location
  </label>

  <p className="mt-1 text-sm text-slate-500">
    Search for your club&apos;s town or city.
  </p>

  <div className="mt-3">
    <LocationPicker
      value={location}
      onChange={setLocation}
      placeholder="Start typing a town or city"
    />
  </div>
</div>

      {/* Actions */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            router.push("/profile")
          }
          className="h-12 rounded-xl border border-gray-200 bg-white font-semibold text-slate-700 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="h-12 rounded-xl bg-[#00B83F] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type SetupData = {
  clubName: string;
  country: string;
  county: string;
  city: string;
  lat: string;
  lng: string;
  teamName: string;
  ageGroup: string;
  matchFormat: string;
  gender: string;
  level: string;
};

type CompleteSetupFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  data: SetupData;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#00B83F] font-semibold text-white shadow-sm transition hover:bg-[#009F37] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
    >
      {pending ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
            aria-hidden="true"
          />

          <span>Creating...</span>
        </>
      ) : (
        "Create club & team"
      )}
    </button>
  );
}

export function CompleteSetupForm({
  action,
  data,
}: CompleteSetupFormProps) {
  return (
    <form
      action={action}
      className="mt-8"
    >
      <input
        type="hidden"
        name="clubName"
        value={data.clubName}
      />

      <input
        type="hidden"
        name="country"
        value={data.country}
      />

      <input
        type="hidden"
        name="county"
        value={data.county}
      />

      <input
        type="hidden"
        name="city"
        value={data.city}
      />

      <input
        type="hidden"
        name="lat"
        value={data.lat}
      />

      <input
        type="hidden"
        name="lng"
        value={data.lng}
      />

      <input
        type="hidden"
        name="teamName"
        value={data.teamName}
      />

      <input
        type="hidden"
        name="ageGroup"
        value={data.ageGroup}
      />

      <input
        type="hidden"
        name="matchFormat"
        value={data.matchFormat}
      />

      <input
        type="hidden"
        name="gender"
        value={data.gender}
      />

      <input
        type="hidden"
        name="level"
        value={data.level}
      />

      <SubmitButton />
    </form>
  );
}
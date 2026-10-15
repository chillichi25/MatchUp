"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import { proposeMatchChangeAction } from "@/app/(dashboard)/matches/[id]/propose-change/actions";

type ProposeMatchChangeFormProps = {
  matchId: string;
  proposingTeamId: string;
  matchDate: string;
  kickOffTime: string;
  location: string;
};

export function ProposeMatchChangeForm({
  matchId,
  proposingTeamId,
  matchDate,
  kickOffTime,
  location,
}: ProposeMatchChangeFormProps) {
  const router = useRouter();

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(
      event.currentTarget
    );

    const result =
      await proposeMatchChangeAction({
        matchId,
        proposingTeamId,
        matchDate:
          formData.get("matchDate")?.toString() ??
          "",
        kickOffTime:
          formData
            .get("kickOffTime")
            ?.toString() ?? "",
        location:
          formData.get("location")?.toString() ??
          "",
      });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    router.push(`/matches/${matchId}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-7 space-y-5"
    >
      {/* Date */}

      <div>
        <label
          htmlFor="matchDate"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Date
        </label>

        <div className="relative">
          <CalendarDays
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="matchDate"
            name="matchDate"
            type="date"
            defaultValue={matchDate}
            required
            disabled={isSubmitting}
            className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-[#00B83F] disabled:opacity-60"
          />
        </div>
      </div>

      {/* Kick-off */}

      <div>
        <label
          htmlFor="kickOffTime"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Kick-off time
        </label>

        <div className="relative">
          <Clock3
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="kickOffTime"
            name="kickOffTime"
            type="time"
            defaultValue={kickOffTime}
            required
            disabled={isSubmitting}
            className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-[#00B83F] disabled:opacity-60"
          />
        </div>
      </div>

      {/* Location */}

      <div>
        <label
          htmlFor="location"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Location
        </label>

        <div className="relative">
          <MapPin
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="location"
            name="location"
            type="text"
            defaultValue={location}
            placeholder="Enter match location"
            required
            disabled={isSubmitting}
            className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-[#00B83F] disabled:opacity-60"
          />
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Sending..."
          : "Send Proposal"}
      </button>

      <Link
        href={`/matches/${matchId}`}
        className="flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white font-semibold text-slate-700"
      >
        Cancel
      </Link>
    </form>
  );
}
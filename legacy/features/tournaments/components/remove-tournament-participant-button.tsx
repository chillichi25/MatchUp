"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import { removeTournamentParticipant } from "@/features/tournaments/services/remove-tournament-participant.server";

type Props = {
  requestId: string;
  clubName: string;
  tournamentName: string;
};

export function RemoveTournamentParticipantButton({
  requestId,
  clubName,
  tournamentName,
}: Props) {
  const router = useRouter();

  const [confirming, setConfirming] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleRemove() {
    setError("");

    startTransition(async () => {
      try {
        await removeTournamentParticipant(
          requestId
        );

        router.refresh();
      } catch (err) {
        console.error(
          "REMOVE PARTICIPANT ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to remove this team."
        );
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() =>
          setConfirming(true)
        }
        className="mt-4 text-sm font-semibold text-red-600"
      >
        Remove team
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
      <p className="text-sm font-semibold text-slate-900">
        Remove {clubName}?
      </p>

      <p className="mt-1 text-sm leading-5 text-slate-600">
        This will remove the team from{" "}
        {tournamentName} and free one
        tournament space.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            setConfirming(false)
          }
          className="h-10 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          Keep team
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={handleRemove}
          className="h-10 rounded-xl bg-red-600 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending
            ? "Removing..."
            : "Remove"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
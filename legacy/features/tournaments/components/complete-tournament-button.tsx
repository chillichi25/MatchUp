"use client";

import {
  useState,
  useTransition,
} from "react";

type CompleteTournamentButtonProps = {
  tournamentName: string;
  completeAction: () => Promise<void>;
};

export function CompleteTournamentButton({
  tournamentName,
  completeAction,
}: CompleteTournamentButtonProps) {
  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleComplete() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await completeAction();

        setShowConfirmation(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to complete tournament."
        );
      }
    });
  }

  if (showConfirmation) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
        <h3 className="font-bold text-slate-900">
          Complete {tournamentName}?
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          This will mark the tournament as
          completed and make it read-only.
          Participating teams and tournament
          history will remain available.
        </p>

        {errorMessage && (
          <p className="mt-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              setShowConfirmation(false)
            }
            className="h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            Keep Active
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={handleComplete}
            className="h-11 rounded-xl bg-[#00B83F] text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending
              ? "Completing..."
              : "Complete"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        setShowConfirmation(true)
      }
      className="flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] font-semibold text-white"
    >
      Complete Tournament
    </button>
  );
}
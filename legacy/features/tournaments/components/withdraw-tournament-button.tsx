"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import { withdrawTournamentParticipant } from "@/features/tournaments/services/withdraw-tournament-participant.server";

type WithdrawTournamentButtonProps = {
  requestId: string;
  tournamentName: string;
};

export function WithdrawTournamentButton({
  requestId,
  tournamentName,
}: WithdrawTournamentButtonProps) {
  const router = useRouter();

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

  function handleWithdraw() {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await withdrawTournamentParticipant(
          requestId
        );

        setShowConfirmation(false);

        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to withdraw from tournament."
        );
      }
    });
  }

  if (showConfirmation) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-slate-900">
          Withdraw from{" "}
          {tournamentName}?
        </p>

        <p className="mt-2 text-sm leading-5 text-slate-600">
          Your team will be removed
          from the participating teams
          and the tournament space will
          become available again.
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
              setShowConfirmation(
                false
              )
            }
            className="h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            Keep place
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={
              handleWithdraw
            }
            className="h-11 rounded-xl bg-red-600 text-sm font-semibold text-white disabled:bg-red-300"
          >
            {isPending
              ? "Withdrawing..."
              : "Withdraw"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex h-12 w-full items-center justify-center rounded-xl bg-green-100 font-semibold text-green-700">
        Request Accepted
      </div>

      <button
        type="button"
        onClick={() =>
          setShowConfirmation(true)
        }
        className="flex h-12 w-full items-center justify-center rounded-xl border border-red-200 bg-white font-semibold text-red-600"
      >
        Withdraw from Tournament
      </button>
    </div>
  );
}
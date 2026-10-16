"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  acceptTournamentRequestAction,
  declineTournamentRequestAction,
} from "@/app/(dashboard)/tournaments/requests/actions";

type Props = {
  requestId: string;
};

export function TournamentRequestActions({
  requestId,
}: Props) {
  const [message, setMessage] =
    useState<string | null>(null);

  const [isError, setIsError] =
    useState(false);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleAccept() {
    setMessage(null);
    setIsError(false);

    startTransition(async () => {
      const formData =
        new FormData();

      formData.set(
        "requestId",
        requestId
      );

      const result =
        await acceptTournamentRequestAction(
          formData
        );

      if (!result?.success) {
        setIsError(true);
        setMessage(
          result?.message ??
            "Unable to accept request."
        );

        return;
      }

      setMessage(
        "Tournament request accepted."
      );
    });
  }

  function handleDecline() {
    setMessage(null);

    startTransition(async () => {
      const formData =
        new FormData();

      formData.set(
        "requestId",
        requestId
      );

      await declineTournamentRequestAction(
        formData
      );
    });
  }

  return (
  <div className="mt-4">
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={handleDecline}
        className="flex h-12 w-full items-center justify-center rounded-xl border border-red-200 font-semibold text-red-600 disabled:opacity-50"
      >
        Decline
      </button>

      <button
        type="button"
        disabled={isPending || isError}
        onClick={handleAccept}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] font-semibold text-white disabled:bg-slate-200 disabled:text-slate-500"
      >
        {isPending
          ? "Processing..."
          : isError
            ? "Tournament Full"
            : "Accept"}
      </button>
    </div>

    {message && (
      <div
        className={`mt-3 w-full rounded-xl px-4 py-3 ${
          isError
            ? "bg-amber-50"
            : "bg-green-50"
        }`}
      >
        <p
          className={`text-sm font-semibold ${
            isError
              ? "text-amber-700"
              : "text-green-700"
          }`}
        >
          {isError
            ? "Tournament full"
            : "Request accepted"}
        </p>

        <p
          className={`mt-1 text-sm leading-5 ${
            isError
              ? "text-amber-700"
              : "text-green-700"
          }`}
        >
          {message}
        </p>
      </div>
    )}
  </div>
);
}
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { respondToMatchChangeAction } from "@/app/(dashboard)/matches/[id]/actions";

type MatchChangeResponseActionsProps = {
  matchId: string;
  changeRequestId: string;
};

export function MatchChangeResponseActions({
  matchId,
  changeRequestId,
}: MatchChangeResponseActionsProps) {
  const router = useRouter();

  const [error, setError] =
    useState<string | null>(null);

  const [loadingAction, setLoadingAction] =
    useState<
      "accepted" | "declined" | null
    >(null);

  async function handleResponse(
    response: "accepted" | "declined"
  ) {
    if (loadingAction) {
      return;
    }

    setError(null);
    setLoadingAction(response);

    const result =
      await respondToMatchChangeAction({
        matchId,
        changeRequestId,
        response,
      });

    if (result.error) {
      setError(result.error);
      setLoadingAction(null);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-5 space-y-3">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={loadingAction !== null}
        onClick={() =>
          handleResponse("accepted")
        }
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingAction === "accepted"
          ? "Accepting..."
          : "Accept Changes"}
      </button>

      <button
        type="button"
        disabled={loadingAction !== null}
        onClick={() =>
          handleResponse("declined")
        }
        className="flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingAction === "declined"
          ? "Declining..."
          : "Decline"}
      </button>
    </div>
  );
}
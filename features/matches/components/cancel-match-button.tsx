"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  X,
} from "lucide-react";

import { cancelMatchAction } from "@/app/(dashboard)/matches/[id]/actions";

type CancelMatchButtonProps = {
  matchId: string;
  activeTeamId: string;
};

export function CancelMatchButton({
  matchId,
  activeTeamId,
}: CancelMatchButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] =
    useState(false);

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleCancel() {
    if (isCancelling) {
      return;
    }

    setError(null);
    setIsCancelling(true);

    const result = await cancelMatchAction({
      matchId,
      cancellingTeamId: activeTeamId,
    });

    if (result.error) {
      setError(result.error);
      setIsCancelling(false);
      return;
    }

    setIsOpen(false);

    router.refresh();
  }

  return (
    <>
      {/* Trigger */}

      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="flex h-12 w-full items-center justify-center rounded-2xl border border-red-200 bg-white font-semibold text-red-600"
      >
        Cancel Match
      </button>

      {/* Confirmation */}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            {/* Header */}

            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle
                  size={22}
                  className="text-red-600"
                />
              </div>

              <button
                type="button"
                disabled={isCancelling}
                onClick={() =>
                  setIsOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Cancel this match?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will cancel the confirmed
              fixture for both teams. Your
              opponent will be notified.
            </p>

            <p className="mt-2 text-sm font-medium text-red-600">
              This cannot be undone.
            </p>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancel}
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-red-600 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCancelling
                  ? "Cancelling..."
                  : "Yes, Cancel Match"}
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={() =>
                  setIsOpen(false)
                }
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-[13px] font-bold text-white transition active:scale-[0.98]"
              >
                Keep Match
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
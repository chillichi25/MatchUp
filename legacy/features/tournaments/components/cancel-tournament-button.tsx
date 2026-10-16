"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

type CancelTournamentButtonProps = {
  tournamentName: string;
  cancelAction: (formData: FormData) => Promise<void>;
};

export function CancelTournamentButton({
  tournamentName,
  cancelAction,
}: CancelTournamentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Initial button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 w-full rounded-xl border border-red-200 font-semibold text-red-600 transition hover:bg-red-50"
      >
        Cancel Tournament
      </button>

      {/* Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-6 sm:items-center sm:pb-0">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                <AlertTriangle
                  size={24}
                  className="text-red-600"
                />
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-slate-500"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Cancel tournament?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to cancel{" "}
              <span className="font-semibold text-slate-700">
                {tournamentName}
              </span>
              ? This will stop new requests and the tournament
              will be marked as cancelled.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-12 rounded-xl border border-gray-200 font-semibold text-slate-700"
              >
                Keep Tournament
              </button>

              <form action={cancelAction}>
                <button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-red-600 font-semibold text-white"
                >
                  Cancel Tournament
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { cancelFriendlyAction } from "@/app/(dashboard)/friendlies/[id]/actions";

type CancelMatchButtonProps = {
  friendlyId: string;
};

export function CancelMatchButton({
  friendlyId,
}: CancelMatchButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* CANCEL BUTTON */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-center rounded-full border border-red-200 bg-white text-[13px] font-semibold text-red-600 shadow-sm transition active:scale-[0.98]"
      >
        Cancel Match
      </button>

      {/* CONFIRMATION */}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 px-4 pb-5"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-match-title"
            onClick={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-md rounded-[24px] bg-white p-5 shadow-xl"
          >
            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="cancel-match-title"
                  className="text-[18px] font-bold text-slate-950"
                >
                  Cancel this match?
                </h2>

                <p className="mt-1.5 text-[13px] leading-5 text-slate-500">
                  This match will no longer be
                  available to other coaches.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition active:scale-[0.96]"
                aria-label="Close"
              >
                <X
                  size={18}
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* ACTIONS */}

            <div className="mt-5 space-y-3">
              <button
  type="button"
  onClick={() => setOpen(false)}
  className="flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-[13px] font-bold text-white shadow-sm transition active:scale-[0.98]"
>
  Keep Match
</button>

              <form
                action={
                  cancelFriendlyAction
                }
              >
                <input
                  type="hidden"
                  name="friendlyId"
                  value={friendlyId}
                />

                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center rounded-full border border-red-200 bg-white text-[13px] font-semibold text-red-600 transition active:scale-[0.98]"
                >
                  Cancel Match
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
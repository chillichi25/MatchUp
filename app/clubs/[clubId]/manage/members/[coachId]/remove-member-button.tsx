"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";

type RemoveMemberButtonProps = {
  memberName: string;
  clubName: string;
  action: () => Promise<void>;
};

export function RemoveMemberButton({
  memberName,
  clubName,
  action,
}: RemoveMemberButtonProps) {
  const [open, setOpen] = useState(false);
  const [isRemoving, setIsRemoving] =
    useState(false);

  async function handleRemove() {
    if (isRemoving) return;

    setIsRemoving(true);

    try {
      await action();
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex min-h-[76px] w-full items-center gap-4 rounded-2xl border border-red-100 bg-white px-4 text-left shadow-sm transition hover:bg-red-50 active:bg-red-50"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Trash2
            size={20}
            strokeWidth={1.9}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-red-600">
            Remove from club
          </p>

          <p className="mt-0.5 text-sm text-slate-500">
            Remove this member and team access
          </p>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-member-title"
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Trash2
                  size={22}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isRemoving}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>

            <h2
              id="remove-member-title"
              className="mt-5 text-xl font-bold text-slate-950"
            >
              Remove from club?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              <span className="font-semibold text-slate-700">
                {memberName}
              </span>{" "}
              will lose access to {clubName} and their
              assigned teams.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isRemoving}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={isRemoving}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRemoving
                  ? "Removing..."
                  : "Remove member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function RequestJoinButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#00B83F] font-semibold text-white shadow-sm transition hover:bg-[#009F37] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
    >
      {pending ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
            aria-hidden="true"
          />

          <span>Sending request...</span>
        </>
      ) : (
        "Request to join club"
      )}
    </button>
  );
}
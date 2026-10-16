"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { respondToMatchResultAction } from "@/app/(dashboard)/matches/[id]/result-actions";

type MatchResultResponseActionsProps = {
  matchId: string;
  resultRequestId: string;
};

export function MatchResultResponseActions({
  matchId,
  resultRequestId,
}: MatchResultResponseActionsProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] =
    useState<"accepted" | "declined" | null>(
      null
    );

  const [error, setError] =
    useState<string | null>(null);

  async function handleResponse(
    response: "accepted" | "declined"
  ) {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(response);

    const result =
      await respondToMatchResultAction({
        matchId,
        resultRequestId,
        response,
      });

    if (result.error) {
  setError(result.error);
  setIsSubmitting(null);
  return;
}

if (response === "accepted") {
  toast.success("Result confirmed");
} else {
  toast.success("Result disputed");
}

router.refresh();
  }

  return (
    <div className="mt-6 space-y-3">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={isSubmitting !== null}
        onClick={() =>
          handleResponse("accepted")
        }
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting === "accepted"
          ? "Confirming..."
          : "Confirm Result"}
      </button>

      <button
        type="button"
        disabled={isSubmitting !== null}
        onClick={() =>
          handleResponse("declined")
        }
        className="flex h-12 w-full items-center justify-center rounded-2xl border border-red-200 bg-white font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting === "declined"
          ? "Disputing..."
          : "Dispute Result"}
      </button>
    </div>
  );
}
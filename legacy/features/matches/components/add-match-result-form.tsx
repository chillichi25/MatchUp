"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { submitMatchResultAction } from "@/app/(dashboard)/matches/[id]/add-result/actions";

type AddMatchResultFormProps = {
  matchId: string;
  activeTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
};

export function AddMatchResultForm({
  matchId,
  activeTeamId,
  homeTeamName,
  awayTeamName,
}: AddMatchResultFormProps) {
  const router = useRouter();

  const [homeScore, setHomeScore] =
    useState("");

  const [awayScore, setAwayScore] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    if (
      homeScore === "" ||
      awayScore === ""
    ) {
      setError(
        "Please enter both scores."
      );
      return;
    }

    const parsedHomeScore =
      Number(homeScore);

    const parsedAwayScore =
      Number(awayScore);

    if (
      !Number.isInteger(
        parsedHomeScore
      ) ||
      !Number.isInteger(
        parsedAwayScore
      ) ||
      parsedHomeScore < 0 ||
      parsedAwayScore < 0
    ) {
      setError(
        "Please enter a valid score."
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const result =
      await submitMatchResultAction({
        matchId,
        submittingTeamId:
          activeTeamId,
        homeScore:
          parsedHomeScore,
        awayScore:
          parsedAwayScore,
      });

    if (result.error) {
  setError(result.error);
  setIsSubmitting(false);
  return;
}

toast.success("Result submitted");

router.push(
  `/matches/${matchId}`
);

router.refresh();
}

  return (
    <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
        <div className="min-w-0 text-center">
          <p className="mb-3 truncate text-sm font-semibold text-slate-700">
            {homeTeamName}
          </p>

          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={homeScore}
            disabled={isSubmitting}
            onChange={(event) =>
              setHomeScore(
                event.target.value
              )
            }
            placeholder="0"
            aria-label={`${homeTeamName} score`}
            className="h-20 w-full rounded-2xl border border-gray-200 bg-gray-50 text-center text-3xl font-bold text-slate-950 outline-none focus:border-[#00B83F] disabled:opacity-60"
          />
        </div>

        <div className="pb-6 text-xl font-bold text-slate-400">
          –
        </div>

        <div className="min-w-0 text-center">
          <p className="mb-3 truncate text-sm font-semibold text-slate-700">
            {awayTeamName}
          </p>

          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={awayScore}
            disabled={isSubmitting}
            onChange={(event) =>
              setAwayScore(
                event.target.value
              )
            }
            placeholder="0"
            aria-label={`${awayTeamName} score`}
            className="h-20 w-full rounded-2xl border border-gray-200 bg-gray-50 text-center text-3xl font-bold text-slate-950 outline-none focus:border-[#00B83F] disabled:opacity-60"
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        disabled={
          isSubmitting ||
          homeScore === "" ||
          awayScore === ""
        }
        onClick={handleSubmit}
        className="mt-8 flex h-12 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting
          ? "Submitting..."
          : "Submit Result"}
      </button>

      <Link
        href={`/matches/${matchId}`}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white font-semibold text-slate-700"
      >
        Cancel
      </Link>
    </section>
  );
}
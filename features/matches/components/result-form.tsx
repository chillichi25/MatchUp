"use client";

import { useState, useTransition } from "react";

import { saveMatchResult } from "../actions/save-match-result";

type ResultFormProps = {
  matchId: string;
};

export function ResultForm({
  matchId,
}: ResultFormProps) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  const [isPending, startTransition] =
    useTransition();

  return (
    <div className="space-y-5">

      <div>

        <label className="mb-2 block text-sm font-medium">
          Home Goals
        </label>

        <input
          type="number"
          min={0}
          value={homeScore}
          onChange={(e) =>
            setHomeScore(Number(e.target.value))
          }
          className="w-full rounded-xl border border-gray-300 p-3"
        />

      </div>

      <div>

        <label className="mb-2 block text-sm font-medium">
          Away Goals
        </label>

        <input
          type="number"
          min={0}
          value={awayScore}
          onChange={(e) =>
            setAwayScore(Number(e.target.value))
          }
          className="w-full rounded-xl border border-gray-300 p-3"
        />

      </div>

      <button
        onClick={() =>
          startTransition(async () => {
            await saveMatchResult({
              matchId,
              homeScore,
              awayScore,
            });
          })
        }
        disabled={isPending}
        className="w-full rounded-2xl bg-[#00B83F] py-3 font-semibold text-white disabled:opacity-50"
      >
        {isPending
          ? "Saving..."
          : "Save Result"}
      </button>

    </div>
  );
}
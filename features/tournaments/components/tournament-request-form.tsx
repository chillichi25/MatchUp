"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createTournamentRequest } from "@/features/tournaments/services/tournament-request.server";

type Props = {
  tournamentId: string;
  teamId: string;
};

export function TournamentRequestForm({
  tournamentId,
  teamId,
}: Props) {
  const router = useRouter();

  const [message, setMessage] = useState("");

  const [pending, startTransition] =
    useTransition();

  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createTournamentRequest({
  tournamentId,
  teamId,
  message,
});

router.replace(`/tournaments/${tournamentId}`);
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <label
        htmlFor="message"
        className="text-sm font-semibold text-slate-900"
      >
        Message
      </label>

      <textarea
        id="message"
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="We'd love to take part in this tournament."
        rows={4}
        className="mt-3 w-full resize-none rounded-xl bg-[#F5F6F8] px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-[#00B83F]"
      />

      <button
        type="submit"
        disabled={pending}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] font-semibold text-white disabled:opacity-60"
      >
        {pending
          ? "Sending request..."
          : "Send Request"}
      </button>
    </form>
  );
}
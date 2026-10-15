"use client";

import {
  useState,
  useTransition,
} from "react";

import { Megaphone } from "lucide-react";

import { sendTournamentUpdate } from "@/features/tournaments/services/send-tournament-update.server";
import { useRouter } from "next/navigation";

type TournamentUpdateFormProps = {
  tournamentId: string;
  participantCount: number;
};

export function TournamentUpdateForm({
  tournamentId,
  participantCount,
}: TournamentUpdateFormProps) {
    const router = useRouter();
  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const canSend =
    participantCount > 0 &&
    message.trim().length > 0 &&
    !isPending;

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (!message.trim()) {
      setError(
        "Please enter a message."
      );
      return;
    }

    startTransition(async () => {
      try {
        const result =
          await sendTournamentUpdate({
            tournamentId,
            message,
          });

        setMessage("");

        setSuccess(
          `Update sent to ${
            result.recipients
          } participating ${
            result.recipients === 1
              ? "coach"
              : "coaches"
          }.`
        );
        router.refresh();

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to send tournament update."
        );
      }
    });
  }

  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Megaphone
          size={20}
          className="text-blue-600"
        />

        <h2 className="font-bold text-slate-900">
          Tournament update
        </h2>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Send an announcement to all teams
        currently participating in this
        tournament.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5"
      >
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(
              event.target.value
            );

            if (error) {
              setError(null);
            }

            if (success) {
              setSuccess(null);
            }
          }}
          rows={6}
          maxLength={500}
          placeholder="For example: Please arrive 30 minutes before your first match. Parking is available behind the sports centre."
          disabled={
            participantCount === 0 ||
            isPending
          }
          className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#00B83F] disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-2 flex items-center justify-between gap-4">
          <div>
            {error ? (
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>
            ) : success ? (
              <p className="text-sm font-medium text-green-600">
                {success}
              </p>
            ) : null}
          </div>

          <p className="shrink-0 text-xs text-slate-400">
            {message.length}/500
          </p>
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#00B83F] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isPending
            ? "Sending..."
            : "Send Update"}
        </button>
      </form>
    </section>
  );
}
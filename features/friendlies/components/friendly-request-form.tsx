"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { createFriendlyRequest } from "@/features/friendlies/services/friendly-request.server";

type FriendlyRequestFormProps = {
  friendlyId: string;
  requestingTeamId: string;
};

export function FriendlyRequestForm({
  friendlyId,
  requestingTeamId,
}: FriendlyRequestFormProps) {
  const router = useRouter();

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);

    try {
      await createFriendlyRequest({
        friendlyId,
        requestingTeamId,
        message,
      });


      router.push(
        `/friendlies/${friendlyId}/request/sent`,
      );
    } catch (error) {
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("The match request could not be sent.");
  }
} finally {
  setLoading(false);
}
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6"
    >
      {/* MESSAGE */}

      <label
        htmlFor="message"
        className="text-sm font-medium text-slate-900"
      >
        Message{" "}
        <span className="font-normal text-slate-400">
          (optional)
        </span>
      </label>

      <textarea
        id="message"
        value={message}
        onChange={(event) =>
          setMessage(event.target.value)
        }
        rows={4}
        placeholder="Hi, we'd be interested in playing this match."
        className="mt-3 w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-[13.5px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00B83F] focus:ring-2 focus:ring-[#00B83F]/10"
      />

      {/* SUBMIT */}

      <button
  type="submit"
  disabled={loading}
  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#00B83F] font-semibold text-white transition hover:bg-[#009F37] disabled:cursor-not-allowed disabled:opacity-60"
>
  <Send size={19} />

  {loading
    ? "Sending Request..."
    : "Send Request"}
</button>

      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        The other coach can accept or decline your request.
      </p>
    </form>
  );
}
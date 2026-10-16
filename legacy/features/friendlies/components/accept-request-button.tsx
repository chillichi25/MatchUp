"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { acceptFriendlyRequest } from "@/features/friendlies/services/accept-friendly.server";
import { createMatchFromRequest } from "@/features/friendlies/services/create-match.server";

type Props = {
  requestId: string;
};

export function AcceptRequestButton({
  requestId,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await acceptFriendlyRequest(
              requestId
            );

            const match =
              await createMatchFromRequest(
                requestId
              );

            toast.success("Match confirmed");

            router.push(
              `/matches/${match.id}`
            );
          } catch (error) {
            console.error(error);

            toast.error(
              "The request could not be accepted."
            );
          }
        })
      }
      className="h-11 w-full rounded-xl bg-[#00B83F] font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Accepting..." : "Accept"}
    </button>
  );
}
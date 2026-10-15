"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { declineFriendlyRequestAction } from "@/app/(dashboard)/friendlies/requests/actions";

type Props = {
  requestId: string;
};

export function DeclineRequestButton({
  requestId,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  function handleDecline() {
    startTransition(async () => {
      try {
        const formData = new FormData();

        formData.set(
          "requestId",
          requestId
        );

        await declineFriendlyRequestAction(
          formData
        );

        toast.success("Request declined");

        router.refresh();
      } catch (error) {
        console.error(error);

        toast.error(
          "The request could not be declined."
        );
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleDecline}
      className="h-11 w-full rounded-xl border border-red-200 font-semibold text-red-600 transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? "Declining..."
        : "Decline"}
    </button>
  );
}
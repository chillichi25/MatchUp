"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cancelFriendlyRequestAction } from "@/app/(dashboard)/friendlies/requests/actions";

type Props = {
  requestId: string;
};

export function CancelRequestButton({
  requestId,
}: Props) {
  const router = useRouter();

  const [pending, startTransition] =
    useTransition();

  function handleCancel() {
    startTransition(async () => {
      try {
        const formData = new FormData();

        formData.set(
          "requestId",
          requestId
        );

        await cancelFriendlyRequestAction(
          formData
        );

        toast.success("Request cancelled");

        router.refresh();
      } catch (error) {
        console.error(error);

        toast.error(
          "The request could not be cancelled."
        );
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleCancel}
      className="flex h-11 w-full items-center justify-center rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? "Cancelling..."
        : "Cancel Request"}
    </button>
  );
}
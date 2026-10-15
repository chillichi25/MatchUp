"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TeamUpdatedToastProps = {
  clubId: string;
  teamId: string;
};

export function TeamUpdatedToast({
  clubId,
  teamId,
}: TeamUpdatedToastProps) {
  const router = useRouter();

  useEffect(() => {
    toast.success("Changes saved");

    router.replace(
      `/clubs/${clubId}/manage/teams/${teamId}`,
      {
        scroll: false,
      }
    );
  }, [clubId, teamId, router]);

  return null;
}
import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/features/auth/providers/auth-provider";
import { supabase } from "@/lib/supabase/client";

import type { ClubSummary, ClubTeam } from "../types";

export type PendingJoinRequest = {
  clubId: string;
  club: ClubSummary;
  teams: (ClubTeam & { membershipId: string })[];
};

export function useMyJoinRequests() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["club", "my-join-requests", userId],
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: "always",

    queryFn: async (): Promise<PendingJoinRequest[]> => {
      const { data, error } = await supabase.rpc(
        "get_my_pending_join_requests"
      );

      if (error) {
        console.error("GET MY JOIN REQUESTS ERROR:", error);

        throw new Error(
          "We couldn't load your requests. Please try again."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "We couldn't load your requests. Please try again."
        );
      }

      return data as unknown as PendingJoinRequest[];
    },
  });
}
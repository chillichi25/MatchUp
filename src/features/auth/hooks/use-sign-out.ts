import { useCallback } from "react";

import { queryClient } from "@/lib/query/query-client";

import { signOut as signOutRequest } from "../services/auth.service";

/**
 * Signing out must not leave private data on the device. We clear the TanStack
 * Query cache (all cached server reads) after Supabase clears the session.
 */
export function useSignOut() {
  return useCallback(async () => {
    await signOutRequest();
    queryClient.clear();
  }, []);
}

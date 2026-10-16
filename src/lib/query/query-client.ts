import { QueryClient } from "@tanstack/react-query";

/**
 * Server state stays authoritative in Supabase. TanStack Query only caches
 * server responses; it never becomes a second source of truth. Query keys are
 * scoped by account and represented team so a team switch or account change
 * never reuses another scope's private view.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Session } from "@supabase/supabase-js";

import { queryClient } from "@/lib/query/query-client";
import { supabase } from "@/lib/supabase/client";

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        setSession(data.session);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        setSession(nextSession);

        // An expired or revoked session must not leave private cached
        // content visible. Drop all cached server reads on sign out.
        if (event === "SIGNED_OUT") {
          queryClient.clear();
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ session, isLoading }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  return useContext(AuthContext);
}

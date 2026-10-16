const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Startup configuration validation.
 *
 * The Supabase URL and publishable anon key are client-safe values, but the
 * app must not attempt to run without them. Failing loudly at startup is
 * preferable to issuing requests against an empty endpoint.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "MatchUp configuration error: EXPO_PUBLIC_SUPABASE_URL and " +
      "EXPO_PUBLIC_SUPABASE_ANON_KEY must be set. See .env.example."
  );
}

export const env = {
  supabaseUrl,
  supabaseAnonKey,
} as const;

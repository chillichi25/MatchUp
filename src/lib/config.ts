const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const revenueCatIosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "";
const revenueCatAndroidApiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "";
const termsUrl = process.env.EXPO_PUBLIC_TERMS_URL ?? "";
const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL ?? "";

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
  revenueCatIosApiKey,
  revenueCatAndroidApiKey,
  termsUrl,
  privacyUrl,
} as const;

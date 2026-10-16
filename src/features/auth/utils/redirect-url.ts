import * as Linking from "expo-linking";

/**
 * Deep link Supabase redirects back to after email verification or password
 * reset. Must be allow-listed in the Supabase project's redirect URLs.
 * Resolves to `matchup://callback` in a native build and to the Expo Go /
 * dev-client equivalent during development.
 */
export const authRedirectUrl = Linking.createURL("callback");

/**
 * Same callback endpoint but tagged so the callback route can tell a password
 * recovery link apart from an email verification link.
 */
export const passwordRecoveryRedirectUrl = Linking.createURL("callback", {
  queryParams: { flow: "recovery" },
});

import { supabase } from "@/lib/supabase/client";

import {
  authRedirectUrl,
  passwordRecoveryRedirectUrl,
} from "../utils/redirect-url";

export async function signUp(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  return await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: authRedirectUrl,
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
      },
    },
  });
}

export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function resendVerificationEmail(email: string) {
  return await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: {
      emailRedirectTo: authRedirectUrl,
    },
  });
}

export async function requestPasswordReset(email: string) {
  return await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: passwordRecoveryRedirectUrl,
  });
}

export async function updatePassword(password: string) {
  return await supabase.auth.updateUser({ password });
}

export async function exchangeCodeForSession(code: string) {
  return await supabase.auth.exchangeCodeForSession(code);
}

export async function verifyEmailOtp(tokenHash: string, type: "signup") {
  return await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
}

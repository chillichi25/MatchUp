import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");

  // Supabase returned a verification error
  if (error) {
    const url = new URL("/verify-email", origin);

    url.searchParams.set(
      "error",
      errorCode ?? "verification_failed"
    );

    return NextResponse.redirect(url);
  }

  // No authentication code was returned
  if (!code) {
    const url = new URL("/verify-email", origin);

    url.searchParams.set("error", "verification_failed");

    return NextResponse.redirect(url);
  }

  const supabase = await createClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const url = new URL("/verify-email", origin);

    url.searchParams.set("error", "verification_failed");

    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(
    `${origin}/verify-email?verified=true`
  );
}
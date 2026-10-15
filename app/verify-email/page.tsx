import Image from "next/image";
import Link from "next/link";
import {
  CircleCheck,
  CircleAlert,
  MailCheck,
} from "lucide-react";

import { ResendVerificationForm } from "@/features/auth/components/resend-verification-form";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    verified?: string;
    error?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { verified, error } = await searchParams;

  const isVerified = verified === "true";
  const hasError = Boolean(error);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6">
        {/* Logo */}
        <div className="flex justify-center pt-12">
          <Link href="/" aria-label="Go to MatchUp home">
            <Image
              src="/images/matchup-logo.png"
              alt="MatchUp"
              width={220}
              height={120}
              priority
              className="h-auto w-[150px]"
            />
          </Link>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center pb-32">
          {isVerified ? (
            /* VERIFIED */
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CircleCheck
                  className="h-8 w-8 text-[#00B83F]"
                  strokeWidth={2}
                />
              </div>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
  Email verified
</h1>

<p className="mx-auto mt-3 max-w-[300px] text-sm leading-6 text-slate-500">
  Your email has been verified. Continue to set up your MatchUp account.
</p>

              <Link
  href="/onboarding"
  className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white transition hover:bg-[#009F37] active:scale-[0.98]"
>
  Continue
</Link>
            </div>
          ) : hasError ? (
            /* EXPIRED / INVALID */
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <CircleAlert
                  className="h-8 w-8 text-red-500"
                  strokeWidth={2}
                />
              </div>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
  Link expired
</h1>

              <p className="mx-auto mt-3 max-w-[310px] text-sm leading-6 text-slate-500">
  This verification link is no longer valid. Enter your email and
  we'll send you a new one.
</p>

              <ResendVerificationForm />

              <Link
                href="/login"
                className="mt-6 inline-block text-sm font-semibold text-slate-900 underline decoration-slate-400 underline-offset-2 transition hover:text-[#00B83F]"
              >
                Back to log in
              </Link>
            </div>
          ) : (
            /* WAITING FOR VERIFICATION */
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <MailCheck
                  className="h-8 w-8 text-[#00B83F]"
                  strokeWidth={2}
                />
              </div>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                Check your email
              </h1>

              <p className="mx-auto mt-3 max-w-[310px] text-sm leading-6 text-slate-500">
  We've sent a verification link to your email. Open it to confirm
  your address and finish creating your account.
</p>

              <p className="mt-8 text-sm text-slate-500">
                Already verified?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-slate-900 underline decoration-slate-400 underline-offset-2 transition hover:text-[#00B83F]"
                >
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

export default function SetupCompletePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-10">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <Image
          src="/images/matchup-logo.png"
          alt="MatchUp"
          width={220}
          height={120}
          priority
          className="mx-auto h-auto w-[190px]"
        />

        {/* Success card */}
        <section className="mt-10 rounded-3xl border border-gray-200 bg-white px-7 py-8 shadow-sm">
          {/* Success icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-[#00B83F]">
            <Check
              size={32}
              strokeWidth={2.25}
              aria-hidden="true"
            />
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
            Your club is ready!
          </h1>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
            Your club and team are ready. Start finding matches,
            tournaments and other teams on MatchUp.
          </p>

          {/* Primary action */}
          <Link
            href="/dashboard"
            className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white shadow-sm transition hover:bg-[#009F37] active:scale-[0.98]"
          >
            Go to dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}
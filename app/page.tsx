import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#F8FAFC]">
      {/* Decorative top-left shape */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[75px] -top-[105px] h-[230px] w-[230px] rounded-full bg-[#E4F9EB]"
      />

      {/* Decorative right shape */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[175px] top-[165px] h-[360px] w-[360px] rounded-full bg-[#EAFBF0]"
      />

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
        {/* Logo */}
        <div className="flex justify-center pt-[100px]">
          <Image
            src="/images/matchup-logo.png"
            alt="MatchUp"
            width={240}
            height={140}
            priority
            className="h-auto w-[190px]"
          />
        </div>

        {/* Heading */}
        <div className="mt-25 text-center">
          <h1 className="whitespace-nowrap text-[26px] font-bold tracking-[-0.7px] text-[#07192D]">
            Find. Match.{" "}
            <span className="text-[#00B83F]">
              Play.
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-[290px] text-[15px] leading-[22px] text-slate-500">
            Find and organise matches and
            <br />
            tournaments across all sports.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-15 w-full">
          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-sm font-semibold text-white shadow-sm transition hover:bg-[#00A638] active:scale-[0.99]"
          >
            Get Started
          </Link>

          <p className="mt-5 text-center text-[13px] text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#00B83F] transition hover:text-[#00A638]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Sports image */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[175px] overflow-hidden">
        <Image
          src="/images/matchup-sports.png"
          alt=""
          fill
          priority
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover object-center"
        />

        {/* Fade image smoothly into page */}
        <div className="absolute inset-x-0 top-0 h-[55px] bg-gradient-to-b from-[#F8FAFC] via-[#F8FAFC]/60 to-transparent" />
      </div>
    </main>
  );
}
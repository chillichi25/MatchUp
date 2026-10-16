"use client";

import { Check } from "lucide-react";
import Link from "next/link";



export function PhoneCodeVerificationForm() {
  return (
    <div className="min-h-dvh w-full bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-md px-7 pb-6 pt-5">
        {/* Top navigation */}
        <div className="relative flex h-12 items-center justify-center">
          <span className="text-[17px] font-bold text-[#07192D]">
            Verify phone
          </span>
        </div>

        {/* Success content */}
        <div className="mt-[140px] flex flex-col items-center text-center">
          {/* Success icon */}
<div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#EAFBF0]">
  <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full border border-[#00B83F]/15 bg-white shadow-sm">
    <Check
      className="h-7 w-7 text-[#00B83F]"
      strokeWidth={3}
    />
  </div>
</div>

          {/* Heading */}
          <h1 className="mt-6 text-[28px] font-bold tracking-[-0.6px] text-slate-900">
            Phone verified
          </h1>

          {/* Supporting text */}
          <p className="mt-2 text-[15px] text-slate-400">
            Your number has been verified.
          </p>

          {/* Continue */}
          <Link
            href="/clubs"
            className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-sm font-semibold text-white shadow-sm transition hover:bg-[#00A638] active:scale-[0.99]"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { Check } from "lucide-react";
import Link from "next/link";

export function PhoneVerified() {
  return (
    <div className="min-h-dvh w-full bg-[#F8FAFC]">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-7 pb-8 pt-5">
        {/* Page title */}
        <div className="flex h-12 items-center justify-center">
          <span className="text-[17px] font-bold text-[#07192D]">
            Verify phone
          </span>
        </div>

        {/* Success content */}
        <div className="flex flex-1 flex-col items-center justify-center">
          {/* Success icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <Check
              className="h-8 w-8 text-[#00B83F]"
              strokeWidth={2.4}
            />
          </div>

          <h1 className="mt-6 text-center text-[28px] font-bold tracking-[-0.6px] text-slate-900">
            Phone verified
          </h1>

        </div>

        {/* Continue */}
        <Link
          href="/clubs"
          className="flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-sm font-semibold text-white shadow-sm transition hover:bg-[#00A638] active:scale-[0.99]"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
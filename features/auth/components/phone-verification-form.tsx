"use client";

import Link from "next/link";
import { ChevronLeft, Smartphone } from "lucide-react";

export function PhoneVerificationForm() {
  return (
    <div className="min-h-dvh w-full bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-md px-7 pb-6 pt-5">
        {/* Top navigation */}
        <div className="relative flex h-12 items-center justify-center">
          <Link
            href="/register"
            aria-label="Back to register"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[#07192D] shadow-sm transition hover:border-gray-300 hover:text-[#00B83F]"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </Link>

          <span className="text-[17px] font-bold text-[#07192D]">
            Verify phone
          </span>
        </div>

        {/* Heading */}
        <div className="mt-5 text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.6px] text-slate-900">
            Verify your phone
          </h1>

          <p className="mt-2 text-[15px] text-slate-400">
            We&apos;ll send you a 6-digit verification code.
          </p>
        </div>

        {/* Phone form */}
        <div className="mt-8">
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-slate-800"
          >
            Mobile number
          </label>

          <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-white px-4 transition focus-within:border-[#00B83F] focus-within:ring-2 focus-within:ring-[#00B83F]/10">
            <Smartphone
              size={19}
              strokeWidth={1.8}
              className="shrink-0 text-slate-400"
            />

            <div className="ml-4 flex shrink-0 items-center border-r border-gray-200 pr-3 text-sm font-medium text-slate-700">
              +44
            </div>

            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Mobile number"
              className="ml-3 h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <Link
            href="/register/phone/verify"
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-sm font-semibold text-white shadow-sm transition hover:bg-[#00A638] active:scale-[0.99]"
          >
            Send code
          </Link>
        </div>
      </div>
    </div>
  );
}
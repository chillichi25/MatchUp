"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { signIn } from "@/features/auth/services/auth.service";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-[#F8FAFC]">
      {/* Main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-7 pb-8 pt-5">
        {/* Top navigation */}
        <div className="relative flex h-12 items-center justify-center">
          <Link
            href="/"
            aria-label="Back to welcome"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[#07192D] shadow-sm transition hover:border-gray-300 hover:text-[#00B83F]"
          >
            <ChevronLeft
              className="h-5 w-5"
              strokeWidth={2}
            />
          </Link>

          <span className="text-[17px] font-bold text-[#07192D]">
            Log in
          </span>
        </div>

        {/* Heading */}
        <div className="mt-3 text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.6px] text-slate-900">
            Welcome back
          </h1>

          <p className="mt-2 text-[15px] text-slate-400">
            Log in to continue to MatchUp
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="mt-7"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Email
            </label>

            <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-white px-4 transition focus-within:border-[#00B83F] focus-within:ring-2 focus-within:ring-[#00B83F]/10">
              <Mail
                size={19}
                strokeWidth={1.8}
                className="shrink-0 text-slate-400"
              />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="name@example.com"
                autoComplete="email"
                required
                className="ml-4 h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-5">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Password
            </label>

            <div className="flex h-14 items-center rounded-xl border border-gray-200 bg-white px-4 transition focus-within:border-[#00B83F] focus-within:ring-2 focus-within:ring-[#00B83F]/10">
              <LockKeyhole
                size={19}
                strokeWidth={1.8}
                className="shrink-0 text-slate-400"
              />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Password"
                autoComplete="current-password"
                required
                className="ml-4 h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff
                    size={20}
                    strokeWidth={1.8}
                  />
                ) : (
                  <Eye
                    size={20}
                    strokeWidth={1.8}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {errorMessage}
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-sm font-semibold text-white shadow-sm transition hover:bg-[#00A638] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Logging in..."
              : "Log in"}
          </button>

          {/* Forgot password */}
          <div className="mt-5 text-center">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#00B83F] transition hover:text-[#00A638]"
            >
              Forgot password?
            </Link>
          </div>

          {/* Divider */}
          <div className="mt-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-xs text-slate-400">
              or
            </span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>
        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#00B83F] transition hover:text-[#00A638]"
          >
            Register
          </Link>
        </p>
      </div>

      {/* Decorative bottom waves */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[85px] w-full overflow-hidden"
      >
        <div className="absolute -bottom-[75px] -left-[80px] h-[145px] w-[330px] rotate-[7deg] rounded-[50%] bg-[#EAFBF0]" />

        <div className="absolute -bottom-[68px] -right-[90px] h-[145px] w-[340px] -rotate-[7deg] rounded-[50%] bg-[#E4F9EB]/80" />
      </div>
    </div>
  );
}
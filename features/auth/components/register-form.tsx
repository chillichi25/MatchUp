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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  RegisterSchema,
} from "../schemas/register.schema";
import { signUp } from "../services/auth.service";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterSchema) {
    try {
      setLoading(true);
      setErrorMessage("");

      const { error } = await signUp(
        data.firstName,
        data.lastName,
        data.email,
        data.password
      );

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push("/register/phone");
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Something went wrong while creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-[#F8FAFC]">
      <div className="mx-auto flex h-full w-full max-w-md flex-col px-7 pb-3 pt-3">
        {/* Top navigation */}
        <div className="relative flex h-12 shrink-0 items-center justify-center">
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
            Register
          </span>
        </div>

        {/* Heading */}
        <div className="mt-3 shrink-0 text-center">
          <h1 className="text-[26px] font-bold tracking-[-0.6px] text-slate-900">
            Create your account
          </h1>

          <p className="mt-1 text-[14px] text-slate-400">
            Get started and find your next match.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4"
        >
          {/* First name */}
          <div>
            <Label
              htmlFor="firstName"
              className="mb-1.5 block text-sm font-medium text-slate-800"
            >
              First name
            </Label>

            <Input
              id="firstName"
              placeholder="First name"
              autoComplete="given-name"
              {...register("firstName")}
              className={`h-12 rounded-xl bg-white px-4 text-sm text-slate-900 shadow-none placeholder:text-slate-400 ${
                errors.firstName
                  ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-2 focus-visible:ring-red-100"
                  : "border-gray-200 focus-visible:border-[#00B83F] focus-visible:ring-2 focus-visible:ring-[#00B83F]/10"
              }`}
            />

            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last name */}
          <div className="mt-3">
            <Label
              htmlFor="lastName"
              className="mb-1.5 block text-sm font-medium text-slate-800"
            >
              Last name
            </Label>

            <Input
              id="lastName"
              placeholder="Last name"
              autoComplete="family-name"
              {...register("lastName")}
              className={`h-12 rounded-xl bg-white px-4 text-sm text-slate-900 shadow-none placeholder:text-slate-400 ${
                errors.lastName
                  ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-2 focus-visible:ring-red-100"
                  : "border-gray-200 focus-visible:border-[#00B83F] focus-visible:ring-2 focus-visible:ring-[#00B83F]/10"
              }`}
            />

            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mt-3">
            <Label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-800"
            >
              Email
            </Label>

            <div
              className={`flex h-12 items-center rounded-xl border bg-white px-4 transition focus-within:ring-2 ${
                errors.email
                  ? "border-red-400 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-gray-200 focus-within:border-[#00B83F] focus-within:ring-[#00B83F]/10"
              }`}
            >
              <Mail
                size={18}
                strokeWidth={1.8}
                className="shrink-0 text-slate-400"
              />

              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                {...register("email")}
                className="ml-4 h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>

            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mt-3">
            <Label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-800"
            >
              Password
            </Label>

            <div
              className={`flex h-12 items-center rounded-xl border bg-white px-4 transition focus-within:ring-2 ${
                errors.password
                  ? "border-red-400 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-gray-200 focus-within:border-[#00B83F] focus-within:ring-[#00B83F]/10"
              }`}
            >
              <LockKeyhole
                size={18}
                strokeWidth={1.8}
                className="shrink-0 text-slate-400"
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                autoComplete="new-password"
                {...register("password")}
                className="ml-4 h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff
                    size={19}
                    strokeWidth={1.8}
                  />
                ) : (
                  <Eye
                    size={19}
                    strokeWidth={1.8}
                  />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="mt-3">
            <Label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-sm font-medium text-slate-800"
            >
              Confirm password
            </Label>

            <div
              className={`flex h-12 items-center rounded-xl border bg-white px-4 transition focus-within:ring-2 ${
                errors.confirmPassword
                  ? "border-red-400 focus-within:border-red-400 focus-within:ring-red-100"
                  : "border-gray-200 focus-within:border-[#00B83F] focus-within:ring-[#00B83F]/10"
              }`}
            >
              <LockKeyhole
                size={18}
                strokeWidth={1.8}
                className="shrink-0 text-slate-400"
              />

              <input
                id="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                placeholder="Repeat your password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className="ml-4 h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 transition hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <EyeOff
                    size={19}
                    strokeWidth={1.8}
                  />
                ) : (
                  <Eye
                    size={19}
                    strokeWidth={1.8}
                  />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Error */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600"
            >
              {errorMessage}
            </div>
          )}

          {/* Next button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#00B83F] text-sm font-semibold text-white shadow-sm transition hover:bg-[#00A638] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Next"}
          </button>
        </form>

        {/* Login */}
        <p className="mt-3 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#00B83F] transition hover:text-[#00A638]"
          >
            Log in
          </Link>
        </p>

        {/* Legal */}
        <p className="mx-auto mt-2 max-w-xs text-center text-[11px] leading-[15px] text-slate-500">
          By creating an account, you agree to MatchUp&apos;s{" "}
          <Link
            href="/terms"
            className="text-slate-600 underline underline-offset-2"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-slate-600 underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
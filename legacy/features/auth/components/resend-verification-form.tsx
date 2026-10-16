"use client";

import { FormEvent, useState } from "react";

import { resendVerificationEmail } from "@/features/auth/services/auth.service";

export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await resendVerificationEmail(email);

      if (error) {
        if (
          error.message
            .toLowerCase()
            .includes("rate limit")
        ) {
          setErrorMessage(
            "Too many verification emails have been requested. Please wait a little while and try again."
          );
        } else {
          setErrorMessage(
            "We couldn't send the verification email. Please try again."
          );
        }

        return;
      }

      setMessage(
        "Verification email sent. Please check your inbox."
      );
    } catch {
      setErrorMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-4 text-left"
    >
      <div>
        <label
          htmlFor="verification-email"
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Email
        </label>

        <input
          id="verification-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="coach@email.com"
          autoComplete="email"
          className="h-14 w-full rounded-xl border border-gray-200 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00B83F] focus:ring-2 focus:ring-green-100"
        />
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {errorMessage}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#00B83F] font-semibold text-white transition hover:bg-[#009F37] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Sending..."
          : "Resend verification email"}
      </button>
    </form>
  );
}
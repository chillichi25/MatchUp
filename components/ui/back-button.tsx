"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm"
      aria-label="Go back"
    >
      <ArrowLeft size={22} />
    </button>
  );
}
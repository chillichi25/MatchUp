import { formatLongDate } from "@/features/dashboard/utils/format-date";

/** `HH:mm` for a message timestamp (Hermes-safe, no Intl). */
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/** e.g. "Fri 16 Oct · 14:30" for a match header. */
export function formatMatchSchedule(
  matchDate: string | null,
  kickOffTime: string | null
): string {
  const date = matchDate ? formatLongDate(matchDate) : "";
  const time = kickOffTime?.slice(0, 5) ?? "";
  return [date, time].filter(Boolean).join(" · ");
}

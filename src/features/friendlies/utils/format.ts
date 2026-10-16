import {
  formatLongDate,
  getDateParts,
} from "@/features/dashboard/utils/format-date";

import { shortTime } from "@/features/matches/utils/match-time";

export { getDateParts, formatLongDate };

const MONTHS_TITLE = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WEEKDAYS_TITLE = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

/** e.g. "Sun 16 Oct 2026" — used where the year removes ambiguity. */
export function formatDateWithYear(value: string): string {
  const date = parseDateOnly(value);
  return `${WEEKDAYS_TITLE[date.getDay()]} ${date.getDate()} ${
    MONTHS_TITLE[date.getMonth()]
  } ${date.getFullYear()}`;
}

/** e.g. "14:30", or "" when no kick-off time is set. */
export function formatKickOff(kickOff: string | null | undefined): string {
  return shortTime(kickOff) ?? "";
}

/** e.g. "3.4 mi" / "<0.1 mi", or null when no distance is known. */
export function formatDistance(miles: number | null | undefined): string | null {
  if (miles === null || miles === undefined) {
    return null;
  }

  if (miles < 0.1) {
    return "<0.1 mi";
  }

  return `${miles.toFixed(1)} mi`;
}

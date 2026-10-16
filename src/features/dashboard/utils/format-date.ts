const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const WEEKDAYS_TITLE = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;
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

export type DateParts = {
  weekday: string;
  day: string;
  month: string;
};

/**
 * Parses a `YYYY-MM-DD` date-only value as local time so the rendered day is
 * never shifted by timezone conversion.
 */
function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function getDateParts(value: string): DateParts {
  const date = parseDateOnly(value);
  return {
    weekday: WEEKDAYS[date.getDay()],
    day: String(date.getDate()),
    month: MONTHS[date.getMonth()],
  };
}

/** e.g. "Fri 16 Oct" */
export function formatLongDate(value: string): string {
  const date = parseDateOnly(value);
  return `${WEEKDAYS_TITLE[date.getDay()]} ${date.getDate()} ${
    MONTHS_TITLE[date.getMonth()]
  }`;
}

/** e.g. "16 Oct, 14:30" for a notification timestamp. */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getDate()} ${
    MONTHS_TITLE[date.getMonth()]
  }, ${hours}:${minutes}`;
}

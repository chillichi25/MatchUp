/**
 * Match/friendly date and time helpers that avoid `Intl` (Hermes-safe).
 *
 * Times are treated as UTC. The UK is within one hour of UTC year round, so the
 * "is this slot in the future" checks remain correct to the minute for a UK
 * user without pulling in timezone data the runtime may not ship with.
 */

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** `YYYY-MM-DD` for the current UTC day. */
export function todayIso(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(
    now.getUTCDate()
  )}`;
}

/** `HH:mm:ss` for the current UTC time. */
export function nowTimeIso(): string {
  const now = new Date();
  return `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(
    now.getUTCSeconds()
  )}`;
}

/** True when the given date/time combination is strictly in the past. */
export function isPastSlot(
  matchDate: string,
  kickOff: string | null | undefined
): boolean {
  if (!matchDate) {
    return false;
  }

  const today = todayIso();

  if (matchDate < today) {
    return true;
  }

  if (matchDate > today) {
    return false;
  }

  if (!kickOff) {
    return false;
  }

  return kickOff <= nowTimeIso();
}

/** `YYYY-MM-DD` for the UTC day `days` from now. */
export function addDaysIso(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;
}

/** Normalises a Postgres `HH:mm:ss` time to `HH:mm`, or null. */
export function shortTime(value: string | null | undefined): string | null {
  return value ? value.slice(0, 5) : null;
}

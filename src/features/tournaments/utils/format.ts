import { formatLongDate } from "@/features/dashboard/utils/format-date";

export function formatTournamentDateRange(
  startDate: string,
  endDate: string | null
): string {
  if (!endDate || endDate === startDate) {
    return formatLongDate(startDate);
  }

  return `${formatLongDate(startDate)} – ${formatLongDate(endDate)}`;
}

export function formatTimeRange(
  startTime: string | null,
  endTime: string | null
): string {
  const start = startTime?.slice(0, 5) ?? "";
  const end = endTime?.slice(0, 5) ?? "";

  if (start && end) {
    return `${start} – ${end}`;
  }

  return start || end || "";
}

export function formatEntryFee(entryFee: number | null): string {
  if (entryFee === null || entryFee === undefined) {
    return "Free";
  }

  if (entryFee <= 0) {
    return "Free";
  }

  return `£${Number.isInteger(entryFee) ? entryFee : entryFee.toFixed(2)}`;
}

export function formatCapacity(
  accepted: number,
  maxTeams: number | null
): string {
  if (maxTeams === null || maxTeams === undefined) {
    return `${accepted} joined`;
  }

  return `${accepted}/${maxTeams} teams`;
}

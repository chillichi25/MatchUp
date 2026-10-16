/**
 * Display helpers for the raw team values stored by the legacy backend.
 * The database stores mixed representations (e.g. `U12`, `male`, `7`), so
 * these normalise them for the UI. They are pure functions and unit tested.
 */

export function formatAgeGroup(value?: string | null): string {
  if (!value) return "";

  const trimmed = value.trim();

  if (/^u\d+$/i.test(trimmed)) {
    return `Under ${trimmed.slice(1)}`;
  }

  return trimmed;
}

export function formatGender(value?: string | null): string {
  if (!value) return "";

  switch (value.trim().toLowerCase()) {
    case "male":
      return "Boys";
    case "female":
      return "Girls";
    case "mixed":
      return "Mixed";
    default:
      return value.trim();
  }
}

export function formatMatchFormat(value?: string | null): string {
  if (!value) return "";

  const trimmed = value.trim();

  if (/^\d+$/.test(trimmed)) {
    return `${trimmed}v${trimmed}`;
  }

  return trimmed;
}

export function formatTeamDetails(team: {
  age_group?: string | null;
  gender?: string | null;
  match_format?: string | null;
}): string {
  return [
    formatAgeGroup(team.age_group),
    formatGender(team.gender),
    formatMatchFormat(team.match_format),
  ]
    .filter(Boolean)
    .join(" · ");
}

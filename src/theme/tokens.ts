export const colors = {
  brand: "#00B83F",
  brandDark: "#009F37",
  brandDeep: "#00A638",
  brandSoft: "#E4F9EB",
  brandSofter: "#EAFBF0",

  ink: "#07192D",

  page: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F5F9",

  border: "#E2E8F0",
  borderStrong: "#CBD5E1",

  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  textDisabled: "#94A3B8",

  success: "#00B83F",
  danger: "#DC2626",
  warning: "#D97706",
  info: "#2563EB",
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 20,
  "3xl": 24,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
} as const;

export type ColorToken = keyof typeof colors;

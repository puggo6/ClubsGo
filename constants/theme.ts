export const COLORS = {
  primary: "#00C2FF",
  accentA: "#C471ED",
  accentB: "#f64f59",
  background: "#121212",
  surface: "#1C1F26", //"", (old style just in case)
  surfaceLight: "#2A2A2A",
  surfaceAlternate: "#2F2F3B",
  surfaceBlue: "#1F2235",
  surfaceTwo: "#1a1a1a",
  surfaceThree: "#1c1c1c",
  surfaceIcon: "#2A2F3A",
  white: "#FFFFFF",
  grey: "#9CA3AF",
  textPrimary: "#EDEDED",
  textSecondary: "#A1A1AA",
  textMuted: "#6B7280",
  textLight: "#E0E0E0",
  textPlaceholder: "#888",
  privateRed: "#e83d2a",
  deleteRed: "#CC0000",
  publicGreen: "#3CB371",
  open: "#26A69A",
  restricted: "#7E57C2",
  cancelled: "#5523ac",
  userColor: "#FFB300",
} as const;

export const CLUB_COLORS = [
  // Reds / Warm
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber

  // Greens
  "#22C55E", // Green
  "#10B981", // Emerald
  "#14B8A6", // Teal

  // Blues
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#2563EB", // Royal Blue

  // Purples
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#A855F7", // Purple

  // Pink / Rose
  "#EC4899", // Pink
  "#F43F5E", // Rose

  // Unique
  "#84CC16", // Lime
  "#EAB308", // Yellow
  "#D946EF", // Fuchsia
  "#64748B", // Slate
];
export function getRandomColor() {
  return CLUB_COLORS[Math.floor(Math.random() * CLUB_COLORS.length)];
}

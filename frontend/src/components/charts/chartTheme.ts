import type { Mood } from "@/types";

/** Chart surface the palettes below were validated against (dark card background). */
export const CHART_SURFACE = "#101736";

/**
 * Mood hues stepped into the dark-mode lightness band (validated with the dataviz
 * palette checker against CHART_SURFACE). Same hue families as the UI mood tints.
 */
export const MOOD_CHART_COLORS: Record<Mood, string> = {
  happy: "#199e70",
  calm: "#3987e5",
  stressed: "#9085e9",
  sad: "#d55181",
  angry: "#e66767",
  anxious: "#d95926",
};

/**
 * Slice order for the distribution donut. Of all 720 orderings this is one of the
 * few that clears the adjacent (incl. wrap-around) normal-vision floor; its CVD
 * separation sits in the 6–8 floor band, so the donut always ships with 2px
 * surface gaps and a labeled legend (secondary encoding).
 */
export const DONUT_ORDER: Mood[] = ["happy", "anxious", "calm", "sad", "stressed", "angry"];

/** Categorical series for the activity breakdown (reference palette, dark steps, fixed order). */
export const ACTIVITY_SERIES = [
  { key: "mood_checkins", label: "Check-ins", color: "#3987e5" },
  { key: "games", label: "Games", color: "#d95926" },
  { key: "activities", label: "Exercises", color: "#199e70" },
  { key: "journal_entries", label: "Journal", color: "#c98500" },
  { key: "chat_messages", label: "Chat", color: "#d55181" },
] as const;

/** Recessive axis/grid styling. */
export const AXIS_TICK = { fill: "#94a3b8", fontSize: 11 };
export const GRID_STROKE = "rgb(255 255 255 / 0.06)";
export const TREND_LINE = "#a78bfa";

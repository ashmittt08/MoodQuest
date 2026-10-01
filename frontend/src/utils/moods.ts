import type { Mood } from "@/types";

export interface MoodMeta {
  key: Mood;
  label: string;
  color: string;
  /** Short reflection shown on the Current Mood card. */
  message: string;
}

export const MOODS: MoodMeta[] = [
  { key: "happy", label: "Happy", color: "#34d399", message: "You're glowing today!" },
  { key: "calm", label: "Calm", color: "#38bdf8", message: "You seem relaxed today!" },
  { key: "stressed", label: "Stressed", color: "#a78bfa", message: "Take a breath — you've got this." },
  { key: "sad", label: "Sad", color: "#f472b6", message: "It's okay to have heavy days." },
  { key: "angry", label: "Angry", color: "#f43f5e", message: "Let's find a way to release it." },
  { key: "anxious", label: "Anxious", color: "#fb923c", message: "One slow breath at a time." },
];

export const MOOD_BY_KEY = Object.fromEntries(MOODS.map((m) => [m.key, m])) as Record<Mood, MoodMeta>;

export function moodMeta(mood: Mood | null | undefined): MoodMeta | null {
  return mood ? MOOD_BY_KEY[mood] ?? null : null;
}

/** Labels for the 1–5 mood score axis used by trend charts. */
export const SCORE_LABELS: Record<number, string> = {
  1: "Low",
  2: "Uneasy",
  3: "Okay",
  4: "Calm",
  5: "Great",
};

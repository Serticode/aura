export const moods = [
  "Overwhelmed",
  "Low",
  "Tired",
  "Anxious",
  "Okay",
  "Hopeful",
  "Content",
] as const;

export type Mood = (typeof moods)[number];
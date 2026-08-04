/** Client-safe timeline category helpers (no DB imports). */

export const TIMELINE_CATEGORIES = [
  "experience",
  "education",
  "achievement",
  "certificate",
  "other",
] as const;

export type TimelineCategory = (typeof TIMELINE_CATEGORIES)[number];

export const TIMELINE_CATEGORY_LABELS: Record<TimelineCategory, string> = {
  experience: "Experience",
  education: "Education",
  achievement: "Achievement",
  certificate: "Certificate",
  other: "Other",
};

export const TIMELINE_CATEGORY_OPTIONS = TIMELINE_CATEGORIES.map((value) => ({
  value,
  label: TIMELINE_CATEGORY_LABELS[value],
}));

export function isTimelineCategory(value: unknown): value is TimelineCategory {
  return (
    typeof value === "string" &&
    (TIMELINE_CATEGORIES as readonly string[]).includes(value)
  );
}

export function normalizeTimelineCategory(
  value: unknown,
): TimelineCategory {
  return isTimelineCategory(value) ? value : "experience";
}

/** Client-safe journey timeline types (no DB imports). */

export const JOURNEY_TYPES = [
  "experience",
  "education",
  "certification",
  "achievement",
] as const;

export type JourneyType = (typeof JOURNEY_TYPES)[number];

export type JourneyItem = {
  id: string;
  type: JourneyType;
  title: string;
  subtitle?: string;
  description?: string;
  /** ISO date string */
  startDate: string;
  /** ISO date string; null = ongoing or single-date event */
  endDate?: string | null;
  order?: number;
  /** Education highlights (first shown inline, rest as +N more) */
  highlights?: string[];
  /** Certification credential URL */
  credentialUrl?: string;
};

export const JOURNEY_TYPE_LABELS: Record<JourneyType, string> = {
  experience: "Experience",
  education: "Education",
  certification: "Certification",
  achievement: "Achievement",
};

export const JOURNEY_TYPE_LABELS_PLURAL: Record<JourneyType, string> = {
  experience: "Experience",
  education: "Education",
  certification: "Certifications",
  achievement: "Achievements",
};

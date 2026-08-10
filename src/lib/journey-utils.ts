import type {
  AchievementData,
} from "@/lib/achievements";
import type { CertificationData } from "@/lib/certifications";
import type { EducationData } from "@/lib/education";
import type { ExperienceData } from "@/lib/experience";
import type { JourneyItem } from "@/lib/journey-types";

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

/** Parse education year strings like "June 2022" or "2020" into a Date. */
export function parseEducationYear(year: string): Date {
  const trimmed = year.trim();
  const yearMatch = trimmed.match(/(19|20)\d{2}/);
  const y = yearMatch ? Number(yearMatch[0]) : new Date().getFullYear();
  const monthToken = trimmed
    .replace(/(19|20)\d{2}/, "")
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();
  const month = MONTHS[monthToken] ?? 5;
  return new Date(Date.UTC(y, month, 1));
}

function isValidIsoDate(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

/**
 * Normalize Experience / Education / Certification / Achievement into one
 * chronological journey feed (most recent first). Pure — no DB.
 */
export function buildJourneyItems(input: {
  experience: ExperienceData[];
  education: EducationData[];
  certifications: CertificationData[];
  achievements: AchievementData[];
}): JourneyItem[] {
  const items: JourneyItem[] = [];

  for (const item of input.experience) {
    items.push({
      id: `experience-${item.id}`,
      type: "experience",
      title: item.role,
      subtitle: item.company,
      description: item.bullets.slice(0, 2).join(" "),
      startDate: item.startDate,
      endDate: item.endDate,
      order: item.order,
    });
  }

  for (const item of input.education) {
    const start = parseEducationYear(item.year);
    items.push({
      id: `education-${item.id}`,
      type: "education",
      title: item.degree,
      subtitle: item.institution,
      description: item.highlights[0],
      startDate: start.toISOString(),
      endDate: start.toISOString(),
      highlights: item.highlights,
    });
  }

  for (const item of input.certifications) {
    if (!isValidIsoDate(item.date)) continue;
    items.push({
      id: `certification-${item.id}`,
      type: "certification",
      title: item.title,
      subtitle: item.provider,
      startDate: item.date,
      endDate: item.date,
      order: item.order,
      credentialUrl: item.credentialUrl || undefined,
      imageUrl: item.imageUrl || undefined,
    });
  }

  for (const item of input.achievements) {
    if (!isValidIsoDate(item.date)) continue;
    items.push({
      id: `achievement-${item.id}`,
      type: "achievement",
      title: item.title,
      description: item.description,
      startDate: item.date,
      endDate: item.date,
      order: item.order,
      imageUrl: item.imageUrl || undefined,
    });
  }

  return items.sort((a, b) => {
    const diff =
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    if (diff !== 0) return diff;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

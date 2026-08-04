import { getAchievements } from "@/lib/achievements";
import { getCertifications } from "@/lib/certifications";
import { getEducationRecords } from "@/lib/education";
import { getExperienceRecords } from "@/lib/experience";
import { buildJourneyItems } from "@/lib/journey-utils";
import type { JourneyItem } from "@/lib/journey-types";

export type { JourneyItem, JourneyType } from "@/lib/journey-types";
export {
  JOURNEY_TYPES,
  JOURNEY_TYPE_LABELS,
  JOURNEY_TYPE_LABELS_PLURAL,
} from "@/lib/journey-types";
export { buildJourneyItems, parseEducationYear } from "@/lib/journey-utils";

/**
 * Fetch and merge Experience, Education, Certification, and Achievement
 * into one chronological journey feed. Collections stay unchanged.
 */
export async function getJourneyItems(): Promise<JourneyItem[]> {
  const [experience, education, certifications, achievements] =
    await Promise.all([
      getExperienceRecords(),
      getEducationRecords(),
      getCertifications(),
      getAchievements(),
    ]);

  return buildJourneyItems({
    experience,
    education,
    certifications,
    achievements,
  });
}
